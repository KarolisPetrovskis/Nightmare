import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SnackbarNotification from '../../components/SnackBar/SnackNotification';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { validateSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [checkingUsers, setCheckingUsers] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    // Check if any users exist in the system
    const checkForUsers = async () => {
      try {
        const response = await fetch('/api/auth/has-users');
        if (response.ok) {
          const hasUsers = await response.json();
          setIsRegistering(!hasUsers); // Show registration if no users exist
        }
      } catch (error) {
        console.error('Error checking for users:', error);
      } finally {
        setCheckingUsers(false);
      }
    };
    checkForUsers();
  }, []);

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

    if (isRegistering) {
      // Registration validation
      if (!name || !surname) {
        setSnackbar({
          open: true,
          message: 'Name and surname are required.',
          type: 'error',
        });
        return;
      }
      
      setLoading(true);

      const registerPayload = {
        Name: name,
        Surname: surname,
        Email: email,
        Password: password,
        // UserType is optional, backend will set it to SuperAdmin for first user
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setSnackbar({
          open: true,
          message: errorText || 'Registration failed.',
          type: 'error',
        });
        setLoading(false);
        return;
      }

      setSnackbar({
        open: true,
        message: 'Registration successful! You are now the SuperAdmin. Please log in.',
        type: 'success',
      });
      
      // Switch to login mode after successful registration
      setTimeout(() => {
        setIsRegistering(false);
        setName('');
        setSurname('');
        setPassword('');
      }, 2000);
      
      setLoading(false);
      return;
    }

    // Login logic
    setLoading(true);

    const createPayload = {
      Email: email,
      Password: password,
    };

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
      credentials: 'include', // Important: include cookies
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
    
    // Backend returns {userId, userType} and sets authentication cookie
    if (data.userId) {
      localStorage.setItem('userId', data.userId.toString());
      localStorage.setItem('userType', data.userType.toString());
    }

    // Validate session to populate AuthContext with businessId and userType
    await validateSession();

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
        {checkingUsers ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CircularProgress size={40} />
          </div>
        ) : (
          <>
            <h2 className="login-title">
              {isRegistering ? 'Create SuperAdmin Account' : 'Log in'}
            </h2>

            <form className="login-form" onSubmit={handleSubmit}>
              {isRegistering && (
                <>
                  <label className="field-label">First Name</label>
                  <input
                    className="login-input"
                    type="text"
                    placeholder="Enter your first name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="given-name"
                  />

                  <label className="field-label">Last Name</label>
                  <input
                    className="login-input"
                    type="text"
                    placeholder="Enter your last name"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    autoComplete="family-name"
                  />
                </>
              )}

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
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />

              <Button
                variant="contained"
                className="item-action-button save-button active login-button"
                type="submit"
                disabled={loading}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                {loading && <CircularProgress size={20} sx={{ color: '#646cff' }} />}
                {loading 
                  ? (isRegistering ? 'Creating Account...' : 'Logging in...') 
                  : (isRegistering ? 'Create SuperAdmin Account' : 'Log in')
                }
              </Button>

              {!isRegistering && (
                <div style={{ marginTop: '16px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                  First time? The system will guide you through registration.
                </div>
              )}
            </form>
          </>
        )}
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
