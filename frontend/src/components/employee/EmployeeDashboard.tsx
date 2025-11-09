import { useState, useEffect, useRef } from 'react';
import { Wrench, Clock, CheckCircle2, TrendingUp, Play, Pause, Calendar, Loader2 } from 'lucide-react';
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
import { dashboardApi } from '../../services/api';
import { toast } from 'sonner';

interface EmployeeDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

interface Assignment {
  id: string;
  serviceType: string;
  serviceDescription?: string;
  vehicle: {
    make: string;
    model: string;
    licensePlate: string;
    year?: number;
  } | null;
  appointment: any;
  status: string;
  startTime?: Date;
  timerStarted: boolean;
  timerDuration: number;
  estimatedDuration: number;
  progressPercentage: number;
  dateScheduled: Date;
  timeScheduled: string;
  createdAt: Date;
}

interface UpcomingAppointment {
  id: string;
  serviceType: string;
  serviceDescription?: string;
  vehicle: {
    make: string;
    model: string;
    licensePlate: string;
    year?: number;
  } | null;
  customer: {
    name: string;
    phoneNumber: string;
  } | null;
  appointmentDate: Date;
  appointmentTime: string;
  status: string;
  progress: number;
  currentStage?: string;
  estimatedDuration?: string;
  estimatedCost?: number;
}

interface TimerState {
  [key: string]: {
    isRunning: boolean;
    elapsedTime: number;
    startTime: number;
  };
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [isLoggingTime, setIsLoggingTime] = useState(false);
  const [timeLogNotes, setTimeLogNotes] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [timers, setTimers] = useState<TimerState>({});
  const [loading, setLoading] = useState(true);
  const [workloadData, setWorkloadData] = useState<Array<{ day: string; services: number }>>([]);
  const intervalRefs = useRef<{ [key: string]: ReturnType<typeof setInterval> }>({});

  // Fetch assigned service records when component mounts
  useEffect(() => {
    fetchAssignments();
    fetchUpcomingAppointments();
    fetchWeeklyWorkload();
    return () => {
      // Clear all intervals on unmount
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching employee assignments...');
      
      const response = await dashboardApi.getEmployeeAssignments();
      console.log('📦 Response received:', response);
      
      if (response.success && response.data) {
        console.log('✅ Assignments data:', response.data);
        setAssignments(response.data);
        
        // Initialize timers for assignments that are already running
        const initialTimers: TimerState = {};
        response.data.forEach((assignment: Assignment) => {
          if (assignment.timerStarted && assignment.startTime) {
            const startTime = new Date(assignment.startTime).getTime();
            const elapsedTime = assignment.timerDuration || (Date.now() - startTime);
            initialTimers[assignment.id] = {
              isRunning: true,
              elapsedTime,
              startTime
            };
            
            // Start the interval for running timers
            startTimerInterval(assignment.id);
          }
        });
        setTimers(initialTimers);
      } else {
        console.warn('⚠️ No data in response or success=false');
      }
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      console.log('🔄 Fetching upcoming appointments...');
      
      const response = await dashboardApi.getEmployeeAppointments();
      console.log('📦 Appointments response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Appointments data:', response.data);
        setUpcomingAppointments(response.data);
      } else {
        console.warn('⚠️ No appointments data in response');
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      // Don't show error toast for appointments as it's not critical
    }
  };

  const fetchWeeklyWorkload = async () => {
    try {
      console.log('🔄 Fetching weekly workload...');
      
      const response = await dashboardApi.getEmployeeWeeklyWorkload();
      console.log('📊 Workload response:', response);
      
      if (response.success && response.data) {
        // Transform the data to match chart format
        const chartData = response.data.labels.map((label: string, index: number) => ({
          day: label,
          services: response.data.data[index]
        }));
        setWorkloadData(chartData);
        console.log('✅ Workload data set:', chartData);
      }
    } catch (error) {
      console.error('❌ Error fetching weekly workload:', error);
      // Set default data on error
      setWorkloadData([
        { day: 'Mon', services: 0 },
        { day: 'Tue', services: 0 },
        { day: 'Wed', services: 0 },
        { day: 'Thu', services: 0 },
        { day: 'Fri', services: 0 },
        { day: 'Sat', services: 0 },
        { day: 'Sun', services: 0 }
      ]);
    }
  };

  const startTimerInterval = (assignmentId: string) => {
    if (intervalRefs.current[assignmentId]) {
      clearInterval(intervalRefs.current[assignmentId]);
    }
    
    intervalRefs.current[assignmentId] = setInterval(() => {
      setTimers(prev => {
        const timer = prev[assignmentId];
        if (!timer || !timer.isRunning) return prev;
        
        const newElapsedTime = Date.now() - timer.startTime;
        
        return {
          ...prev,
          [assignmentId]: {
            ...timer,
            elapsedTime: newElapsedTime
          }
        };
      });
    }, 1000);
  };

  const toggleTimer = async (assignmentId: string) => {
    const currentTimer = timers[assignmentId];
    
    if (!currentTimer?.isRunning) {
      // Start timer
      try {
        const response = await dashboardApi.startServiceTimer(assignmentId);
        
        if (response.success) {
          const startTime = Date.now();
          
          setTimers(prev => ({
            ...prev,
            [assignmentId]: {
              isRunning: true,
              elapsedTime: prev[assignmentId]?.elapsedTime || 0,
              startTime
            }
          }));

          // Start interval
          startTimerInterval(assignmentId);

          toast.success('Service timer has been started');
          
          // Refresh assignments to update status
          fetchAssignments();
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to start timer');
      }
    } else {
      // Pause/Stop timer
      try {
        const response = await dashboardApi.stopServiceTimer(assignmentId);
        
        if (response.success) {
          if (intervalRefs.current[assignmentId]) {
            clearInterval(intervalRefs.current[assignmentId]);
            delete intervalRefs.current[assignmentId];
          }
          
          setTimers(prev => ({
            ...prev,
            [assignmentId]: {
              ...prev[assignmentId],
              isRunning: false
            }
          }));

          toast.success('Service timer has been paused');
          
          // Refresh assignments
          fetchAssignments();
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to pause timer');
      }
    }
  };

  const calculateProgress = (assignment: Assignment): number => {
    const timer = timers[assignment.id];
    if (!timer) return assignment.progressPercentage || 0;
    
    const estimatedMs = assignment.estimatedDuration * 60 * 1000;
    const progress = (timer.elapsedTime / estimatedMs) * 100;
    
    return Math.min(progress, 100);
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const stats = [
    { label: 'Active Services', value: assignments.filter(a => a.status === 'in-progress').length.toString(), icon: Wrench, color: 'bg-blue-500' },
    { label: 'Completed Today', value: '5', icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Hours Logged', value: '6.5', icon: Clock, color: 'bg-amber-500' },
    { label: 'This Week', value: assignments.length.toString(), icon: TrendingUp, color: 'bg-purple-500' }
  ];

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

      {/* Assigned Services with Progress Bars */}
      <div className="space-y-4">
        <h3 className="text-[#03045e]">Assigned Services</h3>
        
        {loading ? (
          <Card className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#0077b6]" />
              <span className="ml-2 text-slate-600">Loading assignments...</span>
            </div>
          </Card>
        ) : assignments.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-slate-600">No assignments yet. Check back later!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const progress = calculateProgress(assignment);
              const timer = timers[assignment.id];
              const isRunning = timer?.isRunning || false;
              
              return (
                <Card key={assignment.id} className="p-6 border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <h4 className="text-[#03045e]">{assignment.serviceType}</h4>
                          <StatusBadge status={assignment.status as any} />
                        </div>
                        {assignment.vehicle && (
                          <p className="text-slate-600">
                            Vehicle: {assignment.vehicle.year || ''} {assignment.vehicle.make} {assignment.vehicle.model} - {assignment.vehicle.licensePlate}
                          </p>
                        )}
                        {assignment.serviceDescription && (
                          <p className="text-slate-500 text-sm mt-1">{assignment.serviceDescription}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleTimer(assignment.id)}
                          variant={isRunning ? 'outline' : 'default'}
                          className={isRunning ? 'border-red-500 text-red-600 hover:bg-red-50' : 'bg-[#0077b6] hover:bg-[#03045e]'}
                        >
                          {isRunning ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </>
                          )}
                        </Button>
                        
                        {progress >= 100 && (
                          <Button variant="default" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">
                          Date: {new Date(assignment.dateScheduled).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">Time: {assignment.timeScheduled}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">Est.: {assignment.estimatedDuration} mins</span>
                      </div>
                      {timer && (
                        <div className="flex items-center gap-2 ml-auto">
                          <Clock className="h-4 w-4 text-[#0077b6]" />
                          <span className="font-mono text-lg font-semibold text-[#0077b6]">
                            {formatTime(timer.elapsedTime)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium text-[#0077b6]">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {isRunning && (
                      <Card className="p-4 bg-green-50 border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-green-700 font-medium">Timer running</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="p-6 border-slate-200">
          <h3 className="text-[#03045e] mb-4">Upcoming Appointments</h3>
          <div className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <p className="text-slate-600 text-center py-4">No upcoming appointments</p>
            ) : (
              upcomingAppointments.slice(0, 5).map((appointment) => {
                const vehicleInfo = appointment.vehicle
                  ? `${appointment.vehicle.year || ''} ${appointment.vehicle.make} ${appointment.vehicle.model}`.trim()
                  : 'N/A';
                
                return (
                  <div key={appointment.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0077b6] flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-slate-900 font-medium">{appointment.serviceType}</p>
                          <p className="text-[#0077b6] text-sm">{appointment.appointmentTime}</p>
                        </div>
                        <p className="text-slate-600 text-sm">{vehicleInfo}</p>
                        {appointment.customer && (
                          <p className="text-slate-500 text-sm">{appointment.customer.name}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-slate-500 text-xs">
                            {new Date(appointment.appointmentDate).toLocaleDateString()}
                          </p>
                          {appointment.currentStage && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-xs text-slate-500 capitalize">
                                {appointment.currentStage.replace('-', ' ')}
                              </span>
                            </>
                          )}
                          {appointment.progress > 0 && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-xs text-[#0077b6] font-medium">
                                {appointment.progress}% complete
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
