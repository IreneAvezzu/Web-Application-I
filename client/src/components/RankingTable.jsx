import { useState, useEffect } from 'react';
import { getRanking } from '../services/api';

function RankingTable() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchRankingData() {
      try {
        const data = await getRanking(); // get scores results { username, maxScore }
        setRanking(data);
      } catch (err) {
        console.error("Errore nel recupero della classifica:", err);
        setErrorMsg('Non è stato possibile caricare la classifica dei piloti.');
      } finally {
        setLoading(false);
      }
    }
    fetchRankingData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Caricamento classifica...</span>
        </div>
        <p className="text-muted mt-2 small">Aggiornamento dei tabelloni di Venezia...</p>
      </div>
    );
  }

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-md-10 col-lg-8">
        <div className="card shadow-lg border-0 bg-white rounded-4">
          <div className="card-body p-4 p-md-5">
            
            <h3 className="fw-bold text-center mb-4 d-flex align-items-center justify-content-center gap-2" style={{ color: '#b31c33' }}>
              <i className="bi bi-trophy-fill"></i> Campioni della Laguna
            </h3>

            {errorMsg && <div className="alert alert-danger text-center small">{errorMsg}</div>}

            {ranking.length === 0 ? (
              <p className="text-muted text-center my-4">Nessun record registrato finora. Sii il primo a salpare!</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '20%' }} className="text-center">Posizione</th>
                      <th>Capitano</th>
                      <th style={{ width: '25%' }} className="text-end">Record Monete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((row, index) => {
                      let badgeColor = "bg-secondary"; // grey 4th to last 
                      let rowStyle = "";
                      
                      if (index === 0) {
                        badgeColor = "bg-warning text-dark"; // gold 1st
                        rowStyle = "table-warning fw-bold";
                      } else if (index === 1) {
                        badgeColor = "bg-light text-dark border"; // silver 2nd
                      } else if (index === 2) {
                        badgeColor = "bg-danger text-white"; // bronze 3rd
                      }

                      return (
                        <tr key={index} className={rowStyle}>
                          <td className="text-center">
                            <span className={`badge rounded-pill px-2 py-1 ${badgeColor}`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td className="text-dark fw-medium">
                            {row.username}
                          </td>
                          <td className="text-end fw-bold" style={{ color: '#b31c33' }}>
                            <i className="bi bi-coin"></i> {row.maxScore}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default RankingTable;