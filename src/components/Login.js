import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Input from './Input';
import './Login.css';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      // Handle Firebase errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('email already in use');
          break;
        case 'auth/invalid-email':
          setError('invalid email address');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('invalid email or password');
          break;
        case 'auth/invalid-credential':
          setError('invalid credentials');
          break;
        case 'auth/too-many-requests':
          setError('too many attempts. please try again later');
          break;
        default:
          setError('failed to ' + (isSignUp ? 'sign up' : 'log in'));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <pre className="login-logo">
┌────────────────────┐<br />
│   jo-sh daily      │<br />
│   ▓▓▓░░░░░         │<br />
└────────────────────┘
          </pre>
          <h2 className="login-title">{isSignUp ? 'create account' : 'welcome back'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">email</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">confirm password</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="login-submit"
          >
            {loading ? 'loading...' : isSignUp ? 'sign up' : 'log in'}
          </Button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            className="toggle-mode-btn"
          >
            {isSignUp ? 'already have an account? log in' : "don't have an account? sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
