import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from "../services/api";

function LoginForm({ loginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Tutti i campi sono obbligatori.');
      return;
    }

    try {
      const user = await login(username, password);
      loginSuccess(user);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.error || 'Username o password errati.');
    }
  };

  return (
    <div className="row justify-content-center my-5">
      <div className="col-sm-10 col-md-6 col-lg-4">
        <div className="card shadow-lg border-0 rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <div className="card-body p-4 p-md-5">
            <h3 className="card-title text-center mb-4 fw-bold" style={{ color: '#b31c33' }}>Accedi a Venezia</h3>
            
            {errorMsg && (
              <div className="alert alert-danger p-2 small text-center rounded-3" role="alert">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Username</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Es. gino"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary">Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control rounded-start-3"
                    placeholder="Inserisci la tua password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="btn btn-outline-secondary rounded-end-3 d-flex align-items-center"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Nascondi password" : "Mostra password"}
                  >
                    <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn text-white w-100 fw-bold py-2 rounded-3 mb-3 border-0"
                style={{ backgroundColor: '#b31c33', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#911325'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#b31c33'}
              >
                Entra in gioco
              </button>
            </form>

            <div className="text-center small text-muted">
              Non hai un account? <Link to="/register" className="fw-bold text-decoration-none" style={{ color: '#b31c33' }}>Registrati qui</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;