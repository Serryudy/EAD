import { X, CheckCheck, Clock, Wrench, Calendar, Bell, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationCenterProps {
  onClose: () => void;
}

interface Notification {
  _id: string;
  recipient: string;
  recipientRole: string;
  type: string;
  title: string;
  message: string;
  relatedEntity?: {
    entityType: string;
    entityId: string;
  };
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'service_started':
      case 'service_completed':
        return <Wrench className="h-5 w-5 text-[#0077b6]" />;
      case 'appointment_created':
      case 'appointment_confirmed':
      case 'appointment_cancelled':
        return <Calendar className="h-5 w-5 text-[#0077b6]" />;
      case 'vehicle_ready':
        return <CheckCheck className="h-5 w-5 text-green-600" />;
      case 'appointment_reminder':
      case 'payment_reminder':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'system_notification':
        return <Bell className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 border-red-300';
      case 'high':
        return 'bg-orange-100 border-orange-300';
      case 'medium':
        return 'bg-blue-100 border-blue-300';
      case 'low':
        return 'bg-slate-100 border-slate-300';
      default:
        return 'bg-slate-100 border-slate-300';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const handleNotificationClick = async (notificationId: string, isRead: boolean, actionUrl?: string) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end">
      <Card className="w-full md:w-96 h-full md:h-auto md:m-4 md:max-h-[calc(100vh-2rem)] bg-white shadow-2xl flex flex-col rounded-none md:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-semibold text-[#03045e]">Notifications</h3>
            <p className="text-sm text-slate-600">{unreadCount} unread</p>
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b6]"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">No notifications yet</p>
              <p className="text-sm text-slate-500 mt-1">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification: Notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification._id, notification.isRead, notification.actionUrl)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  notification.isRead
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-[#90e0ef]/10 border-[#0077b6]/30 hover:border-[#0077b6]/50'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                    notification.isRead ? 'bg-slate-100' : getPriorityColor(notification.priority || 'medium')
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900">{notification.title}</h4>
                      {!notification.isRead && (
                        <Badge className="bg-[#0077b6] text-white text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || loading}
          >
            Mark All as Read
          </Button>
        </div>
      </Card>
    </div>
  );
}
