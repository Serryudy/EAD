import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import BookingWizard from '../components/customer/booking/BookingWizard';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LogIn, Calendar, Loader2 } from 'lucide-react';

export const AppointmentBookingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Store intended destination for redirect after login
  useEffect(() => {
    if (!user && !loading) {
      sessionStorage.setItem('redirectAfterLogin', '/booking');
    }
  }, [user, loading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0077b6]" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-[#0077b6]" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#03045e] mb-2">
            Login Required
          </h2>
          
          <p className="text-slate-600 mb-6">
            Please log in to your account to book an appointment. This helps us manage your vehicles and appointment history.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/login')}
              className="w-full bg-[#0077b6] hover:bg-[#03045e]"
              size="lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login to Continue
            </Button>
            
            <Button
              onClick={() => navigate('/signup')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Create New Account
            </Button>

            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="w-full text-slate-600"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <BookingWizard
          user={user}
          onComplete={() => navigate('/dashboard')}
          onCancel={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
};
