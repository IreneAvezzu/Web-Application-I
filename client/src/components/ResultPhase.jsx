function ResultPhase({ validationResult, onRestart }) {
  const isPathValid = validationResult?.valid;
  const finalScore = validationResult?.score || 0;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card shadow border-0 p-4 text-center bg-white">
          <h2 className="fw-bold text-dark mb-4">🏁 Resoconto del Viaggio</h2>

          {isPathValid ? (
            <div className="my-3">
              <div className="display-1 text-success mb-2"><i class="bi bi-trophy-fill text-warning"></i> {finalScore}</div>
              <h4 className="fw-bold text-success">Ottimo Lavoro!</h4>
              <p className="text-muted small px-3">
                Sei riuscito ad arrivare a destinazione superando i canali di Venezia. 
                Le tue monete residue sono state salvate come punteggio per questo match!
              </p>
            </div>
          ) : (
            <div className="my-3">
              <div className="display-1 text-danger mb-2">
                 <i class="bi bi-coin"></i> 0</div>
              <h4 className="fw-bold text-danger">Match Fallito</h4>
              <p className="text-muted small px-3">
                Non hai incassato monete per questa corsa a causa di un errore nella pianificazione o dello scadere del tempo.
              </p>
            </div>
          )}

          <hr className="my-4" />

          {isPathValid && validationResult.stages && (
            <div className="mb-4 text-start">
              <h6 className="fw-bold text-secondary mb-2 text-center">Riepilogo Storico Fermate:</h6>
              <div className="border rounded overflow-auto" style={{ maxHeight: '200px' }}>
                <ul className="list-group list-group-flush small">
                  {validationResult.stages.map((stg, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center py-2">
                      <div>
                        <span className="fw-bold text-dark">{stg.tratta}</span>
                        <div className="text-muted xsmall fst-italic">"{stg.event}"</div>
                      </div>
                      <span 
                        className="badge rounded-pill text-white shadow-sm"
                        style={{ 
                          backgroundColor: stg.delta > 0 
                            ? '#2e7d32' 
                            : stg.delta < 0 
                              ? '#b31c33' 
                              : '#6c757d' 
                        }}
                      >
                        {stg.delta >= 0 ? `+${stg.delta}` : stg.delta}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="d-grid gap-2">
            <button 
              className="btn btn-lg fw-bold text-white shadow-sm border-0" 
              onClick={onRestart}
              style={{ backgroundColor: '#b31c33', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#911325'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#b31c33'}
            >
              <i className="bi bi-arrow-repeat me-1"></i> GIOCA ANCORA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPhase;