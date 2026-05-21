import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthPage.css';

export const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);

  const toggleForm = () => {
    setIsRegister(!isRegister);
  };

  return (
    <div className={`auth-container ${isRegister ? 'active' : ''}`}>
      <div className="auth-form-box login">
        <LoginForm />
      </div>

      <div className="auth-form-box register">
        <RegisterForm />
      </div>

      <div className="auth-toggle-box">
        <div className="auth-toggle-panel auth-toggle-left">
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button className="auth-toggle-btn auth-register-btn" onClick={toggleForm}>
            Register
          </button>
        </div>

        <div className="auth-toggle-panel auth-toggle-right">
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button className="auth-toggle-btn auth-login-btn" onClick={toggleForm}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
