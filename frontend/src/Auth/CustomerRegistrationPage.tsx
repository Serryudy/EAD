import React, { useState } from 'react';
import { User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import ApiService from '../services/api';

const CustomerRegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validation
    if (!formData.name.trim() || !formData.mobile.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Basic mobile number validation
    const mobileRegex = /^[0-9]{10}$/;
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    
    if (!mobileRegex.test(cleanMobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting to register customer:', { name: formData.name.trim(), mobile: cleanMobile });
      
      const response = await ApiService.customerSignup(cleanMobile, formData.name.trim());
      
      console.log('Registration response:', response);
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          name: '',
          mobile: ''
        });
      }
    } catch (err) {
      console.error('Registration error details:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        type: typeof err,
        constructor: err?.constructor?.name
      });
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(`Network error: ${err.message}. Please check if the backend is running on port 5000.`);
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0 text-center">
                <div className="card-body p-5">
                  <div className="bg-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                    <CheckCircle size={40} className="text-white" />
                  </div>
                  <h2 className="fw-bold mb-3">Registration Successful!</h2>
                  <p className="text-muted mb-4">
                    Your customer account has been created successfully. You can now login with your mobile number.
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="btn btn-primary btn-lg"
                    >
                      Go to Login
                    </button>
                    <button
                      onClick={() => setSuccess(false)}
                      className="btn btn-outline-secondary"
                    >
                      Register Another Customer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    <h2 className="mb-0 fw-bold">Customer Registration</h2>
                  </div>
                  <p className="text-muted mb-0">Create your account to book services and track appointments</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <AlertCircle size={18} className="me-2" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <User size={18} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="mb-3">
                    <label className="form-label">Mobile Number *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <Phone size={18} className="text-muted" />
                      </span>
                      <input
                        type="tel"
                        name="mobile"
                        className="form-control"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="0712345678"
                        disabled={isLoading}
                        required
                        maxLength={15}
                      />
                    </div>
                    <small className="form-text text-muted">
                      Enter your 10-digit mobile number without country code
                    </small>
                  </div>

                  {/* Register Button */}
                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary btn-lg d-flex align-items-center justify-content-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <User size={18} />
                          Create Account
                        </>
                      )}
                    </button>
                  </div>

                  {/* Footer Notice */}
                  <small className="text-muted d-block text-center mb-3">
                    * Required fields. You'll receive an OTP for verification after registration.
                  </small>
                </form>

                <hr />

                {/* Navigation Links */}
                <div className="text-center">
                  <small className="text-muted">
                    Already have an account? <a href="/login" className="text-decoration-none fw-semibold">Customer Login</a>
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

export default CustomerRegistrationPage;