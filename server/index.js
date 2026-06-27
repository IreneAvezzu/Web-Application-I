// imports
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { calculateShortestPaths } from './utils/graph.js';
import { getNetworkData, getAllEvents, saveGameResult } from './dao/game-dao.js';
import { getUserById, getUserByCredentials, createUser } from './dao/user-dao.js';
import db from './dao/db.js';



// init express
const app = express();
const PORT = 3001; // Il server backend risponde sulla porta 3001

// cors configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // allows cookies to be sent
}));

// configure json parser for request/response body
app.use(express.json());

// configure session
app.use(session({
  secret: 'i_segreti_del_canalgrande',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, 
    sameSite: 'lax' // allows cookies to be sent in cross-origin requests
  }
}));

// initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// support method to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); 
  }
  return res.status(401).json({ error: 'Non autenticato. Effettua prima il login.' });
};

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await getUserById(id);
    cb(null, user); // Rende disponibile l'utente in req.user
  } catch (err) {
    cb(err);
  }
});

// local strategy for Passport
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  try {
    const user = await getUserByCredentials(username, password);
    if (!user) {
      // invalid credentials
      return cb(null, false, { message: 'Username o password errati.' });
    }
    // correct credentials: return user object
    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}));

// API routes
// Authentication routes
// POST /api/sessions -> Login
app.post('/api/sessions', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(info);
    
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user); // return logged user { id, username }
    });
  })(req, res, next);
});

// GET /api/sessions/current -> Verifica sessione attiva
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ error: 'Nessuna sessione attiva' });
  }
});

// DELETE /api/sessions/current -> Logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(204).end();
  });
});

// POST /api/users -> Registrazione di un nuovo utente
app.post('/api/users', async (req, res) => {
  const { username, password } = req.body;

  // check request body
  if (!username || !password || username.trim() === '' || password.trim() === '') {
    return res.status(400).json({ error: 'Username e password sono campi obbligatori.' }); // empty/missing params
  }

  try {
    // use DAO for insert
    const result = await createUser(username, password);

    // hnadle duplicates 
    if (result.error === 'DUPLICATE') {
      return res.status(409).json({ error: `Lo username '${username}' è già in uso.` }); // conflict
    }

    // success
    return res.status(201).json(result);

  } catch (err) {
    console.error('Errore durante la registrazione dell\'utente:', err);
    return res.status(500).json({ error: 'Errore interno del server durante la creazione dell\'account.' });
  }
});

// Game routes
// GET /api/network -> Recupera stazioni, linee e collegamenti fisse
app.get('/api/network', isLoggedIn, (req, res) => {
  // using Promise.all extract all network data in parallel
  const pStations = new Promise((res, rej) => db.all('SELECT * FROM stations', (err, r) => err ? rej(err) : res(r)));
  const pLines = new Promise((res, rej) => db.all('SELECT * FROM lines', (err, r) => err ? rej(err) : res(r)));
  const pConnections = new Promise((res, rej) => db.all('SELECT * FROM connections', (err, r) => err ? rej(err) : res(r)));

  Promise.all([pStations, pLines, pConnections])
    .then(([stations, lines, connections]) => {
      res.json({ stations, lines, connections });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// POST /api/games/start -> Avvia un nuovo match generandone i dettagli
app.post('/api/games/start', isLoggedIn, async (req, res) => {
  try {
    // restore stations and connections data from DB
    const { stations, connections } = await getNetworkData();

    if (stations.length < 2) {
      return res.status(500).json({ error: "Stazioni insufficienti nel database." });
    }

    let startStation = null;
    let endStation = null;
    let validPairFound = false;
    
    // try random pairs until we find a valid one (distance >= 3)
    // to avoid infinite loops in case of a disconnected network, we set a max attempts limit
    let attempts = 0;
    while (!validPairFound && attempts < 100) {
      attempts++;
      
      // pick a random starting station
      const randomStartIdx = Math.floor(Math.random() * stations.length);
      startStation = stations[randomStartIdx];

      // evaluate the shortest paths from the starting station to all reachable stations
      const shortestPaths = calculateShortestPaths(startStation.id, stations, connections);

      // filter out stations with less than 3 stops
      const validEndStations = stations.filter(s => {
        const dist = shortestPaths.get(s.id);
        return dist !== undefined && dist >= 3;
      });

      // if we have valid end stations, randomly choose one
      if (validEndStations.length > 0) {
        const randomEndIdx = Math.floor(Math.random() * validEndStations.length);
        endStation = validEndStations[randomEndIdx];
        validPairFound = true;
      }
    }

    if (!validPairFound) {
      return res.status(422).json({ 
        error: "Impossibile trovare una coppia di stazioni con distanza minima di 3 fermate. Verifica la struttura della rete." 
      });
    }

    // prepare response data (valid connectionList)
    const connectionsList = connections.map(c => {
      const startNode = stations.find(s => s.id === c.station_start_id);
      const endNode = stations.find(s => s.id === c.station_end_id);
      return {
        id: c.id,
        station_start: startNode.name,
        station_end: endNode.name,
        line_id: c.line_id
      };
    });

    // generate temporary gameId
    const generatedGameId = Math.floor(Math.random() * 10000); 

    // response body  
    res.status(200).json({
      gameId: generatedGameId,
      startStation: startStation.name,
      endStation: endStation.name,
      connectionsList: connectionsList
    });

  } catch (err) {
    console.error("Errore nell'avvio della partita:", err);
    res.status(500).json({ error: "Errore interno del server durante l'avvio della partita." });
  }
});

// POST /api/games/:id/validate -> Riceve il percorso pianificato, lo valida e calcola i punteggi
app.post('/api/games/:id/validate', isLoggedIn, async (req, res) => {
  const gameId = req.params.id;
  const { route, startStation, endStation } = req.body; // route sarà un array di oggetti tratta, es: [{station_start: "Rialto", station_end: "Squero", line_id: 3}, ...]

  try {
    // 1. Recuperiamo i dati immutabili della rete e degli eventi dal DB
    const { stations, connections } = await getNetworkData();
    const eventsList = await getAllEvents();

    let isValid = true;
    let currentStation = startStation;
    const visitedStations = new Set([startStation]);
    
    // check if route is a valid array
    if (!route || !Array.isArray(route) || route.length === 0) {
      isValid = false;
    }

    // validation algorithm 
    if (isValid) {
      for (const stage of route) {
        // check if the route start where the previous stop ended
        if (stage.station_start !== currentStation) {
          isValid = false;
          break;
        }

        // check no-loop presence
        if (visitedStations.has(stage.station_end)) {
          isValid = false;
          break;
        }

        // check route exist in connection table
        const connectionExists = connections.some(c => {
          const sStart = stations.find(s => s.id === c.station_start_id)?.name;
          const sEnd = stations.find(s => s.id === c.station_end_id)?.name;
          
          return (
            c.line_id === stage.line_id &&
            ((sStart === stage.station_start && sEnd === stage.station_end) ||
             (sStart === stage.station_end && sEnd === stage.station_start)) // consider bi-directional connections
          );
        });

        if (!connectionExists) {
          isValid = false;
          break;
        }

        // procede to next stop and mark as visited 
        currentStation = stage.station_end;
        visitedStations.add(currentStation);
      }

      // if at the end of the route we reach the end station the route can be considered valid
      if (currentStation !== endStation) {
        isValid = false;
      }
    }

    // evaluate score 
    let finalScore = 0;
    const stagesResult = [];
    const STARTING_COINS = 20; // set initial coin count 

    if (!isValid) {
      // if the route is invalid or timer was over --> 0 pt
      finalScore = 0;
      
      // save the failed game in DB
      await saveGameResult(req.user.id, finalScore);

      return res.status(200).json({
        valid: false,
        score: 0,
        stages: []
      });
    }

    // with valid route, calculate the effects events
    let currentCoins = STARTING_COINS;

    for (const stage of route) {
      // pick random event
      const randomEvent = eventsList[Math.floor(Math.random() * eventsList.length)];
      
      // apply bonus/malus
      currentCoins += randomEvent.effect_value;

      // check we don't get a negative score
      if (currentCoins < 0) currentCoins = 0;

      stagesResult.push({
        tratta: `${stage.station_start} - ${stage.station_end}`,
        event: randomEvent.description,
        delta: randomEvent.effect_value,
        currentCoins: currentCoins
      });
    }

    // final score
    finalScore = currentCoins;

    // save the game result in the database
    await saveGameResult(req.user.id, finalScore);

    // return success response
    res.status(200).json({
      valid: true,
      score: finalScore,
      stages: stagesResult
    });

  } catch (err) {
    console.error("Errore durante la validazione della partita:", err);
    res.status(518).json({ error: "Errore interno durante l'elaborazione del risultato." });
  }
});

// GET /api/ranking -> Classifica globale (Miglior punteggio di ciascun utente)
app.get('/api/ranking', isLoggedIn, (req, res) => {
  const sql = `
    SELECT users.username, MAX(games.score) as maxScore 
    FROM games 
    JOIN users ON games.user_id = users.id 
    WHERE games.score > 0
    GROUP BY users.id 
    ORDER BY maxScore DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// activate the server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});