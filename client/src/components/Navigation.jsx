import { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';
import logoBarca from '../assets/boat.png';
import logoTeatro from '../assets/theater-mask.png';


function Navigation({ user, setUser, isGameActive, onAbortGame }) {
  const navigate = useNavigate();
  const [showRules, setShowRules] = useState(false);

  const handleConfirmLeave = (e, targetPath) => {
    if (isGameActive) {
      const confirmLeave = window.confirm(
        "Attenzione: abbandonando questa pagina perderai il match in corso. Vuoi continuare?"
      );
      if (!confirmLeave) {
        e.preventDefault();
        return false;
      }
      if (targetPath === '/') {
        onAbortGame();
      }
    }
    return true;
  };

  const handleLogout = async (e) => {
    if (!handleConfirmLeave(e, null)) return;

    try {
      await logout();
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error("Errore durante il logout:", err);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark shadow py-2 fixed-top" style={{ backgroundColor: '#b31c33' }}>
        <div className="container">
          <Link 
            className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" 
            to="/"
            style={{ color: '#c7b89e' }}
            onClick={(e) => handleConfirmLeave(e, '/')}>
            <img 
              src={logoBarca} 
              alt="Logo L'Ultima Corsa" 
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
            />
            Ultima Corsa
          </Link>
          
          <div className="navbar-nav me-auto align-items-center fs-5">
            <Link className="nav-link py-0" to="/" onClick={(e) => handleConfirmLeave(e, '/')}>Home</Link>
            {user && (
              <>
                <Link className="nav-link py-0 ms-3" to="/ranking" onClick={(e) => handleConfirmLeave(e, '/ranking')}>Classifica</Link>
                <button 
                  className="btn btn-link nav-link text-start border-0 p-0 ms-3" 
                  onClick={() => setShowRules(true)} 
                  style={{ background: 'none', color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}
                >
                  Istruzioni
                </button>
              </>
            )}
          </div>

          <div className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                <span className="navbar-text me-3 text-light fs-5">
                  Benvenuto, <strong style={{ color: '#c7b89e' }}>{user.username}</strong>!
                </span>
                <button className="btn btn-outline-light btn-sm px-3" onClick={(e) => handleLogout(e)}>
                  Logout
                </button>
              </>
            ) : (
              <div className="d-flex align-items-center">
                <Link className="btn btn-outline-light btn-sm me-2 px-3" to="/login">Accedi</Link>
                
                <Link 
                  className="btn btn-sm fw-bold px-3 border-0" 
                  to="/register"
                  style={{ backgroundColor: '#c7b89e', color: '#b31c33', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = '#b3a58b'; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#c7b89e'; }}
                >
                  Registrati
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showRules && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header text-white" style={{ backgroundColor: '#b31c33' }}>
                <h5 className="modal-title fw-bold" style={{ color: '#c7b89e' }}>
                  <img 
                    src={logoTeatro} 
                    alt="Logo L'Ultima Corsa" 
                    style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
                  />
            
                   Regolamento di Gara</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRules(false)}></button>
              </div>
              <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                <p className="lead text-dark fst-italic text-center mb-3 border-bottom pb-3">
                  "È notte fonda, l'ultimo vaporetto sta per partire, hai solo 20 monete in tasca e devi tornare a casa prima di rimanere a piedi!"
                </p>
                <h6 className="fw-bold text-secondary mt-3"><i class="bi bi-map"></i> Fase 1: Il Sopralluogo (Setup)</h6>
                <p className="text-muted small">Potrai studiare l'intera mappa della rete dei vaporetti con tutte le linee e le fermate d'interscambio.</p>

                <h6 className="fw-bold text-secondary mt-3"><i class="bi bi-hourglass-split"></i> Fase 2: Il Panico del Turista (Pianificazione)</h6>
                <p className="text-muted small">
                  Hai esattamente <strong>90 secondi</strong> per pianificare il percorso. Le linee colorate spariranno! Dovrai ricostruire il tragitto selezionando i collegamenti contigui a mente. Puoi cambiare linea solo nelle stazioni di interscambio.
                </p>

                <h6 className="fw-bold text-secondary mt-3"><i class="bi bi-dice-5-fill"></i> Fase 3: Il Canale degli Imprevisti (Esecuzione)</h6>
                <p className="text-muted small">
                  L'app verificherà la tua rotta tappa per tappa. Ad ogni fermata verrà pescato un evento casuale che modificherà il tuo tesoro da -4 a +4 monete.
                </p>

                <h6 className="fw-bold text-secondary mt-3"><i class="bi bi-trophy-fill"></i> Fase 4: La Trattoria o il Convento (Risultato)</h6>
                <p className="text-muted small">
                  Le monete rimaste saranno il tuo punteggio finale salvato direttamente nella Tabella dei Campioni della Laguna. Se scade il tempo o sbagli rotta, il punteggio della partita sarà azzerato.
                </p>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-dark fw-bold px-4" onClick={() => setShowRules(false)}>Torna alla Corsa</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;