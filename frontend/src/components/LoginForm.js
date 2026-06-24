// src/components/LoginForm.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';

const LoginForm = ({ onLogin, onSignUp }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'E-mail é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'E-mail inválido';
    if (isSignUp) {
      if (!formData.username) newErrors.username = 'Usuário é obrigatório';
      else if (formData.username.length < 3) newErrors.username = 'Usuário deve ter pelo menos 3 caracteres';
      if (!formData.password) newErrors.password = 'Senha é obrigatória';
      else if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    } else {
      if (!formData.password) newErrors.password = 'Senha é obrigatória';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    setGeneralError('');

    try {
      const endpoint = isSignUp ? '/api/register' : '/api/login';
      const payload = isSignUp 
        ? { username: formData.username, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (res.ok) {
        if (isSignUp) {
          setGeneralError('✅ Cadastro realizado! Faça login para continuar.');
          setIsSignUp(false);
          setFormData({ username: '', email: '', password: '', confirmPassword: '' });
          setErrors({});
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLogin(data.user.username, data.user.email);
        }
      } else {
        setGeneralError(data.error || 'Erro na requisição');
      }
    } catch (err) {
      setGeneralError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setGeneralError('');
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
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
                <FiMail className="input-icon" />
                <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
              </div>
              {errors.email && <ErrorMessage><FiAlertCircle /> {errors.email}</ErrorMessage>}
              <div className="field">
                <FiLock className="input-icon" />
                <input type="password" name="password" placeholder="Senha" value={formData.password} onChange={handleChange} required />
              </div>
              {errors.password && <ErrorMessage><FiAlertCircle /> {errors.password}</ErrorMessage>}
              {generalError && <ErrorMessage><FiAlertCircle /> {generalError}</ErrorMessage>}
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
                <FiUser className="input-icon" />
                <input type="text" name="username" placeholder="Usuário" value={formData.username} onChange={handleChange} required />
              </div>
              {errors.username && <ErrorMessage><FiAlertCircle /> {errors.username}</ErrorMessage>}
              <div className="field">
                <FiMail className="input-icon" />
                <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
              </div>
              {errors.email && <ErrorMessage><FiAlertCircle /> {errors.email}</ErrorMessage>}
              <div className="field">
                <FiLock className="input-icon" />
                <input type="password" name="password" placeholder="Senha (mínimo 6 caracteres)" value={formData.password} onChange={handleChange} required />
              </div>
              {errors.password && <ErrorMessage><FiAlertCircle /> {errors.password}</ErrorMessage>}
              <div className="field">
                <FiLock className="input-icon" />
                <input type="password" name="confirmPassword" placeholder="Confirmar senha" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
              {errors.confirmPassword && <ErrorMessage><FiAlertCircle /> {errors.confirmPassword}</ErrorMessage>}
              {generalError && <ErrorMessage><FiAlertCircle /> {generalError}</ErrorMessage>}
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

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

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
    color: #aaa;
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