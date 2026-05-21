import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      navigate(from);
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-input-box">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <i className="bx bxs-envelope"></i>
      </div>

      <div className="auth-input-box">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <i className="bx bxs-lock-alt"></i>
      </div>

      <div className="auth-forgot-link">
        <a href="#">Forgot Password?</a>
      </div>

      <button type="submit" className="auth-btn" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      <p>or login with</p>

      <div className="auth-social-icons">
        <a href="#"><i className="bx bxl-google"></i></a>
        <a href="#"><i className="bx bxl-facebook"></i></a>
        <a href="#"><i className="bx bxl-github"></i></a>
        <a href="#"><i className="bx bxl-linkedin"></i></a>
      </div>
    </form>
  );
};

export default LoginForm;
