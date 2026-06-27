import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { startGame, validateGame } from '../services/api';
import SetupPhase from './SetupPhase';
import PlanningPhase from './PlanningPhase';
import ExecutionPhase from './ExecutionPhase';
import ResultPhase from './ResultPhase';
import logoTeatro from '../assets/theater-mask.png';
import logoAncora from '../assets/anchor.png';
import logoBarca from '../assets/boat_black.png';



function GameManager({ user, setIsGameActive, abortTrigger }) {
  // states to handel game flow
  const [gameState, setGameState] = useState('SETUP'); // possible values: SETUP, PLANNING, EXECUTION, RESULT
  const [gameId, setGameId] = useState(null);
  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');
  const [connectionsList, setConnectionsList] = useState([]);
  
  // states to store player's choices and results
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [validationResult, setValidationResult] = useState(null);

  // managa game status
  useEffect(() => {
    if (gameState === 'PLANNING' || gameState === 'EXECUTION') {
      setIsGameActive(true);
    } else {
      setIsGameActive(false);
    }
    return () => setIsGameActive(false);
  }, [gameState, setIsGameActive]);

  useEffect(() => {
    if (abortTrigger > 0) {
      setGameState('SETUP');
      setSelectedRoute([]);
      setValidationResult(null);
    }
  }, [abortTrigger]);

  // start a new game (SETUP phase)
  const handleStartMatch = async () => {
    try {
      const data = await startGame(); // execute POST /api/games/start
      
      setGameId(data.gameId);
      setStartStation(data.startStation);
      setEndStation(data.endStation);
      setConnectionsList(data.connectionsList);
      
      // reset data coming from previous games
      setSelectedRoute([]);
      setValidationResult(null);
      
      // move to next phase - planning
      setGameState('PLANNING');
    } catch (err) {
      console.error("Errore durante l'avvio del match:", err);
      alert("Impossibile avviare la partita. Riprova.");
    }
  };

  // send chosen route (PLANNING phase)
  const handleRouteSubmit = async (routeToSend) => {
    try {
      // prep payload
      const payload = {
        route: routeToSend,
        startStation: startStation,
        endStation: endStation
      };

      const result = await validateGame(gameId, payload); // executes POST /api/games/:id/validate
      setValidationResult(result);
      
      // move to next phase -> execution
      setGameState('EXECUTION');
    } catch (err) {
      console.error("Errore durante la validazione del percorso:", err);
      setValidationResult({ valid: false, score: 0, stages: [] });
      setGameState('EXECUTION');
    }
  };

  // reset everything and play again (RESULT phase)
  const handlePlayAgain = () => {
    setGameState('SETUP');
  };

  // if user is not logged in, we show only an invitation to log in (or the basic instructions)
  if (!user) {
    return (
      <div className="row justify-content-center my-5">
        <div className="col-lg-9 col-xl-8">
          <div className="card shadow-lg border-0 rounded-4 bg-white" style={{ '--bs-bg-opacity': 0.95 }}>
            <div className="card-body p-4 p-md-5">
              
              <div className="text-center mb-4 pb-3 border-bottom">
                <h1 className="display-4 fw-bold text-dark mb-2">
                  <img 
                    src={logoBarca} 
                    alt="Logo L'Ultima Corsa" 
                    style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
                  />   L'Ultima Corsa</h1>
                <p className="lead text-secondary tracking-wide fw-semibold">Edizione Serenissima</p>
              </div>

              <p className="lead text-dark fst-italic text-center mb-4 border-bottom pb-4 px-2">
                "Hai presente il romanticismo dei canali, i tramonti in Piazza San Marco e la poesia delle gondole? <strong>Dimenticali.</strong> È notte fonda, l'ultimo vaporetto sta per partire, hai solo <strong>20 monete</strong> in tasca e devi assolutamente tornare a casa dall'altra parte della laguna prima di rimanere a piedi. Muoviti, la nebbia si alza e i canali nascondono mille imprevisti!"
              </p>

              <h4 className="fw-bold mb-3 mt-4" style={{ color: '#b31c33' }}>
                <i className="bi bi-map"></i> Fase 1: Il Sopralluogo (Setup)
              </h4>
              <p className="text-muted small mb-4">
                Prima di lanciarti alla cieca, ti diamo un attimo di respiro. Potrai studiare l'intera mappa della rete dei vaporetti con tutte le linee (Rossa, Blu, Verde, Gialla) e le fermate d'interscambio. Memorizzala bene, perché non durerà...
              </p>

              <h4 className="fw-bold mb-3 mt-4" style={{ color: '#b31c33' }}>
                <i class="bi bi-hourglass-split"></i> Fase 2: Il Panico del Turista (Pianificazione)</h4>
              <p className="text-muted small mb-3">
                Il server (che stasera fa la parte del controllore burbero) ti assegna una fermata di partenza (es. <em>Rialto</em>) e una di arrivo ben lontana (es. <em>Campo Santa Marghe</em>). Ora scatta il dramma: hai esattamente <strong>90 secondi</strong> per pianificare il percorso.
              </p>
              <ul className="text-muted small mb-4">
                <li className="mb-1">La mappa mostrerà solo i nomi delle fermate, ma <strong>le linee colorate spariranno!</strong></li>
                <li className="mb-1">Dovrai scorrere l'elenco delle tratte e ricostruire il tragitto a mente, selezionando i collegamenti uno dopo l'altro.</li>
                <li><em>Occhio:</em> Puoi cambiare linea solo nelle stazioni di interscambio. Se scade il tempo, vieni imbarcato di peso sul percorso che sei riuscito a fare fin lì. Se è incompleto o sbagliato? <strong>Punteggio azzerato</strong> e ti tocca farti la laguna a nuoto!</li>
              </ul>

              <h4 className="fw-bold mb-3 mt-4" style={{ color: '#b31c33' }}>
                <i class="bi bi-dice-5-fill"></i> Fase 3: Il Canale degli Imprevisti (Esecuzione)
              </h4>
              <p className="text-muted small mb-3">
                Se il tuo percorso è valido, si parte! L'app verificherà la tua rotta tappa per tappa. Ad ogni fermata, il destino (o la sfortuna veneziana) pescherà un evento casuale che modificherà il tuo tesoro (da -4 a +4 monete).
              </p>
              <div className="bg-light rounded p-3 mb-4 border-start border-warning border-3 small">
                <div className="mb-2"> <em>“Acqua alta improvvisa! Devi comprare gli stivali di gomma dal venditore ambulante: -3 monete”</em> <i class="bi bi-ban"></i></div>
                <div className="mb-2"> <em>“Sciopero improvviso dell'ACTV! Devi prendere un taxi costoso: -2 monete”</em> <i class="bi bi-ban"></i></div>
                <div className="mb-2"> <em>“Festival del cinema: la folla è enorme, ma l'atmosfera è magica: +1 monete”</em> <i class="bi bi-coin"></i></div>
                <div> <em>“Incontri un passeggero gentile che ti offre un'ombra di vino e un cicchetto: +2 monete”</em> <i class="bi bi-coin"></i><i class="bi bi-coin"></i></div>
              </div>

              <h4 className="fw-bold mb-3 mt-4" style={{ color: '#b31c33' }}>
                <i class="bi bi-trophy-fill"></i> Fase 4: La Trattoria o il Convento (Risultato)
              </h4>
              <p className="text-muted small mb-4">
                Se arrivi a destinazione, le monete rimaste saranno il tuo punteggio finale (se finisci sotto zero, l'orgoglio si ferma comunque a 0). I tuoi punteggi migliori finiranno dritti nella <strong>Tabella dei Campioni della Laguna</strong> per mostrare a tutti chi è il vero re dei vaporetti.
              </p>

              <div className="alert alert-warning text-center mt-5 p-4 border-dashed">
                <h5 className="fw-bold mb-2">
                  <img 
                    src={logoAncora} 
                    alt="Logo L'Ultima Corsa" 
                    style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
                  />

                   Navigazione in modalità anonima</h5>
                <p className="small mb-3 text-dark">
                  Se navighi in modalità anonima senza fare il login... beh, puoi solo leggere questa pergamena e guardare con invidia i marinai esperti. Login obbligatorio per imbarcarsi!
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // conditional rendering based on game phase
  switch (gameState) {
    case 'SETUP':
      return (
        <SetupPhase onStart={handleStartMatch} />
      );
    case 'PLANNING':
      return (
        <PlanningPhase 
          startStation={startStation} 
          endStation={endStation} 
          connectionsList={connectionsList}
          onSubmit={handleRouteSubmit}
        />
      );
    case 'EXECUTION':
      return (
        <ExecutionPhase 
          validationResult={validationResult} 
          onFinish={() => setGameState('RESULT')}
        />
      );
    case 'RESULT':
      return (
        <ResultPhase 
          validationResult={validationResult} 
          onRestart={handlePlayAgain}
        />
      );
    default:
      return <div>Stato di gioco non riconosciuto.</div>;
  }
}

export default GameManager;