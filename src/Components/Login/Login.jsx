// src/Components/Login/Login.jsx
import React, { useState } from 'react';
import './Login.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = ({ onLoginSuccess }) => {
  const [Email, setEmail] = useState('');
  const [Pass, setPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Email || !Pass) {
      setError('Todos los campos son obligatorios.');
      setSuccess('');
      return;
    }
    if (Email.length < 9) {
      setError('El nombre de usuario debe tener al menos 9 caracteres.');
      setSuccess('');
      return;
    }
    if (Pass.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setSuccess('');
      return;
    }

    setError('');

    const usuarioLogin = { email: Email, pass: Pass };

    try {
      const response = await fetch('https://uaeh-control-bfbybef7bdhehkfz.mexicocentral-01.azurewebsites.net/api/Usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuarioLogin),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('nombre', data.nombre);

        onLoginSuccess(data.token, data.nombre);
        setSuccess('¡Inicio de sesión exitoso!');
        navigate('/main');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Error de conexión al servidor.');
    }
  };

  return (
    <div className="login-page">
      <div className="wrapper-login">
        <form onSubmit={handleSubmit}>
          <h1>Inicio de Sesión</h1>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="input-box-login">
            <FaUser className="icon-left" />
            <input
              type="text"
              placeholder="Username"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-box-login">
            <FaLock className="icon-left" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={Pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <span className="toggle-password" onClick={toggleShowPassword}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">Iniciar Sesión</button>

          <div className="register-link-login">
            <p>
              ¿Aún no tienes una cuenta? <Link to="/Register">Registrarse</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
