import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css';

import bgVenezia from './assets/venice_map.jpg'; 
import Navigation from './components/Navigation';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import GameManager from './components/GameManager';
import RankingTable from './components/RankingTable';
import { getCurrentUser } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false);
  const [abortTrigger, setAbortTrigger] = useState(0);

  useEffect(() => {
    document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${bgVenezia})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedUser = await getCurrentUser();
        setUser(loggedUser);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleAbortGame = () => {
    setAbortTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento in corso...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex flex-column min-height-viewport">
        
        <Navigation user={user} setUser={setUser} isGameActive={isGameActive} onAbortGame={handleAbortGame} />
        
        {/* MAIN CONTENT based on routes */}
        <div className="container mt-4 flex-grow-1">
          <Routes>
            <Route path="/" element={
              <GameManager user={user} setIsGameActive={setIsGameActive} abortTrigger={abortTrigger} />
            } />
            <Route path="/login" element={
              user ? <Navigate to="/" /> : <LoginForm loginSuccess={(u) => setUser(u)} />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/" /> : <RegisterForm />
            } />
            <Route path="/ranking" element={
              user ? <RankingTable /> : <Navigate to="/login" />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* FOOTER */}
        <footer className="text-light py-3 mt-5 border-top border-secondary style-footer" style={{ backgroundColor: '#b31c33' }}>
          <div className="container">
            <div className="row align-items-center small text-center text-md-start gy-2">
              
              <div className="col-md-5">
                <span className="text-white-50">
                  © 2026 L'Ultima Corsa. Sviluppato per il corso di <strong className="text-white">Applicazioni Web I</strong> (PoliTo).
                </span>
              </div>
              
              <div className="col-md-7 text-md-end">
                <div className="d-inline-flex flex-wrap gap-3 justify-content-center justify-content-md-end">
                  
                  <a href="/AW1_esame1_UltimaCorsa.pdf" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-light-50 hover-white">
                    <i className="bi bi-file-earmark-pdf me-1" style={{ color: '#c7b89e' }}></i> Specifiche Progetto
                  </a>
                  
                  <a href="https://github.com/polito-aw1-2026-exams/esame1-ultima-corsa-IreneAvezzu" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-light-50 hover-white">
                    <i className="bi bi-code-slash me-1" style={{ color: '#c7b89e' }}></i> Repository
                  </a>
                  
                  <a href="https://github.com/IreneAvezzu" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-light-50 hover-white">
                    <i className="bi bi-github me-1" style={{ color: '#c7b89e' }}></i> GitHub
                  </a>
                  
                  <a href="mailto:s358326@studenti.polito.it" className="text-decoration-none text-light-50 hover-white">
                    <i className="bi bi-envelope me-1" style={{ color: '#c7b89e' }}></i> s358326@studenti.polito.it
                  </a>
                  
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;