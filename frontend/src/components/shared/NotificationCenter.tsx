import { X, CheckCheck, Clock, Wrench, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const notifications = [
    {
      id: '1',
      title: 'Oil Change 75% Complete',
      message: 'Your oil change service is almost done. Estimated completion in 30 minutes.',
      type: 'progress',
      timestamp: '10 minutes ago',
      read: false
    },
    {
      id: '2',
      title: 'Appointment Confirmed',
      message: 'Your brake inspection appointment is scheduled for tomorrow at 2:00 PM.',
      type: 'appointment',
      timestamp: '2 hours ago',
      read: false
    },
    {
      id: '3',
      title: 'Service Complete',
      message: 'Your tire rotation service has been completed. Vehicle is ready for pickup.',
      type: 'complete',
      timestamp: '1 day ago',
      read: true
    },
    {
      id: '4',
      title: 'Reminder: Upcoming Service',
      message: 'Your scheduled engine tune-up is in 3 days.',
      type: 'reminder',
      timestamp: '2 days ago',
      read: true
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <Wrench className="h-5 w-5 text-[#0077b6]" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-[#0077b6]" />;
      case 'complete':
        return <CheckCheck className="h-5 w-5 text-green-600" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end">
      <Card className="w-full md:w-96 h-full md:h-auto md:m-4 md:max-h-[calc(100vh-2rem)] bg-white shadow-2xl flex flex-col rounded-none md:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h3 className="text-[#03045e]">Notifications</h3>
            <p className="text-slate-600">{notifications.filter(n => !n.read).length} unread</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                notification.read
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-[#90e0ef]/10 border-[#0077b6]/30 hover:border-[#0077b6]/50'
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-slate-900">{notification.title}</h4>
                    {!notification.read && (
                      <Badge className="bg-[#0077b6] text-white">New</Badge>
                    )}
                  </div>
                  <p className="text-slate-600 mt-1">{notification.message}</p>
                  <p className="text-slate-500 mt-2">{notification.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <Button variant="outline" className="w-full">
            Mark All as Read
          </Button>
        </div>
      </Card>
    </div>
  );
}
