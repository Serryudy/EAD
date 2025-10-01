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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-4000"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-6000"></div>
        </div>

        {/* Success Card */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/30 relative z-10 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Registration Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your employee account has been created successfully. You can now login with your credentials.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Register Another Employee
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-6000"></div>
      </div>

      {/* Glass morphism card */}
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/30 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Employee Registration</h1>
          </div>
          <span className="bg-white/80 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
            New Account
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8 text-sm">
          Create a new employee account for system access
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee ID */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">Employee ID *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="EMP-000123"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="John Doe"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">Department</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="IT Department"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">Position</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Software Engineer"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="••••••••"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="••••••••"
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all mt-6"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                Register Employee
              </>
            )}
          </button>
        </form>

        {/* Footer Notice */}
        <p className="text-xs text-gray-500 text-center mt-6">
          * Required fields. Employee accounts require admin approval.
        </p>

        {/* Navigation Links */}
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a 
              href="/employee/login" 
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Employee Login
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Are you a customer?{' '}
            <a 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Customer Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegistrationPage;