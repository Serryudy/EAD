import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Layout } from './components/layouts/Layout';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { EmployeeLoginPage } from './components/auth/EmployeeLoginPage';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { AppointmentBookingPage } from './pages/AppointmentBookingPage';
import { ServiceProgressPage } from './pages/ServiceProgressPage';
import { EmployeeDashboardPage } from './pages/EmployeeDashboardPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/employee/login" element={<EmployeeLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Routes with layout - no protection for now */}
            <Route element={<Layout />}>
              {/* Customer routes */}
              <Route path="/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/booking" element={<AppointmentBookingPage />} />
              <Route path="/appointments/book" element={<AppointmentBookingPage />} />
              <Route path="/service/progress" element={<ServiceProgressPage />} />
              
              {/* Employee routes */}
              <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/panel" element={<AdminPanelPage />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
