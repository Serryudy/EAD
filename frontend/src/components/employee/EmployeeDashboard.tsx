import { useState } from 'react';
import { Wrench, Clock, CheckCircle2, TrendingUp, Play, Pause, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { StatusBadge } from '../shared/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { User } from '../../contexts/AuthContext';

interface EmployeeDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [isLoggingTime, setIsLoggingTime] = useState(false);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timeLogNotes, setTimeLogNotes] = useState('');

  const assignedServices = [
    {
      id: '1',
      service: 'Oil Change & Filter',
      vehicle: '2022 Toyota Camry',
      customer: 'John Doe',
      status: 'in-progress' as const,
      progress: 75,
      startedAt: '2 hours ago',
      estimatedTime: '30 min',
      priority: 'high'
    },
    {
      id: '2',
      service: 'Engine Tune-Up',
      vehicle: '2021 Honda Accord',
      customer: 'Jane Smith',
      status: 'in-progress' as const,
      progress: 60,
      startedAt: '4 hours ago',
      estimatedTime: '2 hours',
      priority: 'medium'
    },
    {
      id: '3',
      service: 'Brake Inspection',
      vehicle: '2023 Ford F-150',
      customer: 'Mike Johnson',
      status: 'pending' as const,
      progress: 0,
      startedAt: 'Not started',
      estimatedTime: '1.5 hours',
      priority: 'low'
    }
  ];

  const upcomingAppointments = [
    { time: '2:00 PM', service: 'Tire Rotation', customer: 'Sarah Williams', vehicle: 'BMW X5' },
    { time: '3:30 PM', service: 'AC Service', customer: 'David Chen', vehicle: 'Tesla Model 3' }
  ];

  const workloadData = [
    { day: 'Mon', services: 8 },
    { day: 'Tue', services: 12 },
    { day: 'Wed', services: 10 },
    { day: 'Thu', services: 14 },
    { day: 'Fri', services: 11 },
    { day: 'Sat', services: 6 }
  ];

  const stats = [
    { label: 'Active Services', value: '2', icon: Wrench, color: 'bg-blue-500' },
    { label: 'Completed Today', value: '5', icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Hours Logged', value: '6.5', icon: Clock, color: 'bg-amber-500' },
    { label: 'This Week', value: '23', icon: TrendingUp, color: 'bg-purple-500' }
  ];

  const handleStartTimer = (serviceId: string) => {
    setActiveTimer(serviceId);
  };

  const handleStopTimer = () => {
    setActiveTimer(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* Welcome Section */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-[#0077b6] to-[#03045e] text-white border-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-white">Welcome, {user.firstName}!</h2>
            <p className="text-white/90 mt-2">You have 2 active services and 2 upcoming appointments today</p>
          </div>
          <Dialog open={isLoggingTime} onOpenChange={setIsLoggingTime}>
            <DialogTrigger asChild>
              <Button className="bg-white text-[#0077b6] hover:bg-white/90 h-12">
                <Clock className="h-5 w-5 mr-2" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Service Time</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Input placeholder="Select service..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={timeLogNotes}
                    onChange={(e) => setTimeLogNotes(e.target.value)}
                    placeholder="Add notes about the work performed..."
                    rows={4}
                  />
                </div>
                <Button className="w-full bg-[#0077b6] hover:bg-[#03045e]">
                  Save Time Log
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

      {/* Assigned Services */}
      <div className="space-y-4">
        <h3 className="text-[#03045e]">Assigned Services</h3>
        
        <div className="space-y-4">
          {assignedServices.map((service) => (
            <Card key={service.id} className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h4 className="text-[#03045e]">{service.service}</h4>
                      <StatusBadge status={service.status} />
                    </div>
                    <p className="text-slate-600">Vehicle: {service.vehicle}</p>
                    <p className="text-slate-600">Customer: {service.customer}</p>
                  </div>

                  <div className="flex gap-2">
                    {activeTimer === service.id ? (
                      <Button
                        onClick={handleStopTimer}
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Stop Timer
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleStartTimer(service.id)}
                        className="bg-[#0077b6] hover:bg-[#03045e]"
                        disabled={service.status === 'pending'}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Timer
                      </Button>
                    )}
                  </div>
                </div>

                {service.status !== 'pending' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-[#0077b6]">{service.progress}%</span>
                    </div>
                    <Progress value={service.progress} className="h-2" />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Started: {service.startedAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Est. Time: {service.estimatedTime}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    service.priority === 'high' ? 'bg-red-100 text-red-700' :
                    service.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {service.priority.toUpperCase()} PRIORITY
                  </div>
                </div>

                {activeTimer === service.id && (
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-green-700">Timer running - 00:15:23</p>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="p-6 border-slate-200">
          <h3 className="text-[#03045e] mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment, index) => (
              <div key={index} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#0077b6] flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-slate-900">{appointment.service}</p>
                      <p className="text-[#0077b6]">{appointment.time}</p>
                    </div>
                    <p className="text-slate-600">{appointment.customer}</p>
                    <p className="text-slate-600">{appointment.vehicle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Workload Chart */}
        <Card className="p-6 border-slate-200">
          <h3 className="text-[#03045e] mb-4">Weekly Workload</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="services" fill="#0077b6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
