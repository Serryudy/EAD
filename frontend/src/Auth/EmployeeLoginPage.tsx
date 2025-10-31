import React, { useState } from 'react';
import { User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ApiService from '../services/api';

const EmployeeLoginPage = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!employeeId.trim() || !password.trim()) {
      setError('Please provide employee ID and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await ApiService.employeeLogin(employeeId.trim(), password);
      
      if (response.success && response.data) {
        login(response.data);
        // Navigation will be handled by the parent component based on auth state
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSO = () => {
    // Handle SSO logic here
    console.log('SSO login requested');
    setError('SSO functionality not implemented yet');
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
    console.log('Forgot password requested');
    setError('Forgot password functionality not implemented yet');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                    <div className="bg-dark rounded p-2">
                      <div style={{ width: '24px', height: '24px', border: '2px solid white', borderRadius: '50%' }}></div>
                    </div>
                    <h2 className="mb-0 fw-bold">Employee Portal</h2>
                  </div>
                  <p className="text-muted mb-0">Log in to manage appointments, job cards, and service time logs</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignIn}>
                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <AlertCircle size={18} className="me-2 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Employee ID */}
                  <div className="mb-3">
                    <label className="form-label">Employee ID</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <User size={18} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="EMP-000123"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <Lock size={18} className="text-muted" />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="text-end mb-3">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="btn btn-link btn-sm text-decoration-none p-0"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <div className="d-grid">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        <>
                          Sign In →
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <hr className="my-4" />

                {/* Footer Notice */}
                <small className="text-muted d-block text-center mb-3">
                  This portal is for employees only. All access is monitored.
                </small>

                {/* Navigation Links */}
                <div className="text-center">
                  <small className="text-muted">
                    Are you a customer? <a href="/login" className="text-decoration-none fw-semibold">Customer Login</a> or <a href="/register" className="text-decoration-none fw-semibold">Register</a>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;