import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Shield, Settings, BarChart3, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await adminLogin(username.trim(), password);
      // Navigate to admin panel on success
      navigate('/admin/panel');
    } catch (error: any) {
      setError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0077b6] to-[#03045e] flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#03045e]">AutoCare</h1>
                <p className="text-slate-600">Admin Portal</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#03045e]">Complete System Control</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="h-12 w-12 rounded-lg bg-[#90e0ef]/20 flex items-center justify-center flex-shrink-0">
                  <Settings className="h-6 w-6 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#03045e]">System Management</h3>
                  <p className="text-sm text-slate-600">Configure and control all system settings</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="h-12 w-12 rounded-lg bg-[#90e0ef]/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#03045e]">Analytics & Reports</h3>
                  <p className="text-sm text-slate-600">View comprehensive business insights</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200">
                <div className="h-12 w-12 rounded-lg bg-[#90e0ef]/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#03045e]">Maximum Security</h3>
                  <p className="text-sm text-slate-600">Protected administrative access</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <Card className="p-8 backdrop-blur-sm bg-white/80 border-slate-200 shadow-xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#03045e]">Admin Login</h2>
              <p className="text-slate-600">Enter your credentials to access the admin panel</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-slate-300"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-0 bottom-0 flex items-center justify-center text-slate-500 hover:text-slate-700 px-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#0077b6] to-[#03045e] hover:from-[#03045e] hover:to-[#0077b6]"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="text-center">
                <Link 
                  to="/employee/login"
                  className="text-sm text-[#0077b6] hover:underline"
                >
                  Employee Login
                </Link>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Customer?{' '}
                  <Link 
                    to="/login"
                    className="text-[#0077b6] hover:underline"
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
