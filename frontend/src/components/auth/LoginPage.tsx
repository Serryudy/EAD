import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Car, Shield, Clock, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, requestOtp } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestOtp(phone);
      setStep('otp');
      setResendTimer(60);
      
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(phone, otp);
      
      // Check if there's a redirect URL stored
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        // Navigate based on user role (default to customer dashboard)
        navigate('/customer/dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError('');

    try {
      await requestOtp(phone);
      setResendTimer(60);
      
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0077b6] to-[#03045e] flex items-center justify-center">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-[#03045e]">AutoCare</h1>
                <p className="text-slate-600">Service & Appointment System</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-[#03045e]">Professional Automotive Service Management</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="h-12 w-12 rounded-lg bg-[#90e0ef]/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="text-[#03045e]">Real-time Progress Tracking</h3>
                  <p className="text-slate-600">Monitor your vehicle service status live</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="h-12 w-12 rounded-lg bg-[#90e0ef]/20 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="text-[#03045e]">Expert Technicians</h3>
                  <p className="text-slate-600">Certified professionals handling your vehicle</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="h-12 w-12 rounded-lg bg-[#90e0ef]/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="text-[#03045e]">Secure & Reliable</h3>
                  <p className="text-slate-600">Phone-based OTP authentication</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="p-8 backdrop-blur-sm bg-white/80 border-slate-200 shadow-xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-[#03045e]">Welcome Back</h2>
              <p className="text-slate-600">Sign in to access your account</p>
            </div>

            {step === 'phone' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                <Button 
                  onClick={handleSendOTP}
                  className="w-full h-12 bg-[#0077b6] hover:bg-[#03045e]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Enter 6-digit OTP</Label>
                  <p className="text-slate-600">Sent to {phone}</p>
                  
                  <div className="flex justify-center py-4">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={handleVerifyOTP}
                    className="w-full h-12 bg-[#0077b6] hover:bg-[#03045e]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-slate-500">Resend OTP in {resendTimer}s</p>
                    ) : (
                      <button 
                        onClick={handleResendOTP}
                        className="text-[#0077b6] hover:underline disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Resend OTP'}
                      </button>
                    )}
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => setStep('phone')}
                    className="w-full"
                    disabled={loading}
                  >
                    Change Phone Number
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="text-center">
                <p className="text-slate-600">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => navigate('/signup')}
                    className="text-[#0077b6] hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
              <div className="text-center text-sm">
                <Link 
                  to="/employee/login"
                  className="text-[#0077b6] hover:underline mr-4"
                >
                  Employee Login
                </Link>
                <Link 
                  to="/admin/login"
                  className="text-[#0077b6] hover:underline"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
