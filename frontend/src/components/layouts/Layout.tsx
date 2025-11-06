import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../shared/Navbar';
import { Sidebar } from '../shared/Sidebar';
import { MobileNav } from '../shared/MobileNav';
import { Chatbot } from '../shared/Chatbot';
import { NotificationCenter } from '../shared/NotificationCenter';
import { ProfileDialog } from '../customer/ProfileDialog';
import { useAuth } from '../../contexts/AuthContext';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();

  // Create a mock user if no user is logged in (for development)
  const mockUser = {
    id: '1',
    firstName: 'Guest',
    lastName: 'User',
    phone: '0000000000',
    email: 'guest@autocare.com',
    role: 'customer' as const
  };

  const currentUser = user || mockUser;

  // Handle logout with role-based navigation
  const handleLogout = () => {
    const userRole = currentUser.role;
    logout();
    
    // Navigate to appropriate login page based on user role
    switch (userRole) {
      case 'admin':
        navigate('/admin/login');
        break;
      case 'employee':
        navigate('/employee/login');
        break;
      case 'customer':
      default:
        navigate('/login');
        break;
    }
  };

  // Extract the current page from the route path
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'customer-dashboard';
    if (path === '/appointments/book') return 'appointment-booking';
    if (path === '/service/progress') return 'service-progress';
    if (path === '/employee/dashboard') return 'employee-dashboard';
    if (path === '/admin/panel') return 'admin-panel';
    return 'customer-dashboard';
  };

  // Check if we should hide the sidebar (for employee and admin)
  const shouldHideSidebar = currentUser.role === 'admin' || currentUser.role === 'employee';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar 
        user={currentUser} 
        onLogout={handleLogout}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
        onProfileClick={() => setShowProfile(true)}
      />
      
      <div className="flex">
        {!shouldHideSidebar && (
          <Sidebar 
            user={currentUser} 
            currentPage={getCurrentPage()}
            onNavigate={() => {}}
          />
        )}
        
        <main className={`flex-1 pt-16 pb-20 md:pb-6 ${!shouldHideSidebar ? 'md:ml-64' : ''}`}>
          <Outlet />
        </main>
      </div>

      {!shouldHideSidebar && (
        <MobileNav 
          user={currentUser}
          currentPage={getCurrentPage()}
          onNavigate={() => {}}
        />
      )}

      <Chatbot />

      {showNotifications && (
        <NotificationCenter 
          onClose={() => setShowNotifications(false)}
        />
      )}

      {currentUser && currentUser.role === 'customer' && (
        <ProfileDialog
          user={currentUser}
          open={showProfile}
          onOpenChange={setShowProfile}
        />
      )}
    </div>
  );
};