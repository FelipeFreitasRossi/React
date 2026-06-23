import React, { useState } from 'react';
import styled from 'styled-components';

const LoginForm = ({ onLogin, onSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim() === '' || password.trim() === '') {
      setError('Preencha todos os campos');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const endpoint = isSignUp ? '/api/register' : '/api/login';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Sucesso – armazena token e chama callback
        localStorage.setItem('token', data.token);
        if (isSignUp) {
          onSignUp(username, password);
        } else {
          onLogin(username, password);
        }
      } else {
        setError(data.error || 'Erro na requisição');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <StyledWrapper>
      <div className="container">
        <div className={`forms-container ${isSignUp ? 'slide' : ''}`}>
          {/* Login */}
          <div className="form login-form">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                </svg>
                <input
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                </svg>
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="button1" disabled={loading}>
                {loading ? 'Carregando...' : 'Login'}
              </button>
              <div className="toggle-link">
                Não tem conta? <span onClick={toggleMode}>Cadastre-se</span>
              </div>
              <button type="button" className="button3" onClick={() => alert('Recuperação em breve')}>
                Esqueceu a senha?
              </button>
            </form>
          </div>

          {/* Cadastro */}
          <div className="form signup-form">
            <h2>Cadastro</h2>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z" />
                </svg>
                <input
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                </svg>
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="button1" disabled={loading}>
                {loading ? 'Carregando...' : 'Cadastrar'}
              </button>
              <div className="toggle-link">
                Já tem conta? <span onClick={toggleMode}>Faça login</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(145deg, #f0f7ff 0%, #e0edff 100%);
  padding: 1rem;

  .container {
    background: #171717;
    border-radius: 25px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    width: 100%;
    max-width: 420px;
    overflow: hidden;
    position: relative;
  }

  .forms-container {
    display: flex;
    width: 200%;
    transform: translateX(0%);
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .forms-container.slide {
    transform: translateX(-50%);
  }

  .form {
    width: 50%;
    padding: 2.5rem 2rem 2rem;
    color: white;
    box-sizing: border-box;
  }

  .form h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 0.5em;
    border-radius: 25px;
    padding: 0.6em 1em;
    background-color: #252525;
    box-shadow: inset 2px 5px 10px rgba(0,0,0,0.5);
    margin-bottom: 1rem;
  }

  .input-icon {
    height: 1.3em;
    width: 1.3em;
    fill: #aaa;
    flex-shrink: 0;
  }

  .field input {
    background: none;
    border: none;
    outline: none;
    width: 100%;
    color: #d3d3d3;
    font-size: 1rem;
  }
  .field input::placeholder {
    color: #777;
  }

  .error-message {
    background: #ef4444;
    color: white;
    padding: 0.5rem;
    border-radius: 8px;
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1rem;
  }

  .button1 {
    width: 100%;
    padding: 0.7rem;
    border-radius: 30px;
    border: none;
    background: #3b82f6;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s;
    margin-top: 0.5rem;
  }
  .button1:hover:not(:disabled) {
    background: #2563eb;
  }
  .button1:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .toggle-link {
    text-align: center;
    margin-top: 1.2rem;
    font-size: 0.95rem;
    color: #aaa;
  }
  .toggle-link span {
    color: #3b82f6;
    cursor: pointer;
    font-weight: 600;
  }
  .toggle-link span:hover {
    text-decoration: underline;
  }

  .button3 {
    background: none;
    border: none;
    color: #888;
    font-size: 0.85rem;
    text-decoration: underline;
    cursor: pointer;
    margin-top: 0.8rem;
    width: 100%;
    text-align: center;
  }
  .button3:hover {
    color: #ef4444;
  }

  @media (max-width: 480px) {
    .form {
      padding: 1.5rem 1.2rem;
    }
  }
`;

export default LoginForm;