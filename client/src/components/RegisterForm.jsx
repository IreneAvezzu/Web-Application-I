import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Tutti i campi sono obbligatori.');
      return;
    }

    if (password.length < 5) {
      setErrorMsg('La password deve contenere almeno 5 caratteri.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Le password inserite non corrispondono.');
      return;
    }

    try {
      await registerUser(username, password);
      setSuccessMsg('Account creato con successo! Verrai reindirizzato al login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.error || 'Impossibile completare la registrazione.');
    }
  };

  return (
    <div className="row justify-content-center my-5">
      <div className="col-sm-10 col-md-6 col-lg-4">
        <div className="card shadow-lg border-0 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <div className="card-body p-4 p-md-5">
            <h3 className="card-title text-center mb-4 fw-bold" style={{ color: '#b31c33' }}>Registrati</h3>

            {errorMsg && (
              <div className="alert alert-danger p-2 small text-center rounded-3" role="alert">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success p-2 small text-center rounded-3" role="alert">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Username</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Scegli un username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!!successMsg}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control rounded-start-3"
                    placeholder="Minimo 5 caratteri"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!!successMsg}
                  />
                  <button
                    className="btn btn-outline-secondary rounded-end-3 d-flex align-items-center"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={!!successMsg}
                    title={showPassword ? "Nascondi password" : "Mostra password"}
                  >
                    <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary">Conferma Password</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control rounded-start-3"
                    placeholder="Ripeti la password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!!successMsg}
                  />
                  <button
                    className="btn btn-outline-secondary rounded-end-3 d-flex align-items-center"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={!!successMsg}
                    title={showConfirmPassword ? "Nascondi password" : "Mostra password"}
                  >
                    <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn text-white w-100 fw-bold py-2 rounded-3 mb-3 border-0" 
                disabled={!!successMsg}
                style={{ backgroundColor: '#b31c33', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#911325'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#b31c33'}
              >
                Registrati
              </button>
            </form>

            <div className="text-center small text-muted">
              Hai già un account? <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#b31c33' }}>Accedi qui</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;