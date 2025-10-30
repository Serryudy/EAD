import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './Auth/LoginPage';
import EmployeeLoginPage from './Auth/EmployeeLoginPage';
import EmployeeRegistrationPage from './Auth/EmployeeRegistrationPage';
import CustomerRegistrationPage from './Auth/CustomerRegistrationPage';
import Sidemenu from './components/Sidemenu';
import Dashboard from './components/Dashboard/Dashboard';
import BookAppointmentForm from './components/BookAppointment/BookAppointmentForm';
import MyCalendar from './components/Calendar/MyCalendar';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboad';
import EmployeeAppoinment from './components/Dashboard/EmployeeAppoinment';
import EmployeeAppoinmentDetails from './components/Dashboard/EmployeeAppoinmentDetails';
import EmpNotes from './components/Dashboard/EmpNotes';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Main Layout Component with Sidemenu
const MainLayout: React.FC = () => {
  return (
    <div className="d-flex" style={{ height: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidemenu />
      
      <main className="flex-fill overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book-appointment" element={<BookAppointmentForm />} />
          <Route path="/my-calendar" element={<MyCalendar />} />
          <Route path="/employeedashboard" element={<EmployeeDashboard />} />
          <Route path="/employeeappointment" element={<EmployeeAppoinment />} />
          <Route path="/empnotes" element={<EmpNotes />} />
          <Route path="/employeeappointment/:appointmentId" element={<EmployeeAppoinmentDetails />} />
        </Routes>
      </main>
    </div>
  );
};

// Auth Routes Component
const AuthRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<CustomerRegistrationPage />} />
      <Route path="/employee/login" element={<EmployeeLoginPage />} />
      <Route path="/employee/register" element={<EmployeeRegistrationPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<AuthRoutes />} />
            <Route path="/register" element={<AuthRoutes />} />
            <Route path="/employee/login" element={<AuthRoutes />} />
            <Route path="/employee/register" element={<AuthRoutes />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;