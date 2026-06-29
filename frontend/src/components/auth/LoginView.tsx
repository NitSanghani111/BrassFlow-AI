import React from 'react';
import { Factory, AlertTriangle, Mail, Lock } from 'lucide-react';

interface Props {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loginError: string;
  isLoading: boolean;
  onLogin: (e: React.FormEvent) => void;
}

export const LoginView: React.FC<Props> = ({
  email, setEmail, password, setPassword, loginError, isLoading, onLogin
}) => {
  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Factory size={32} className="auth-logo-icon" />
            <span className="auth-logo-text">AI Brass ERP</span>
          </div>
          <p className="auth-subtitle">Enterprise Control System &amp; Foundation Ledger</p>
        </div>

        {loginError && (
          <div className="auth-error">
            <AlertTriangle size={18} />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={onLogin}>
          <div className="form-group">
            <label className="form-label">Factory Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="admin@brassflow.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
