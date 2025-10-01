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
            <h1 className="text-xl font-semibold text-gray-800">Employee Portal</h1>
          </div>
          <span className="bg-white/80 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
            Secure Access
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-gray-600 mb-8 text-sm">
          Log in to manage appointments, job cards, and service time logs
        </p>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee ID */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">Employee ID</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="EMP-000123"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-600 text-sm mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              <>
                <span>→</span>
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-white/30 my-6"></div>

        {/* SSO Option */}
        <div>
          <p className="text-gray-600 text-sm mb-3">Use company SSO</p>
          <button
            onClick={handleSSO}
            disabled={isLoading}
            className="w-full bg-white/80 hover:bg-white/90 disabled:opacity-50 text-gray-700 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all border border-white/40"
          >
            <span>⚡</span>
            Continue
          </button>
        </div>

        {/* Footer Notice */}
        <p className="text-xs text-gray-500 text-center mt-6">
          This portal is for employees only. All access is monitored.
        </p>

        {/* Navigation Links */}
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            Are you a customer?{' '}
            <a 
              href="/login" 
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Customer Login
            </a>
            {' '}or{' '}
            <a 
              href="/register" 
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Register
            </a>
          </p>
          <p className="text-sm text-gray-600">
            Need to register a new employee?{' '}
            <a 
              href="/employee/register" 
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Employee Registration
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;