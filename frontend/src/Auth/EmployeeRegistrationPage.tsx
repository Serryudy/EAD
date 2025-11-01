import React, { useState } from 'react';
import { User, Lock, Building, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';
import ApiService from '../services/api';

const EmployeeRegistrationPage = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: ''
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
    if (!formData.employeeId.trim() || !formData.name.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await ApiService.employeeRegister(
        formData.employeeId.trim(),
        formData.name.trim(),
        formData.password,
        formData.department.trim() || undefined,
        formData.position.trim() || undefined
      );
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          employeeId: '',
          name: '',
          password: '',
          confirmPassword: '',
          department: '',
          position: ''
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
                    Your employee account has been created successfully. You can now login with your credentials.
                  </p>
                  <div className="d-grid">
                    <button
                      onClick={() => setSuccess(false)}
                      className="btn btn-primary btn-lg"
                    >
                      Register Another Employee
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
          <div className="col-md-10 col-lg-8">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                    <div className="bg-dark rounded p-2">
                      <div style={{ width: '24px', height: '24px', border: '2px solid white', borderRadius: '50%' }}></div>
                    </div>
                    <h2 className="mb-0 fw-bold">Employee Registration</h2>
                  </div>
                  <p className="text-muted mb-0">Create a new employee account for system access</p>
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

                  <div className="row g-3">
                    {/* Employee ID */}
                    <div className="col-md-6">
                      <label className="form-label">Employee ID *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <User size={18} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          name="employeeId"
                          className="form-control"
                          value={formData.employeeId}
                          onChange={handleInputChange}
                          placeholder="EMP-000123"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="col-md-6">
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

                    {/* Department */}
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <Building size={18} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          name="department"
                          className="form-control"
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="IT Department"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Position */}
                    <div className="col-md-6">
                      <label className="form-label">Position</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <Briefcase size={18} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          name="position"
                          className="form-control"
                          value={formData.position}
                          onChange={handleInputChange}
                          placeholder="Software Engineer"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="col-md-6">
                      <label className="form-label">Password *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <Lock size={18} className="text-muted" />
                        </span>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          disabled={isLoading}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="col-md-6">
                      <label className="form-label">Confirm Password *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <Lock size={18} className="text-muted" />
                        </span>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          disabled={isLoading}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Register Button */}
                  <div className="d-grid mt-4">
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
                          Register Employee
                        </>
                      )}
                    </button>
                  </div>

                  {/* Footer Notice */}
                  <small className="text-muted d-block text-center mt-3">
                    * Required fields. Employee accounts require admin approval.
                  </small>
                </form>

                <hr className="my-4" />

                {/* Navigation Links */}
                <div className="text-center">
                  <small className="text-muted">
                    Already have an account? <a href="/employee/login" className="text-decoration-none fw-semibold">Employee Login</a>
                  </small>
                  <br />
                  <small className="text-muted">
                    Are you a customer? <a href="/login" className="text-decoration-none fw-semibold">Customer Login</a>
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

export default EmployeeRegistrationPage;