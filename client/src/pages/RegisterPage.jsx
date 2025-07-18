// client/src/pages/RegisterPage.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService'; // Asegúrate de que la ruta sea correcta
import AuthContext from '../context/AuthContext';
import styles from './LoginPage.module.css'; // Usando el CSS unificado
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { run_cliente, nombre, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Registra al usuario
      await register({ run_cliente, nombre, email, password });
      // Loguea al usuario automáticamente después del registro
      await login(email, password);
      navigate('/'); // Redirige al dashboard
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
              placeholder="Ej: 12345678-9" 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="nombre">Nombre Completo</label>
            <input 
              type="text" 
              id="nombre"
              name="nombre"
              value={nombre} 
              onChange={handleChange} 
              placeholder="Ej: Juan Pérez" 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={email} 
              onChange={handleChange} 
              placeholder="tu@email.com" 
              required 
            />
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
                placeholder="********"
                required 
              />
              <button 
                type="button" 
                onClick={() => toggleShowPassword('password')}
                className={styles.passwordToggle}
              >
                {showPasswords.password ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
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
                placeholder="********"
                required 
              />
              <button 
                type="button" 
                onClick={() => toggleShowPassword('confirmPassword')}
                className={styles.passwordToggle}
              >
                {showPasswords.confirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
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