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

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

// App Content with Auth Check
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Auth Routes - accessible when NOT authenticated */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <CustomerRegistrationPage />} 
        />
        <Route 
          path="/employee/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <EmployeeLoginPage />} 
        />
        <Route 
          path="/employee/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <EmployeeRegistrationPage />} 
        />

        {/* Protected Routes - accessible when authenticated */}
        <Route
          path="/*"
          element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </div>
  );
};

export default App;