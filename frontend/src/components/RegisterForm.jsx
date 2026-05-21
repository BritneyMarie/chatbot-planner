import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const result = await register(username, email, password, confirmPassword);

    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Registration failed');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Registration</h1>

      {error && <div className="auth-error">{error}</div>}

      <div className="auth-input-box">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <i className="bx bxs-user"></i>
      </div>

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

      <div className="auth-input-box">
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        <i className="bx bxs-lock-alt"></i>
      </div>

      <button type="submit" className="auth-btn" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>

      <p>or register with</p>

      <div className="auth-social-icons">
        <a href="#"><i className="bx bxl-google"></i></a>
        <a href="#"><i className="bx bxl-facebook"></i></a>
        <a href="#"><i className="bx bxl-github"></i></a>
        <a href="#"><i className="bx bxl-linkedin"></i></a>
      </div>
    </form>
  );
};

export default RegisterForm;
