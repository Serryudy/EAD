import { useNavigate } from 'react-router-dom';
import { CustomerDashboard as CustomerDashboardComponent } from '../components/customer/CustomerDashboard';
import { useAuth } from '../contexts/AuthContext';

export const CustomerDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Create a mock user if no user is logged in (for development)
  const mockUser = {
    id: '1',
    firstName: 'Guest',
    lastName: 'User',
    phone: '0000000000',
    email: 'guest@autocare.com',
    nic: '123456789V',
    role: 'customer' as const
  };

  const currentUser = user || mockUser;

  return <CustomerDashboardComponent user={currentUser} onNavigate={(page) => {
    if (page === 'appointment-booking') navigate('/appointments/book');
    else if (page === 'service-progress') navigate('/service/progress');
    else if (page === 'customer-dashboard') navigate('/dashboard');
  }} />;
};
