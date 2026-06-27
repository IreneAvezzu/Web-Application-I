import { useState } from 'react';
import logoAncora from '../assets/anchor.png';
import logoTeatro from '../assets/theater-mask.png';


function ExecutionPhase({ validationResult, onFinish }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const STARTING_COINS = 20;

  // Se il server ha decretato che il percorso non è valido fin dal principio
  if (!validationResult || !validationResult.valid) {
    return (
      <div className="card shadow border-0 p-4 text-center bg-white">
        <h2 className="text-danger fw-bold mb-3"><i class="bi bi-x-circle"></i> Percorso Non Valido!</h2>
        <div className="alert alert-danger px-4 py-3 small inline-block mx-auto">
          Il percorso pianificato non rispetta le regole della rete di vaporetti, non hai raggiunto la destinazione finale, 
          oppure il tempo è scaduto prima di poter completare il percorso.
        </div>
        <p className="text-muted my-3">Punteggio ottenuto per questo match: <strong>0 monete</strong>.</p>
        <button 
          className="btn fw-bold px-5 mt-2 text-white border-0" 
          onClick={onFinish}
          style={{ backgroundColor: '#b31c33', transition: 'background-color 0.2s' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#911325'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#b31c33'}
        >
          Guarda Riepilogo
        </button>
      </div>
    );
  }

  const { stages, score } = validationResult;
  const activeStage = stages[currentStageIdx];

  // evaluate current coin count before procedings
  const getCurrentCoinsBeforeStage = () => {
    let coins = STARTING_COINS;
    for (let i = 0; i < currentStageIdx; i++) {
      coins += stages[i].delta;
    }
    return coins;
  };

  const previousCoins = getCurrentCoinsBeforeStage();
  const currentCoins = previousCoins + (activeStage ? activeStage.delta : 0);

  const handleNextStage = () => {
    if (currentStageIdx < stages.length - 1) {
      setCurrentStageIdx(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="row justify-content-center my-4">
      <div className="col-12 col-md-10">
        <div className="card shadow-lg border-0 p-4 rounded-4 bg-white">
          
          <div className="row">
            {/* left side - current stop, coin count and bonus/malus */}
            <div className="col-md-6 border-end">
              
              <div className="p-3 rounded-3 mb-4 text-center text-white shadow-sm" style={{ backgroundColor: '#b31c33' }}>
                <span className="small text-uppercase text-light opacity-75 d-block">Bilancio Monete Attuale</span>
                <div className="display-4 fw-bold text-white"><i class="bi bi-coin"></i> {currentCoins}</div>
                <div className="small text-light opacity-75">
                  Fermata precedente: {previousCoins} ({activeStage.delta >= 0 ? `+${activeStage.delta}` : activeStage.delta})
                </div>
              </div>

              <div className="card mb-4 shadow-sm bg-light" style={{ borderColor: '#b31c33' }}>
                <div className="card-header fw-bold small text-white" style={{ backgroundColor: '#b31c33' }}>
                  TAPPA {currentStageIdx + 1} DI {stages.length}: {activeStage.tratta}
                </div>
                <div className="card-body text-center p-4">
                  <h4 className="fw-bold mb-3 text-secondary">
                    <img 
                      src={logoTeatro} 
                      alt="Logo L'Ultima Corsa" 
                      style={{ height: '20px', width: 'auto', objectFit: 'contain' }} 
                    />
                    Cos'è successo in questa tratta?</h4>
                  <p className="lead fst-italic text-dark px-3">
                    "{activeStage.event}"
                  </p>
                  
                  <div className="mt-3 fw-bold small" style={{ color: '#b31c33' }}>
                    {activeStage.delta >= 0 ? (
                      <>
                        <i className="bi bi-gift-fill me-1" style={{ color: '#b31c33' }}></i> Guadagni +{activeStage.delta} monete!
                      </>
                    ) : (
                      <>
                        <i className="bi bi-exclamation-triangle-fill me-1" style={{ color: '#b31c33' }}></i> Perdi {activeStage.delta} monete!
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                className="btn w-100 fw-bold text-white btn-lg shadow-sm border-0" 
                onClick={handleNextStage}
                style={{ backgroundColor: '#b31c33', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#911325'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#b31c33'}
              >
                {currentStageIdx < stages.length - 1 ? (
                  <>
                    AVANZA ALLA PROSSIMA TAPPA <i className="bi bi-arrow-right text-white ms-1"></i>
                  </>
                ) : (
                  "VEDI IL RISULTATO FINALE 🏁"
                )}
              </button>
            </div>

            {/* right side - route progress */}
            <div className="col-md-6 ps-md-4">
              <h4 className="fw-bold mb-3 fs-5" style={{ color: '#b31c33' }}>
                📌 Il tuo itinerario pianificato
              </h4>
              
              <div className="p-3 border rounded-3 bg-light" style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                <ul className="list-group">
                  {stages.map((step, idx) => {
                    const isPassed = idx < currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    
                    return (
                      <li 
                        key={idx} 
                        className={`list-group-item d-flex justify-content-between align-items-center mb-2 shadow-sm rounded border-start border-4 ${
                          isCurrent ? 'bg-white fw-bold' : isPassed ? 'border-secondary bg-light opacity-75' : 'border-light bg-white'
                        }`}
                        style={isCurrent ? { borderLeftColor: '#b31c33' } : {}}
                      >
                        <span className="small text-dark d-flex align-items-center gap-2">
                          {isPassed ? (
                            <i className="bi bi-check-circle text-success fs-5"></i>
                          ) : isCurrent ? (
                            <img 
                              src={logoAncora} 
                              alt="Logo L'Ultima Corsa" 
                              style={{ height: '20px', width: 'auto', objectFit: 'contain' }} 
                            />
                          ) : (
                            <i className="bi bi-hourglass-split text-muted"></i>
                          )} 
                          {step.tratta}
                        </span>
                        
                        <span 
                          className="badge rounded-pill text-white shadow-sm"
                          style={{ 
                            backgroundColor: step.delta > 0 
                              ? '#2e7d32' 
                              : step.delta < 0 
                                ? '#b31c33' 
                                : '#6c757d' 
                          }}
                        >
                          {step.delta >= 0 ? `+${step.delta}` : step.delta}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ExecutionPhase;