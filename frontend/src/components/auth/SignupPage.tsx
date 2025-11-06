import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Car, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { vehicleApi } from '../../services/api';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [nic, setNic] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCompleteSignup = async () => {
    // Clear previous errors
    setError('');

    // Validate phone number
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    // Validate name
    if (!firstName || !lastName) {
      setError('Please fill in your first and last name');
      return;
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const signupData = {
        phoneNumber: phone,
        firstName,
        lastName,
        nic: nic || undefined,
        email: email || undefined,
      };

      await signup(signupData);
      
      // Wait a moment to ensure sessionStorage is fully written
      await new Promise(resolve => setTimeout(resolve, 100));

      // If signup successful and vehicle details provided, add vehicle
      if (vehicleMake && vehicleModel && licensePlate) {
        console.log('🚗 Attempting to add vehicle...');
        const token = sessionStorage.getItem('authToken');
        console.log('Token available:', !!token);
        
        try {
          await vehicleApi.addVehicle({
            make: vehicleMake,
            model: vehicleModel,
            year: parseInt(vehicleYear) || new Date().getFullYear(),
            licensePlate,
          });
          console.log('✅ Vehicle added successfully');
        } catch (vehicleError) {
          console.error('❌ Failed to add vehicle:', vehicleError);
          // Don't show error, continue with success
        }
      }

      setStep('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      // Display backend error message (e.g., duplicate phone/NIC/email)
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#caf0f8] via-white to-[#ade8f4]">
      <div className="w-full max-w-4xl">
        <Card className="p-8 backdrop-blur-sm bg-white/90 border-slate-200 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0077b6] to-[#03045e] flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#03045e]">Create Account</h2>
              <p className="text-slate-600">Join AutoCare Service System</p>
            </div>
          </div>

          {step === 'details' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12"
                  disabled={loading}
                  required
                />
                <p className="text-sm text-slate-500">You will use this to login with OTP</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nic">NIC Number (Optional)</Label>
                <Input
                  id="nic"
                  placeholder="e.g., 123456789V"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className="h-12"
                  disabled={loading}
                />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-[#03045e] mb-4">Vehicle Details (Optional)</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      placeholder="e.g., Toyota"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      className="h-12"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Camry"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="h-12"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2022"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="h-12"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plate">License Plate</Label>
                    <Input
                      id="plate"
                      placeholder="ABC-1234"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      className="h-12"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button 
                onClick={handleCompleteSignup}
                className="w-full h-12 bg-[#0077b6] hover:bg-[#03045e] text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="pt-4 border-t border-slate-200 text-center">
                <p className="text-slate-600">
                  Already have an account?{' '}
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-[#0077b6] hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-[#03045e] mb-2">Account Created!</h3>
              <p className="text-slate-600 text-lg mb-4">
                Welcome to AutoCare Service System
              </p>
              <p className="text-sm text-slate-500">
                Redirecting to dashboard...
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
