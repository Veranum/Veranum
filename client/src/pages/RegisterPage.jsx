// client/src/pages/RegisterPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import AuthContext from '../context/AuthContext';
import styles from './LoginPage.module.css'; // Usando el CSS unificado
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Función de validación de RUN (muy básica, se puede mejorar)
const validateRun = (run) => {
  if (!run) return 'El RUN es obligatorio.';
  // Formato: 12345678-9 o 1234567-K
  const runRegex = /^[0-9]{7,8}-[0-9K]$/i;
  if (!runRegex.test(run)) return 'El formato del RUN no es válido (ej: 12345678-9).';
  return '';
};

const validateEmail = (email) => {
  if (!email) return 'El correo electrónico es obligatorio.';
  const emailRegex = /^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) return 'El formato del correo electrónico no es válido.';
  return '';
};

const validatePassword = (password) => {
  if (!password) return 'La contraseña es obligatoria.';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return '';
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    run_cliente: '',
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [inputErrors, setInputErrors] = useState({}); // Nuevo estado para errores de validación
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { run_cliente, nombre, email, password, confirmPassword } = formData;

  const validateField = (name, value) => {
    let errorMessage = '';
    switch (name) {
      case 'run_cliente':
        errorMessage = validateRun(value);
        break;
      case 'nombre':
        if (!value) errorMessage = 'El nombre es obligatorio.';
        break;
      case 'email':
        errorMessage = validateEmail(value);
        break;
      case 'password':
        errorMessage = validatePassword(value);
        break;
      case 'confirmPassword':
        if (value !== password) errorMessage = 'Las contraseñas no coinciden.';
        else if (!value) errorMessage = 'Confirma tu contraseña.';
        break;
      default:
        break;
    }
    setInputErrors(prev => ({ ...prev, [name]: errorMessage }));
    return errorMessage === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
    setError(''); // Limpiar error general al cambiar cualquier input
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar todos los campos al enviar
    const isRunValid = validateField('run_cliente', run_cliente);
    const isNombreValid = validateField('nombre', nombre);
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);

    if (!isRunValid || !isNombreValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      setError('Por favor, complete todos los campos correctamente.');
      return;
    }

    setLoading(true);
    try {
      await register({ run_cliente, nombre, email, password });
      await login(email, password); // Auto-login after registration
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la cuenta. Intente con otro correo o RUN.');
    }
    setLoading(false);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.registerCard}>
        <h2>Crea tu Cuenta en VERANUM</h2>
        <p className={styles.subtitle}>Regístrate para reservar de forma más rápida y sencilla.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="run_cliente">RUN</label>
            <input 
              type="text" 
              id="run_cliente"
              name="run_cliente"
              value={run_cliente} 
              onChange={handleChange} 
              onBlur={handleBlur}
              placeholder="Ej: 12345678-9" 
              required 
              className={inputErrors.run_cliente ? styles.inputError : (run_cliente && !inputErrors.run_cliente ? styles.inputSuccess : '')}
            />
            {inputErrors.run_cliente && <p className={styles.inputErrorMessage}>{inputErrors.run_cliente}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="nombre">Nombre Completo</label>
            <input 
              type="text" 
              id="nombre"
              name="nombre"
              value={nombre} 
              onChange={handleChange} 
              onBlur={handleBlur}
              placeholder="Ej: Juan Pérez" 
              required 
              className={inputErrors.nombre ? styles.inputError : (nombre && !inputErrors.nombre ? styles.inputSuccess : '')}
            />
            {inputErrors.nombre && <p className={styles.inputErrorMessage}>{inputErrors.nombre}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={email} 
              onChange={handleChange} 
              onBlur={handleBlur}
              placeholder="tu@email.com" 
              required 
              className={inputErrors.email ? styles.inputError : (email && !inputErrors.email ? styles.inputSuccess : '')}
            />
            {inputErrors.email && <p className={styles.inputErrorMessage}>{inputErrors.email}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <div className={styles.passwordInputContainer}>
              <input 
                type={showPasswords.password ? "text" : "password"}
                id="password"
                name="password"
                value={password} 
                onChange={handleChange} 
                onBlur={handleBlur}
                placeholder="********"
                required 
                className={inputErrors.password ? styles.inputError : (password && !inputErrors.password ? styles.inputSuccess : '')}
              />
              <button 
                type="button" 
                onClick={() => toggleShowPassword('password')}
                className={styles.passwordToggle}
                aria-label={showPasswords.password ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPasswords.password ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {inputErrors.password && <p className={styles.inputErrorMessage}>{inputErrors.password}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className={styles.passwordInputContainer}>
              <input 
                type={showPasswords.confirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword} 
                onChange={handleChange} 
                onBlur={handleBlur}
                placeholder="********"
                required 
                className={inputErrors.confirmPassword ? styles.inputError : (confirmPassword && !inputErrors.confirmPassword ? styles.inputSuccess : '')}
              />
              <button 
                type="button" 
                onClick={() => toggleShowPassword('confirmPassword')}
                className={styles.passwordToggle}
                aria-label={showPasswords.confirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPasswords.confirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
            {inputErrors.confirmPassword && <p className={styles.inputErrorMessage}>{inputErrors.confirmPassword}</p>}
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className={styles.switchFormLink}>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;