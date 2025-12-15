import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import SnackbarNotification from '../../components/SnackBar/SnackNotification';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  function validateEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  const handleSubmit = async (ev?: React.FormEvent) => {
    if (ev) ev.preventDefault();
    if (!validateEmail(email)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email.',
        type: 'error',
      });
      return;
    }
    if (!password || password.length < 6) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 6 characters.',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    const createPayload = {
      Email: email,
      Password: password,
    };

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    });

    if (!response.ok) {
      setSnackbar({
        open: true,
        message: 'Invalid email or password.',
        type: 'error',
      });
      setLoading(false);
      return;
    }

    const data = await response.json();
    
    // Store auth token if provided by backend
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    setSnackbar({
      open: true,
      message: 'Login successful!',
      type: 'success',
    });

    navigate('/');
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <h2 className="login-title">Log in</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field-label">Email</label>
          <input
            className="login-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />

          <label className="field-label">Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button
            variant="contained"
            className="item-action-button save-button active login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>
      </div>

      <SnackbarNotification
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        type={snackbar.type}
      />
    </div>
  );
}
