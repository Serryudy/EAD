import { ArrowLeft, CheckCircle2, Clock, Wrench, Shield, Package } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { StatusBadge } from '../shared/StatusBadge';
import type { User } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';

interface ServiceProgressProps {
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
  actualCost?: number;
  timerStarted: boolean;
  startedAt?: Date;
  estimatedCompletionTime?: Date;
  eta?: number;
  liveUpdates: Array<{
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
}

export function ServiceProgress({ onNavigate }: ServiceProgressProps) {
  const [activeServices, setActiveServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveServices();
    
    // Set up auto-refresh every 30 seconds to get live updates
    const interval = setInterval(fetchActiveServices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchActiveServices = async () => {
    try {
      console.log('🔄 Fetching active services...');
      
      const response = await dashboardApi.getCustomerServiceRecords();
      console.log('📦 Service records response:', response);
      
      if (response.success && response.data) {
        // Filter only active services (not completed or cancelled)
        const active = response.data.filter((record: ServiceRecord) => 
          ['received', 'in-progress', 'quality-check'].includes(record.status)
        );
        console.log('✅ Active services:', active.length);
        setActiveServices(active);
      }
    } catch (error) {
      console.error('❌ Error fetching active services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStages = (currentStatus: string, startedAt?: Date, liveUpdates?: Array<{ message: string; timestamp: Date }>) => {
    const stages = [
      { 
        name: 'Received', 
        status: 'completed', 
        time: startedAt ? new Date(startedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Completed',
        icon: Package 
      },
      { 
        name: 'In Progress', 
        status: currentStatus === 'in-progress' || currentStatus === 'quality-check' || currentStatus === 'completed' ? 'completed' : 
                currentStatus === 'in-progress' ? 'in-progress' : 'pending',
        time: currentStatus === 'in-progress' || currentStatus === 'quality-check' || currentStatus === 'completed' ? 
              (liveUpdates && liveUpdates.length > 0 ? new Date(liveUpdates[liveUpdates.length - 1].timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'In Progress') : 'Pending',
        icon: Wrench 
      },
      { 
        name: 'Quality Check', 
        status: currentStatus === 'quality-check' ? 'in-progress' : 
                currentStatus === 'completed' ? 'completed' : 'pending',
        time: currentStatus === 'quality-check' || currentStatus === 'completed' ? 'Checking' : 'Pending',
        icon: Shield 
      },
      { 
        name: 'Completed', 
        status: currentStatus === 'completed' ? 'completed' : 'pending',
        time: 'Pending',
        icon: CheckCircle2 
      }
    ];
    
    return stages;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 w-full">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => onNavigate('customer-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-[#03045e]">Service Progress</h2>
          <p className="text-slate-600">Track your vehicle services in real-time</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077b6] mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading service progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeServices.length === 0) {
    return (
      <div className="p-4 md:p-6 w-full">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => onNavigate('customer-dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-[#03045e]">Service Progress</h2>
          <p className="text-slate-600">Track your vehicle services in real-time</p>
        </div>
        <Card className="p-12 border-slate-200">
          <div className="text-center">
            <Wrench className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-slate-900 mb-2">No Active Services</h3>
            <p className="text-slate-600">You don't have any services in progress at the moment.</p>
            <Button
              onClick={() => onNavigate('appointment-booking')}
              className="bg-[#0077b6] hover:bg-[#0077b6]/90 mt-6"
            >
              Book a Service
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => onNavigate('customer-dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h2 className="text-[#03045e]">Service Progress</h2>
        <p className="text-slate-600">Track your vehicle services in real-time</p>
      </div>

      <div className="space-y-6">
        {activeServices.map((service) => {
          const stages = getStages(service.status, service.startedAt, service.liveUpdates);
          
          return (
            <Card key={service.id} className="p-6 border-slate-200">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                <div>
                  <h3 className="text-[#03045e]">
                    {service.serviceType}
                    {service.serviceDescription && ` - ${service.serviceDescription}`}
                  </h3>
                  <p className="text-slate-600 mt-1">
                    {service.startedAt 
                      ? `Started at ${new Date(service.startedAt).toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}`
                      : `Scheduled for ${new Date(service.dateScheduled).toLocaleDateString()}`
                    }
                  </p>
                  {service.vehicle && (
                    <p className="text-slate-500 text-sm mt-1">
                      {service.vehicle.year} {service.vehicle.make} {service.vehicle.model} ({service.vehicle.licensePlate})
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={service.status} />
                  <div className="text-right hidden md:block">
                    <p className="text-slate-600">Progress</p>
                    <p className="text-[#0077b6]">{service.progress}%</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600">Overall Progress</span>
                  <span className="text-[#0077b6]">{service.progress}%</span>
                </div>
                <Progress value={service.progress} className="h-2" />
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <h4 className="text-slate-900 mb-4">Service Timeline</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stages.map((stage, index) => {
                    const Icon = stage.icon;
                    return (
                      <div key={index} className="relative">
                        <div className={`p-4 rounded-xl border-2 transition-all ${
                          stage.status === 'completed'
                            ? 'border-green-500 bg-green-50'
                            : stage.status === 'in-progress'
                            ? 'border-[#0077b6] bg-[#90e0ef]/10'
                            : 'border-slate-200 bg-white'
                        }`}>
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              stage.status === 'completed'
                                ? 'bg-green-500 text-white'
                                : stage.status === 'in-progress'
                                ? 'bg-[#0077b6] text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className={`${
                                stage.status === 'pending' ? 'text-slate-500' : 'text-slate-900'
                              }`}>
                                {stage.name}
                              </p>
                              <p className="text-slate-600">{stage.time}</p>
                            </div>
                          </div>
                        </div>
                        {index < stages.length - 1 && (
                          <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-slate-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#0077b6] flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-600">Technician</p>
                      <p className="text-slate-900">{service.employee?.name || 'Assigning...'}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-600">Est. Completion</p>
                      <p className="text-slate-900">
                        {service.estimatedCompletionTime 
                          ? new Date(service.estimatedCompletionTime).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })
                          : service.eta ? `${service.eta} min` : service.timeScheduled
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Live Updates */}
              <div>
                <h4 className="text-slate-900 mb-3">Live Updates</h4>
                {service.liveUpdates && service.liveUpdates.length > 0 ? (
                  <div className="space-y-2">
                    {service.liveUpdates.slice().reverse().map((update, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                        <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                          index === 0 ? 'bg-[#0077b6] animate-pulse' : 'bg-slate-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-slate-900">{update.message}</p>
                          <p className="text-slate-500 text-sm">
                            {new Date(update.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-lg bg-slate-50 text-center">
                    <p className="text-slate-500">No updates yet</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        </div>
      </div>
    );
  }
