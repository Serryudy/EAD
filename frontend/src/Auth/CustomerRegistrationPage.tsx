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
            Your customer account has been created successfully. You can now login with your mobile number.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Go to Login
            </button>
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-white/80 hover:bg-white/90 text-gray-700 py-3 px-4 rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
            >
              Register Another Customer
            </button>
          </div>
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Customer Registration</h1>
          </div>
          <span className="bg-white/80 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
            New Account
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8 text-sm">
          Create your account to book services and track appointments
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

          {/* Mobile Number */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">Mobile Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="0712345678"
                disabled={isLoading}
                required
                maxLength={15}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your 10-digit mobile number without country code
            </p>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Footer Notice */}
        <p className="text-xs text-gray-500 text-center mt-6">
          * Required fields. You'll receive an OTP for verification after registration.
        </p>

        {/* Navigation Links */}
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Customer Login
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Are you an employee?{' '}
            <a 
              href="/employee/login" 
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Employee Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegistrationPage;