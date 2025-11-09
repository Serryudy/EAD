import { useState, useEffect } from 'react';
import { Calendar, Wrench, Car, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { StatusBadge } from '../shared/StatusBadge';
import type { User } from '../../contexts/AuthContext';
import { dashboardApi } from '../../services/api';
import { toast } from 'sonner';

interface CustomerDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

interface ServiceRecord {
  id: string;
  serviceType: string;
  serviceDescription?: string;
  status: string;
  progress: number;
  vehicle: {
    make: string;
    model: string;
    licensePlate: string;
    year?: number;
  } | null;
  employee: {
    name: string;
    position: string;
  } | null;
  dateScheduled: Date;
  timeScheduled: string;
  estimatedCost: number;
  timerStarted: boolean;
  startedAt?: Date;
  eta?: number;
  createdAt: Date;
}

interface UpcomingAppointment {
  id: string;
  serviceType: string;
  serviceDescription?: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: string;
  vehicle: {
    make: string;
    model: string;
    licensePlate: string;
    year?: number;
  } | null;
  employee: {
    name: string;
    position: string;
  } | null;
  estimatedDuration?: string;
  estimatedCost?: number;
  timeWindow?: string;
}

interface RecentActivity {
  action: string;
  detail: string;
  timeAgo: string;
  timestamp: Date;
  type: string;
  status: string;
}

export function CustomerDashboard({ user, onNavigate }: CustomerDashboardProps) {
  const [activeServices, setActiveServices] = useState<ServiceRecord[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceRecords();
    fetchUpcomingAppointments();
    fetchRecentActivities();
  }, []);

  const fetchServiceRecords = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching customer service records...');
      
      const response = await dashboardApi.getCustomerServiceRecords();
      console.log('📦 Service records response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Service records data:', response.data);
        setActiveServices(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching service records:', error);
      toast.error('Failed to fetch service records');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      console.log('🔄 Fetching upcoming appointments...');
      
      const response = await dashboardApi.getCustomerUpcomingAppointments();
      console.log('📦 Upcoming appointments response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Upcoming appointments data:', response.data);
        setUpcomingAppointments(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching upcoming appointments:', error);
      // Don't show error toast as it's not critical
    }
  };

  const fetchRecentActivities = async () => {
    try {
      console.log('🔄 Fetching recent activities...');
      
      const response = await dashboardApi.getCustomerRecentActivities();
      console.log('📦 Recent activities response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Recent activities data:', response.data);
        setRecentActivities(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error);
      // Don't show error toast as it's not critical
    }
  };

  const activeProjects = activeServices.filter(s => 
    ['received', 'in-progress', 'quality-check'].includes(s.status)
  ).slice(0, 4);

  const completedServices = activeServices.filter(s => s.status === 'completed').length;
  const inProgressServices = activeServices.filter(s => 
    ['received', 'in-progress', 'quality-check'].includes(s.status)
  ).length;

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const stats = [
    { label: 'Total Services', value: activeServices.length.toString(), icon: Wrench, color: 'bg-blue-500' },
    { label: 'Completed', value: completedServices.toString(), icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'In Progress', value: inProgressServices.toString(), icon: Clock, color: 'bg-amber-500' },
    { label: 'Next Visit', value: activeProjects.length > 0 ? 'Active' : '—', icon: Calendar, color: 'bg-purple-500' }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* Welcome Banner */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-[#0077b6] to-[#03045e] text-white border-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-white">Welcome back, {user.firstName}!</h2>
            <p className="text-white/90 mt-2">
              Track your vehicle services and manage appointments
            </p>
            {user.vehicle && (
              <div className="flex items-center gap-2 mt-4 text-white/90">
                <Car className="h-5 w-5" />
                <span>{user.vehicle.year} {user.vehicle.make} {user.vehicle.model}</span>
                <span className="px-2 py-1 rounded bg-white/20">{user.vehicle.licensePlate}</span>
              </div>
            )}
          </div>
          <Button
            onClick={() => onNavigate('appointment-booking')}
            className="bg-white text-[#0077b6] hover:bg-white/90 h-12"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Book Appointment
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600">{stat.label}</p>
                  <h3 className="text-[#03045e] mt-1">{stat.value}</h3>
                </div>
                <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[#03045e]">Active Services</h3>
          <Button
            variant="ghost"
            onClick={() => onNavigate('service-progress')}
            className="text-[#0077b6]"
          >
            View All
          </Button>
        </div>

        {loading ? (
          <Card className="p-6">
            <p className="text-center text-slate-600">Loading services...</p>
          </Card>
        ) : activeProjects.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-slate-600">No active services at the moment</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeProjects.map((project) => (
              <Card key={project.id} className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[#03045e]">{project.serviceType}</h4>
                      <p className="text-slate-600 mt-1">
                        {project.startedAt 
                          ? `Started ${getTimeAgo(project.startedAt)}`
                          : `Scheduled for ${new Date(project.dateScheduled).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                    <StatusBadge status={project.status as any} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-[#0077b6]">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#90e0ef]/20 flex items-center justify-center">
                        <Wrench className="h-4 w-4 text-[#0077b6]" />
                      </div>
                      <div>
                        <p className="text-slate-900">
                          {project.employee?.name || 'Assigning...'}
                        </p>
                        <p className="text-slate-500">
                          {project.employee?.position || 'Technician'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-600">ETA</p>
                      <p className="text-[#0077b6]">
                        {project.eta ? `${project.eta} min` : project.timeScheduled}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Appointment */}
      <Card className="p-6 border-slate-200 bg-gradient-to-br from-[#90e0ef]/10 to-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#0077b6] flex items-center justify-center flex-shrink-0">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[#03045e]">Upcoming Appointment</h3>
            {upcomingAppointments.length > 0 ? (
              <>
                <p className="text-slate-600 mt-2">
                  {upcomingAppointments[0].serviceType}
                  {upcomingAppointments[0].serviceDescription && ` - ${upcomingAppointments[0].serviceDescription}`}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#0077b6]" />
                    <span className="text-slate-900">
                      {new Date(upcomingAppointments[0].appointmentDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {upcomingAppointments[0].appointmentTime}
                    </span>
                  </div>
                  {upcomingAppointments[0].employee && (
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-[#0077b6]" />
                      <span className="text-slate-900">
                        with {upcomingAppointments[0].employee.name}
                      </span>
                    </div>
                  )}
                </div>
                {upcomingAppointments[0].vehicle && (
                  <div className="mt-3">
                    <p className="text-slate-600">
                      {upcomingAppointments[0].vehicle.year} {upcomingAppointments[0].vehicle.make} {upcomingAppointments[0].vehicle.model} 
                      ({upcomingAppointments[0].vehicle.licensePlate})
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-600 mt-2">No upcoming appointments</p>
            )}
          </div>
          {upcomingAppointments.length > 0 && (
            <Button variant="outline" className="hidden md:flex">
              Reschedule
            </Button>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-[#03045e]">Recent Activity</h3>
        
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <Card key={index} className="p-4 border-slate-200">
                <div className="flex items-center gap-4">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === 'service' && activity.status === 'completed' ? 'bg-green-500' :
                    activity.type === 'service' && activity.status === 'in-progress' ? 'bg-blue-500' :
                    activity.type === 'payment' ? 'bg-purple-500' :
                    activity.type === 'appointment' && activity.status === 'confirmed' ? 'bg-[#0077b6]' :
                    activity.type === 'appointment' && activity.status === 'cancelled' ? 'bg-red-500' :
                    'bg-[#0077b6]'
                  }`} />
                  <div className="flex-1">
                    <p className="text-slate-900 font-medium">{activity.action}</p>
                    <p className="text-slate-600 text-sm">{activity.detail}</p>
                  </div>
                  <p className="text-slate-500 text-sm">{activity.timeAgo}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 border-slate-200">
            <p className="text-center text-slate-500">No recent activities</p>
          </Card>
        )}
      </div>
    </div>
  );
}
