import { useNavigate } from 'react-router-dom';
import { ServiceProgress as ServiceProgressComponent } from '../components/customer/ServiceProgress';
import { useAuth } from '../contexts/AuthContext';

export const ServiceProgressPage = () => {
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

  return <ServiceProgressComponent user={currentUser} onNavigate={(page) => {
    if (page === 'customer-dashboard') navigate('/dashboard');
  }} />;
};
