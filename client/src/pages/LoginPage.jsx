// client/src/pages/LoginPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import styles from './LoginPage.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [inputErrors, setInputErrors] = useState({}); // Nuevo estado para errores de validación
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateInput = (name, value) => {
    let errorMessage = '';
    if (name === 'identificador') {
      if (!value) {
        errorMessage = 'El RUN o Correo Electrónico es obligatorio.';
      }
    } else if (name === 'password') {
      if (!value) {
        errorMessage = 'La contraseña es obligatoria.';
      }
    }
    setInputErrors(prev => ({ ...prev, [name]: errorMessage }));
    return errorMessage === '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'identificador') {
      setIdentificador(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    validateInput(name, value);
    // Limpiar error general al cambiar cualquier input
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isIdentificadorValid = validateInput('identificador', identificador);
    const isPasswordValid = validateInput('password', password);

    if (!isIdentificadorValid || !isPasswordValid) {
      setError('Por favor, complete todos los campos requeridos correctamente.');
      return;
    }

    try {
      await login(identificador, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginCard}>
        <h2>Bienvenido de Vuelta</h2>
        <p className={styles.subtitle}>Accede a tu cuenta para gestionar tus reservas y perfil.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="identificador">RUN o Correo Electrónico</label>
            <input 
              type="text" 
              id="identificador"
              name="identificador"
              value={identificador} 
              onChange={handleInputChange} 
              placeholder="12345678-9 o tu@email.com" 
              required 
              className={inputErrors.identificador ? styles.inputError : ''}
              onBlur={() => validateInput('identificador', identificador)} // Validar al perder el foco
            />
            {inputErrors.identificador && <p className={styles.inputErrorMessage}>{inputErrors.identificador}</p>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <div className={styles.passwordInputContainer}>
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password} 
                onChange={handleInputChange} 
                placeholder="********"
                required 
                className={inputErrors.password ? styles.inputError : ''}
                onBlur={() => validateInput('password', password)} // Validar al perder el foco
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {inputErrors.password && <p className={styles.inputErrorMessage}>{inputErrors.password}</p>}
          </div>
          
          <button type="submit" className={styles.submitButton}>Iniciar Sesión</button>
        </form>
        
        <div className={styles.switchFormLink}>
          ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;