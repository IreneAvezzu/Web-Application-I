import { useState, useEffect, useRef } from 'react';
import imgRunning from '../assets/running.png';
import imgAncora from '../assets/anchor.png';
import imgMappa from '../assets/map_game_plain.png';

// dictionary for colours
const LINE_COLORS = {
  1: '#1a5c96', // Blu
  2: '#2e7d32', // Verde
  3: '#bbb73f', // Zalo
  4: '#6c4b2d'  // Maron
};

function PlanningPhase({ startStation, endStation, connectionsList, onSubmit }) {
  const [timeLeft, setTimeLeft] = useState(90); // 90 sec timer
  const [currentRoute, setCurrentRoute] = useState([]); // selected stops array [{station_start, station_end, line_id}]
  const [currentLocation, setCurrentLocation] = useState(startStation); // current user location
  const [visitedStations, setVisitedStations] = useState(new Set([startStation])); // prevent loops
  
  // user ref to have always the latest value of currentRoute inside the timer callback
  const currentRouteRef = useRef(currentRoute);
  useEffect(() => {
    currentRouteRef.current = currentRoute;
  }, [currentRoute]);

  // manage 90 sec timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmit(currentRouteRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSubmit]);

  // select route
  const handleSelectConnection = (conn) => {
    let fromStation = '';
    let toStation = '';

    if (currentLocation === conn.station_start) {
      fromStation = conn.station_start;
      toStation = conn.station_end;
    } else {
      fromStation = conn.station_end;
      toStation = conn.station_start;
    }

    const newSegment = {
      station_start: fromStation,
      station_end: toStation,
      line_id: conn.line_id
    };

    const updatedRoute = [...currentRoute, newSegment];
    setCurrentRoute(updatedRoute);
    setCurrentLocation(toStation);
    
    const newVisited = new Set(visitedStations);
    newVisited.add(toStation);
    setVisitedStations(newVisited);
  };

  // reset all route selected
  const handleResetRoute = () => {
    setCurrentRoute([]);
    setCurrentLocation(startStation);
    setVisitedStations(new Set([startStation]));
  };

  // filtering logic to find adjacent connections from current user location
  const availableConnections = connectionsList ? connectionsList.filter(conn => {
    const isAtStart = conn.station_start === currentLocation && !visitedStations.has(conn.station_end);
    const isAtEnd = conn.station_end === currentLocation && !visitedStations.has(conn.station_start);
    return isAtStart || isAtEnd;
  }) : [];



  return (
    <div className="row justify-content-center my-4">
      <div className="col-12 col-md-11 col-lg-11 col-xl-11">
        <div className="card shadow-lg border-0 p-4 p-md-5 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)' }}>
          
          {/* title */}
          <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
            <div className="d-flex align-items-center gap-3">
              <img 
                  src={imgRunning} 
                  alt="Logo ancora" 
                  style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
                />
              <div>
                <h2 className="fw-bold mb-1" style={{ color: '#b31c33' }}>Fase 2: Pianifica il tuo Itinerario</h2>
                <div className="text-muted fs-5">
                  Parti da <strong style={{ color: '#b31c33' }}>{startStation}</strong> e raggiungi <strong style={{ color: '#b31c33' }}>{endStation}</strong>
                </div>
              </div>
            </div>
            
            {/* timer */}
            <div className="text-center bg-light px-4 py-2 rounded-3 border">
              <span className="small text-muted d-block text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>Tempo Rimasto</span>
              <span className="fs-2 fw-bold" style={{ color: '#b31c33' }}>
                <i className="bi bi-stopwatch me-2"></i>{timeLeft}s
              </span>
            </div>
          </div>

          <div className="row">
            {/* left side - adjecent stops */}
            <div className="col-md-6 mb-4 mb-md-0 border-end">
              <h4 className="fw-bold mb-3 d-flex align-items-center fs-5" style={{ color: '#b31c33' }}>
                <img 
                  src={imgAncora} 
                  alt="Logo ancora" 
                  style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
                />
                Stazioni adiacenti a: <span className="ms-2 fw-normal text-dark">{currentLocation}</span>
              </h4>

              {availableConnections.length === 0 ? (
                <div className="alert alert-warning border-0 shadow-sm text-center small">
                  {currentLocation === endStation ? (
                    <span className="fw-bold" style={{ color: '#b31c33' }}>🎉 Complimenti! Hai raggiunto la destinazione finale. Invia il percorso!</span>
                  ) : (
                    "Nessuna stazione adiacente disponibile non ancora visitata. Resetta il percorso."
                  )}
                </div>
              ) : (
                <div className="list-group border rounded shadow-sm overflow-auto" style={{ maxHeight: '350px' }}>
                  {availableConnections.map((conn) => {
                    const nextStation = conn.station_start === currentLocation ? conn.station_end : conn.station_start;
                    const badgeColor = LINE_COLORS[conn.line_id] || '#b31c33';

                    return (
                      <button
                        key={conn.id}
                        type="button"
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                        onClick={() => handleSelectConnection(conn)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span 
                            className="badge px-2 py-1 rounded fw-bold text-white shadow-sm"
                            style={{ backgroundColor: badgeColor }}
                          >
                            L{conn.line_id}
                          </span>
                          <span className="fw-medium text-dark">{nextStation}</span>
                        </div>
                        <i className="bi bi-plus-circle-fill fs-5" style={{ color: '#b31c33' }}></i>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* right side - user route */}
            <div className="col-md-6 ps-md-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold m-0 d-flex align-items-center fs-5" style={{ color: '#b31c33' }}>
                  <i className="bi bi-list-ol me-2"></i>Il tuo Itinerario
                </h4>
                {currentRoute.length > 0 && (
                  <button className="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3" onClick={handleResetRoute}>
                    <i className="bi bi-arrow-repeat"></i> Svuota Percorso
                  </button>
                )}
              </div>

              {currentRoute.length === 0 ? (
                <div className="border border-dashed rounded p-4 text-center text-muted small bg-light">
                  Nessuna tratta selezionata. Inizia cliccando su una linea a sinistra.
                </div>
              ) : (
                <div className="card border-0 p-3 bg-light rounded-3">
                  <div className="list-group mb-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {currentRoute.map((stage, idx) => {
                      const badgeColor = LINE_COLORS[stage.line_id] || '#b31c33';

                      return (
                        <div key={idx} className="list-group-item d-flex justify-content-between align-items-start bg-white border-0 shadow-sm mb-2 rounded p-2 small">
                          <div className="ms-2 me-auto text-dark">
                            <div>Da <strong>{stage.station_start}</strong> a <strong>{stage.station_end}</strong></div>
                          </div>
                          <span 
                            className="badge rounded-pill text-white fw-bold shadow-sm"
                            style={{ backgroundColor: badgeColor }}
                          >
                            L{stage.line_id}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    className="btn btn-lg w-100 fw-bold border-0 shadow text-white rounded-3 py-2" 
                    onClick={() => onSubmit(currentRoute)}
                    style={{ 
                      backgroundColor: '#b31c33', 
                      transition: 'all 0.2s' 
                    }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#911325'; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = '#b31c33'; }}
                  >
                    <i class="bi bi-send"></i> INVIA PERCORSO {currentLocation !== endStation && "(Incompleto)"}
                  </button>
                </div>
              )}
            </div>

            {/* map w/out connections*/}
            <div className="card shadow-sm border-0 p-2 bg-white mb-4">
              <div className="card-body p-1 text-center">
                <small className="text-muted fw-bold d-block mb-2">Mappa della Rete dei Vaporetti</small>
                <img 
                  src={imgMappa} 
                  alt="Mappa di Venezia" 
                  className="img-fluid rounded-3 border" 
                  style={{ maxHeight: '600px', width: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default PlanningPhase;