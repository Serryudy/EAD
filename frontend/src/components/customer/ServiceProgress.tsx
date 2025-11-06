import { ArrowLeft, CheckCircle2, Clock, Wrench, Shield, Package } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { StatusBadge } from '../shared/StatusBadge';
import type { User } from '../../contexts/AuthContext';

interface ServiceProgressProps {
  user: User;
  onNavigate: (page: string) => void;
}

export function ServiceProgress({ onNavigate }: ServiceProgressProps) {
  const activeServices = [
    {
      id: '1',
      service: 'Oil Change & Filter Replacement',
      startedAt: '2024-11-03 10:00 AM',
      estimatedCompletion: '2024-11-03 12:00 PM',
      currentStage: 'in-progress',
      progress: 75,
      technician: 'Mike Johnson',
      stages: [
        { name: 'Received', status: 'completed', time: '10:00 AM', icon: Package },
        { name: 'In Progress', status: 'in-progress', time: '10:30 AM', icon: Wrench },
        { name: 'Quality Check', status: 'pending', time: 'Pending', icon: Shield },
        { name: 'Completed', status: 'pending', time: 'Pending', icon: CheckCircle2 }
      ],
      updates: [
        { time: '11:30 AM', message: 'Quality inspection in progress' },
        { time: '10:45 AM', message: 'Oil filter replaced successfully' },
        { time: '10:30 AM', message: 'Started oil change procedure' },
        { time: '10:00 AM', message: 'Vehicle received and checked in' }
      ]
    },
    {
      id: '2',
      service: 'Engine Tuning & Diagnostics',
      startedAt: '2024-11-03 08:00 AM',
      estimatedCompletion: '2024-11-03 2:00 PM',
      currentStage: 'in-progress',
      progress: 60,
      technician: 'Sarah Williams',
      stages: [
        { name: 'Received', status: 'completed', time: '8:00 AM', icon: Package },
        { name: 'In Progress', status: 'in-progress', time: '8:30 AM', icon: Wrench },
        { name: 'Quality Check', status: 'pending', time: 'Pending', icon: Shield },
        { name: 'Completed', status: 'pending', time: 'Pending', icon: CheckCircle2 }
      ],
      updates: [
        { time: '11:00 AM', message: 'Engine diagnostics 60% complete' },
        { time: '9:30 AM', message: 'Spark plugs inspection completed' },
        { time: '8:30 AM', message: 'Initial diagnostics scan started' },
        { time: '8:00 AM', message: 'Vehicle received for engine tune-up' }
      ]
    }
  ];

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
        {activeServices.map((service) => (
            <Card key={service.id} className="p-6 border-slate-200">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
                <div>
                  <h3 className="text-[#03045e]">{service.service}</h3>
                  <p className="text-slate-600 mt-1">Started at {service.startedAt}</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status="in-progress" />
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
                  {service.stages.map((stage, index) => {
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
                        {index < service.stages.length - 1 && (
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
                      <p className="text-slate-900">{service.technician}</p>
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
                      <p className="text-slate-900">{service.estimatedCompletion}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Live Updates */}
              <div>
                <h4 className="text-slate-900 mb-3">Live Updates</h4>
                <div className="space-y-2">
                  {service.updates.map((update, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                      <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                        index === 0 ? 'bg-[#0077b6] animate-pulse' : 'bg-slate-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-slate-900">{update.message}</p>
                        <p className="text-slate-500">{update.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
