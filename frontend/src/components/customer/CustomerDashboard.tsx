import { Calendar, Wrench, Car, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { StatusBadge } from '../shared/StatusBadge';
import type { User } from '../../contexts/AuthContext';

interface CustomerDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

export function CustomerDashboard({ user, onNavigate }: CustomerDashboardProps) {
  const activeProjects = [
    {
      id: '1',
      service: 'Oil Change & Filter Replacement',
      progress: 75,
      status: 'in-progress' as const,
      estimatedCompletion: '30 minutes',
      technician: 'Mike Johnson',
      startedAt: '2 hours ago'
    },
    {
      id: '2',
      service: 'Engine Tuning & Diagnostics',
      progress: 60,
      status: 'in-progress' as const,
      estimatedCompletion: '2 hours',
      technician: 'Sarah Williams',
      startedAt: '4 hours ago'
    }
  ];

  const upcomingAppointment = {
    service: 'Brake Inspection',
    date: 'Tomorrow',
    time: '2:00 PM',
    technician: 'David Chen'
  };

  const stats = [
    { label: 'Total Services', value: '12', icon: Wrench, color: 'bg-blue-500' },
    { label: 'Completed', value: '10', icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'In Progress', value: '2', icon: Clock, color: 'bg-amber-500' },
    { label: 'Next Visit', value: '1 day', icon: Calendar, color: 'bg-purple-500' }
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

        <div className="grid md:grid-cols-2 gap-4">
          {activeProjects.map((project) => (
            <Card key={project.id} className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-[#03045e]">{project.service}</h4>
                    <p className="text-slate-600 mt-1">Started {project.startedAt}</p>
                  </div>
                  <StatusBadge status={project.status} />
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
                      <p className="text-slate-900">{project.technician}</p>
                      <p className="text-slate-500">Technician</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-600">ETA</p>
                    <p className="text-[#0077b6]">{project.estimatedCompletion}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Appointment */}
      <Card className="p-6 border-slate-200 bg-gradient-to-br from-[#90e0ef]/10 to-white">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#0077b6] flex items-center justify-center flex-shrink-0">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-[#03045e]">Upcoming Appointment</h3>
            <p className="text-slate-600 mt-2">{upcomingAppointment.service}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#0077b6]" />
                <span className="text-slate-900">{upcomingAppointment.date} at {upcomingAppointment.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-[#0077b6]" />
                <span className="text-slate-900">with {upcomingAppointment.technician}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="hidden md:flex">
            Reschedule
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-[#03045e]">Recent Activity</h3>
        
        <div className="space-y-3">
          {[
            { action: 'Service Started', detail: 'Oil Change & Filter Replacement', time: '2 hours ago' },
            { action: 'Appointment Confirmed', detail: 'Brake Inspection', time: '1 day ago' },
            { action: 'Service Completed', detail: 'Tire Rotation', time: '3 days ago' },
            { action: 'Payment Processed', detail: '$89.99 for Engine Diagnostics', time: '5 days ago' }
          ].map((activity, index) => (
            <Card key={index} className="p-4 border-slate-200">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-[#0077b6]" />
                <div className="flex-1">
                  <p className="text-slate-900">{activity.action}</p>
                  <p className="text-slate-600">{activity.detail}</p>
                </div>
                <p className="text-slate-500">{activity.time}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
