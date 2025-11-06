import { LayoutDashboard, Calendar, Wrench, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { User } from '../../contexts/AuthContext';

interface MobileNavProps {
  user: User;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function MobileNav({ user }: MobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const customerMenuItems = [
    { id: 'customer-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'appointment-booking', label: 'Book', icon: Calendar, path: '/appointments/book' },
    { id: 'service-progress', label: 'Progress', icon: Wrench, path: '/service/progress' },
  ];

  const employeeMenuItems = [
    { id: 'employee-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/employee/dashboard' },
    { id: 'service-progress', label: 'Services', icon: Wrench, path: '/service/progress' },
  ];

  const adminMenuItems = [
    { id: 'admin-panel', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/panel' },
    { id: 'admin-employees', label: 'Employees', icon: Users, path: '/admin/employees' },
  ];

  let menuItems = customerMenuItems;
  if (user.role === 'employee') menuItems = employeeMenuItems;
  if (user.role === 'admin') menuItems = adminMenuItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-t border-slate-200 z-40">
      <div className="h-full px-2 flex items-center justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'text-[#0077b6]' 
                  : 'text-slate-500'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
