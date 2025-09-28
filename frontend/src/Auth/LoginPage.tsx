import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Send, RotateCcw, Lock } from 'lucide-react';

const AutoServiceLogin = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('John Doe');
  const [mobileNumber, setMobileNumber] = useState('+1 555 000 1234');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!fullName.trim() || !mobileNumber.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsOtpSent(true);
      setIsLoading(false);
      alert('OTP sent successfully!');
    }, 1500);
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('OTP resent successfully!');
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!otp.trim()) {
      alert('Please enter the OTP');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Login successful!');
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#CFCFCF]" >
        {/* Animated Background */}
      <div >
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        <div className="absolute bottom-40 right-1/3 w-48 h-48 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse animation-delay-6000"></div>
      </div>
      {/* Glass morphism card */}
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-semibold text-gray-800">AutoService</h1>
          </div>
          <span className="bg-white/80 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
            Secure Login
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-gray-600 text-center mb-8 text-sm">
          Customer access for booking, tracking, and rescheduling
        </p>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          {/* Full Name and Mobile Number Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  placeholder="+94 71 960 6645"
                />
              </div>
            </div>
          </div>

          {/* Send OTP Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendOtp}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="w-4 h-4" />
              Send OTP
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/30 mb-6"></div>

        {/* OTP Section */}
        <div className="mb-6">
          <label className="block text-gray-600 text-sm mb-2">Enter OTP</label>
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full pl-10 pr-4 py-3 bg-white/90 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-lg tracking-widest"
              placeholder="• • • • • •"
              maxLength={6}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleResendOtp}
              disabled={isLoading || !isOtpSent}
              className="flex-1 bg-white/80 hover:bg-white/90 disabled:opacity-50 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Resend
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isLoading || !otp.trim()}
              className="flex-1 bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Lock className="w-4 h-4" />
              Submit
            </button>
          </div>
        </div>

        {/* Terms and Privacy */}
        <p className="text-xs text-gray-500 text-center">
          By continuing, you agree to our{' '}
          <span className="text-blue-600 cursor-pointer hover:underline">Terms</span>{' '}
          and acknowledge the{' '}
          <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default AutoServiceLogin;