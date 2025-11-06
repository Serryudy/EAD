import { LayoutDashboard, Calendar, Wrench, Users, Settings, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../../contexts/AuthContext';

interface SidebarProps {
  user: User;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function Sidebar({ user }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const customerMenuItems = [
    { id: 'customer-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'appointment-booking', label: 'Book Appointment', icon: Calendar, path: '/appointments/book' },
    { id: 'service-progress', label: 'Service Progress', icon: Wrench, path: '/service/progress' },
  ];

  const employeeMenuItems = [
    { id: 'employee-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/employee/dashboard' },
    { id: 'service-progress', label: 'My Services', icon: Wrench, path: '/service/progress' },
  ];

  const adminMenuItems = [
    { id: 'admin-panel', label: 'Admin Panel', icon: LayoutDashboard, path: '/admin/panel' },
    { id: 'admin-employees', label: 'Employees', icon: Users, path: '/admin/employees' },
    { id: 'admin-reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'admin-settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  let menuItems = customerMenuItems;
  if (user.role === 'employee') menuItems = employeeMenuItems;
  if (user.role === 'admin') menuItems = adminMenuItems;

  return (
    <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 z-30">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-[#0077b6] to-[#03045e] text-white shadow-lg' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
