import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './Auth/LoginPage';
import EmployeeLoginPage from './Auth/EmployeeLoginPage';
import EmployeeRegistrationPage from './Auth/EmployeeRegistrationPage';
import CustomerRegistrationPage from './Auth/CustomerRegistrationPage';
import './App.css'

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

// Dashboard Component (placeholder)
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h1>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">User Info</h3>
              <p><strong>Role:</strong> {user?.role}</p>
              {user?.role === 'employee' && (
                <>
                  <p><strong>Employee ID:</strong> {user?.employeeId}</p>
                  {user?.department && <p><strong>Department:</strong> {user?.department}</p>}
                  {user?.position && <p><strong>Position:</strong> {user?.position}</p>}
                </>
              )}
              {user?.role === 'customer' && (
                <p><strong>Mobile:</strong> {user?.mobile}</p>
              )}
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Quick Actions</h3>
              {user?.role === 'employee' ? (
                <ul className="space-y-2">
                  <li>• Manage Appointments</li>
                  <li>• View Job Cards</li>
                  <li>• Update Service Logs</li>
                  <li>• Customer Management</li>
                </ul>
              ) : (
                <ul className="space-y-2">
                  <li>• Book New Service</li>
                  <li>• Track Service Status</li>
                  <li>• Reschedule Appointments</li>
                  <li>• View Service History</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
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
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/*" element={<AuthRoutes />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
