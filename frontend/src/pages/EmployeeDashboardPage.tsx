import { useNavigate } from 'react-router-dom';
import { EmployeeDashboard as EmployeeDashboardComponent } from '../components/employee/EmployeeDashboard';
import { useAuth } from '../contexts/AuthContext';

export const EmployeeDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Create a mock user if no user is logged in (for development)
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    phone: '0000000000',
    email: 'employee@autocare.com',
    nic: '123456789V',
    role: 'employee' as const,
    employeeId: 'EMP001'
  };

  const currentUser = user || mockUser;

  return <EmployeeDashboardComponent user={currentUser} onNavigate={(page) => {
    if (page === 'employee-dashboard') navigate('/employee/dashboard');
  }} />;
};
