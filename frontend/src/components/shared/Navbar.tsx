import { Car, Bell, LogOut, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { User as UserType } from '../../contexts/AuthContext';

interface NavbarProps {
  user: UserType;
  onLogout: () => void;
  onNotificationClick: () => void;
  onProfileClick?: () => void;
}

export function Navbar({ user, onLogout, onNotificationClick, onProfileClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0077b6] to-[#03045e] flex items-center justify-center">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-[#03045e]">AutoCare</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            onClick={onNotificationClick}
            className="relative h-10 w-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white p-0 flex items-center justify-center">
              3
            </Badge>
          </button>

          {/* User Menu */}
          {user.role === 'customer' ? (
            <button
              onClick={onProfileClick}
              className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors cursor-pointer"
            >
              <div className="text-right">
                <p className="text-slate-900">{user.firstName} {user.lastName}</p>
                <p className="text-slate-500 capitalize">{user.role}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#90e0ef]/20 flex items-center justify-center">
                <User className="h-5 w-5 text-[#0077b6]" />
              </div>
            </button>
          ) : (
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right">
                <p className="text-slate-900">{user.firstName} {user.lastName}</p>
                <p className="text-slate-500 capitalize">{user.role}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-[#90e0ef]/20 flex items-center justify-center">
                <User className="h-5 w-5 text-[#0077b6]" />
              </div>
            </div>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-slate-600 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
