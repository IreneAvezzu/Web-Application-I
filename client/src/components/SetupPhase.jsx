import { useState, useEffect } from 'react';
import { getNetwork } from '../services/api';
import imgMappa from '../assets/game_map.png'; 
import imgAncora from '../assets/anchor.png'; 

const LINE_COLORS = {
  'Blu': '#1a5c96',
  'Verde': '#2e7d32',
  'Zalo': '#bbb73f',  
  'Maron': '#6c4b2d'
};

function SetupPhase({ onStart }) {
  const [network, setNetwork] = useState({ stations: [], connections: [], lines: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNetwork() {
      try {
        const data = await getNetwork();
        setNetwork(data);
      } catch (err) {
        console.error("Errore nel caricamento della mappa:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNetwork();
  }, []);

  if (loading) {
    return <div className="text-center mt-4 text-white fw-bold">Caricamento mappa di Venezia...</div>;
  }

  return (
    <div className="row justify-content-center my-4">
      <div className="col-12 col-md-11 col-lg-11 col-xl-11">
        <div className="card shadow-lg border-0 p-4 p-md-5 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.96)' }}>
          
          {/* phase 1 instruction */}
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-3" style={{ color: '#b31c33' }}>
              <i className="bi bi-map me-2"></i>Fase 1: Esplora la Mappa e Preparati
            </h2>
            <p className="text-muted mx-auto fs-5" style={{ maxWidth: '800px' }}>
              Esamina le stazioni e i collegamenti disponibili qui sotto. Quando hai memorizzato le tratte della Laguna, avvia il match per ricevere i tuoi punti di partenza e arrivo!
            </p>
            
            <button 
              className="btn btn-lg fw-bold px-5 py-3 shadow mt-2 border-0 rounded-3" 
              onClick={onStart}
              style={{ backgroundColor: '#b31c33', color: '#ffffff', transition: 'all 0.2s', letterSpacing: '1px' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#911325'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#b31c33'; }}
            >
              Avvia il Match!
            </button>
          </div>

          {/* linked map */}
          <div className="text-center my-4 p-2 rounded-4 border bg-white shadow-sm">
            <img 
              src={imgMappa} 
              alt="Mappa Storica della Rete Vaporetti Venezia" 
              className="img-fluid rounded-3 w-100"
              style={{ 
                maxHeight: '680px', 
                objectFit: 'contain' 
              }}
            />
            <div className="small text-muted mt-2 fst-italic">
              Rete dei canali e fermate della Serenissima
            </div>
          </div>

          <hr className="my-4" style={{ opacity: '0.15' }} />

          <div className="row">
            {/* stops list */}
            <div className="col-md-6 mb-4">
              <h4 className="fw-bold mb-3 d-flex align-items-center fs-5" style={{ color: '#b31c33' }}>
                <i className="bi bi-geo-alt me-2"></i> Stazioni Disponibili
              </h4>
              <ul className="list-group list-group-flush border rounded-3 overflow-auto style-scroll" style={{ maxHeight: '320px', backgroundColor: '#fff' }}>
                {network.stations?.map(station => (
                  <li key={station.id} className="list-group-item py-2 small d-flex align-items-center gap-2">
                    <img 
                      src={imgAncora} 
                      alt="Stazione" 
                      style={{ height: '18px', width: 'auto', objectFit: 'contain' }} 
                    />
                    <span className="fw-semibold text-dark">{station.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* lines list */}
            <div className="col-md-6 mb-4">
              <h4 className="fw-bold mb-3 d-flex align-items-center fs-5" style={{ color: '#b31c33' }}>
                <i className="bi bi-signpost me-2"></i> Linee e Collegamenti
              </h4>
              <div className="border rounded-3 overflow-auto style-scroll" style={{ maxHeight: '320px', backgroundColor: '#fff' }}>
                <table className="table table-sm table-hover mb-0 align-middle">
                  <thead style={{ backgroundColor: '#f5f2eb', color: '#4a4a4a', position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th className="small fw-bold p-3 text-center" style={{ width: '80px', backgroundColor: '#f5f2eb' }}>Linea</th>
                      <th className="small fw-bold p-3" style={{ backgroundColor: '#f5f2eb' }}>Tratta Connessa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {network.connections?.map(conn => {
                      const startName = network.stations.find(s => s.id === conn.station_start_id)?.name || conn.station_start_id;
                      const endName = network.stations.find(s => s.id === conn.station_end_id)?.name || conn.station_end_id;
                      
                      const lineInfo = network.lines?.find(l => l.id === conn.line_id);
                      const dbColorName = lineInfo ? lineInfo.color : null;
                      const badgeColor = LINE_COLORS[dbColorName] || '#b31c33';

                      return (
                        <tr key={conn.id}>
                          <td className="text-center p-2">
                            <span 
                              className="badge px-2 py-1 rounded fw-bold text-white shadow-sm" 
                              style={{ backgroundColor: badgeColor }}
                            >
                              L{conn.line_id}
                            </span>
                          </td>
                          <td className="small text-dark fw-medium p-2">
                            {startName} <span style={{ color: '#b31c33' }}>⇄</span> {endName}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SetupPhase;