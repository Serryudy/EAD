import React, { useState } from 'react';
import { User, Phone, Send, RotateCcw, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ApiService from '../services/api';

const AutoServiceLogin = () => {
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');

  const handleSendOtp = async () => {
    setError('');
    
    if (!fullName.trim() || !mobileNumber.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First try to signup if new customer
      if (!isOtpSent) {
        try {
          await ApiService.customerSignup(mobileNumber.trim(), fullName.trim());
        } catch {
          // If signup fails (customer already exists), that's okay, proceed with OTP
          console.log('Customer already exists, proceeding with OTP');
        }
      }
      
      // Send OTP
      const response = await ApiService.customerSendOTP(mobileNumber.trim());
      
      if (response.success && response.data) {
        setIsOtpSent(true);
        setMaskedMobile(response.data.mobile);
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const response = await ApiService.customerSendOTP(mobileNumber.trim());
      
      if (response.success) {
        setError(''); // Clear any previous errors
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await ApiService.customerVerifyOTP(mobileNumber.trim(), otp.trim());
      
      if (response.success && response.data) {
        login(response.data);
        // Navigation will be handled by the parent component based on auth state
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                    <div className="bg-primary rounded p-2">
                      <div style={{ width: '24px', height: '24px', border: '2px solid white', borderRadius: '50%' }}></div>
                    </div>
                    <h2 className="mb-0 fw-bold">AutoService</h2>
                  </div>
                  <p className="text-muted mb-2">Customer Login</p>
                  <small className="text-muted">Customer access for booking, tracking, and rescheduling</small>
                  {isOtpSent && maskedMobile && (
                    <div className="alert alert-info mt-3 mb-0 py-2">
                      <small>OTP sent to {maskedMobile}</small>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <AlertCircle size={18} className="me-2" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <div className="mb-4">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <User size={18} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mobile Number</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <Phone size={18} className="text-muted" />
                        </span>
                        <input
                          type="tel"
                          className="form-control"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="+94 71 960 6645"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="btn btn-primary d-flex align-items-center gap-2"
                    >
                      <Send size={16} />
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                <hr className="my-4" />

                {/* OTP Section */}
                <div className="mb-4">
                  <label className="form-label">Enter OTP</label>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-white">
                      <Lock size={18} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control text-center fs-5 letter-spacing"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="• • • • • •"
                      maxLength={6}
                      style={{ letterSpacing: '0.5rem' }}
                    />
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button
                      onClick={handleResendOtp}
                      disabled={isLoading || !isOtpSent}
                      className="btn btn-outline-secondary flex-fill d-flex align-items-center justify-content-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Resend
                    </button>
                    
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading || !otp.trim()}
                      className="btn btn-dark flex-fill d-flex align-items-center justify-content-center gap-2"
                    >
                      <Lock size={16} />
                      {isLoading ? 'Verifying...' : 'Submit'}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    By continuing, you agree to our <a href="#" className="text-decoration-none">Terms</a> and acknowledge the <a href="#" className="text-decoration-none">Privacy Policy</a>
                  </small>
                </div>

                <hr className="my-3" />

                {/* Links */}
                <div className="text-center">
                  <small className="text-muted">
                    Don't have an account? <a href="/register" className="text-decoration-none fw-semibold">Customer Registration</a>
                  </small>
                  <br />
                  <small className="text-muted">
                    Are you an employee? <a href="/employee/login" className="text-decoration-none fw-semibold">Employee Login</a>
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

export default AutoServiceLogin;