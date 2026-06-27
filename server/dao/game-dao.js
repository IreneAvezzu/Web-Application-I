import db from './db.js';

// gather network data (stations, lines, connections)
export function getNetworkData() {
  return new Promise((resolve, reject) => {
    const pStations = new Promise((res, rej) => db.all('SELECT * FROM stations', (err, r) => err ? rej(err) : res(r)));
    const pConnections = new Promise((res, rej) => db.all('SELECT * FROM connections', (err, r) => err ? rej(err) : res(r)));

    Promise.all([pStations, pConnections])
      .then(([stations, connections]) => resolve({ stations, connections }))
      .catch(err => reject(err));
  });
}

// gather all possible events
export function getAllEvents() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM events';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// save game status
export function saveGameResult(userId, score) {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO games (user_id, score) VALUES (?, ?)';
    db.run(sql, [userId, score], function (err) {
      if (err) reject(err);
      else resolve(this.lastID); // returns new game ID
    });
  });
}