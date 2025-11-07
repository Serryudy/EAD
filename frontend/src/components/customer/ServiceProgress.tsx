import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Clock, Wrench, Shield, Package, Loader2, Car, User, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { StatusBadge } from '../shared/StatusBadge';
import type { User as UserType } from '../../contexts/AuthContext';

interface ServiceProgressProps {
  user: UserType;
  onNavigate: (page: string) => void;
}

interface Stage {
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp: string | null;
  icon: string;
}

interface Update {
  time: string;
  message: string;
  createdAt: string;
}

interface ActiveService {
  id: string;
  service: {
    _id: string | null;
    name: string;
    category: string;
    description?: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    type: string;
  };
  technician: {
    _id: string | null;
    firstName: string;
    lastName: string;
    fullName: string;
    specialization: string;
  };
  startedAt: string;
  estimatedCompletion: string;
  currentStage: string;
  progress: number;
  stages: Stage[];
  updates: Update[];
}

export function ServiceProgress({ onNavigate }: ServiceProgressProps) {
  const [activeServices, setActiveServices] = useState<ActiveService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveServices();
  }, []);

  const fetchActiveServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setError('Please log in to view service progress');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/appointments/active-services', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch active services');
      }

      const data = await response.json();

      if (data.success) {
        setActiveServices(data.data);
      }
    } catch (err) {
      console.error('Error fetching active services:', err);
      setError(err instanceof Error ? err.message : 'Failed to load active services');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, typeof Package> = {
      Package,
      Wrench,
      Shield,
      CheckCircle2,
      Clock
    };
    return iconMap[iconName] || Package;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 0',
        textAlign: 'center'
      }}>
        <div>
          <Loader2 style={{
            width: '48px',
            height: '48px',
            color: '#2F8BFF',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1rem'
          }}>
            Loading active services...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem'
      }}>
        <div style={{
          background: '#042A5C',
          border: '2px solid #2F8BFF',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <AlertCircle style={{
            width: '48px',
            height: '48px',
            color: '#ef4444',
            margin: '0 auto 1rem'
          }} />
          <p style={{
            color: 'white',
            marginBottom: '1.5rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {error}
          </p>
          <Button 
            onClick={fetchActiveServices}
            style={{
              background: '#2F8BFF',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1E7FEF'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2F8BFF'}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (activeServices.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem'
      }}>
        <div style={{
          background: '#042A5C',
          border: '2px solid #2F8BFF',
          borderRadius: '12px',
          padding: '3rem 2rem',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <Wrench style={{
            width: '64px',
            height: '64px',
            color: '#60a5fa',
            margin: '0 auto 1.5rem'
          }} />
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.75rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            No Active Services
          </h3>
          <p style={{
            color: '#93c5fd',
            marginBottom: '2rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            You don't have any services in progress at the moment
          </p>
          <Button 
            onClick={() => onNavigate('appointment-booking')}
            style={{
              background: '#2F8BFF',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1E7FEF'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2F8BFF'}
          >
            Book a Service
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h3 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#0A2C5E',
          marginBottom: '0.5rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Service Progress
        </h3>
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Track your vehicle services in real-time
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {activeServices.map((service) => {
          const IconComponent = getIconComponent;
          return (
            <div 
              key={service.id} 
              style={{
                background: '#042A5C',
                border: '2px solid #2F8BFF',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 16px rgba(47, 139, 255, 0.2)'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '1.5rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid rgba(47, 139, 255, 0.3)'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '0.5rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {service.service.name}
                  </h3>
                  <p style={{
                    color: '#93c5fd',
                    fontSize: '0.875rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Started at {new Date(service.startedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    <Car style={{ width: '16px', height: '16px', color: '#93c5fd' }} />
                    <span style={{
                      color: '#93c5fd',
                      fontSize: '0.875rem',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {service.vehicle.make} {service.vehicle.model} ({service.vehicle.licensePlate})
                    </span>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <StatusBadge status="in-progress" />
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      color: '#93c5fd',
                      fontSize: '0.875rem',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      Progress
                    </p>
                    <p style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: '#2F8BFF',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {service.progress}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    color: '#93c5fd',
                    fontSize: '0.875rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Overall Progress
                  </span>
                  <span style={{
                    color: '#2F8BFF',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {service.progress}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(47, 139, 255, 0.2)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${service.progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #2F8BFF 0%, #60a5fa 100%)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Timeline */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  color: 'white',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: '1.125rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Service Timeline
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '1rem'
                }}>
                  {service.stages.map((stage, index) => {
                    const StageIcon = IconComponent(stage.icon);
                    const displayTime = stage.timestamp 
                      ? new Date(stage.timestamp).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : 'Pending';
                    
                    return (
                      <div key={index} style={{ position: 'relative' }}>
                        <div style={{
                          padding: '1rem',
                          borderRadius: '12px',
                          border: stage.status === 'completed'
                            ? '2px solid #10b981'
                            : stage.status === 'in-progress'
                            ? '2px solid #2F8BFF'
                            : '1px solid rgba(47, 139, 255, 0.3)',
                          background: stage.status === 'completed'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : stage.status === 'in-progress'
                            ? 'rgba(47, 139, 255, 0.1)'
                            : 'rgba(255, 255, 255, 0.05)',
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '0.5rem'
                          }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: stage.status === 'completed'
                                ? '#10b981'
                                : stage.status === 'in-progress'
                                ? '#2F8BFF'
                                : 'rgba(100, 116, 139, 0.5)'
                            }}>
                              <StageIcon style={{ width: '20px', height: '20px', color: 'white' }} />
                            </div>
                            <div>
                              <p style={{
                                fontWeight: '500',
                                color: stage.status === 'pending' ? '#93c5fd' : 'white',
                                fontSize: '0.875rem',
                                fontFamily: 'Poppins, sans-serif'
                              }}>
                                {stage.name}
                              </p>
                              <p style={{
                                color: '#93c5fd',
                                fontSize: '0.75rem',
                                fontFamily: 'Poppins, sans-serif'
                              }}>
                                {displayTime}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(47, 139, 255, 0.1)',
                  border: '1px solid rgba(47, 139, 255, 0.3)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#2F8BFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div>
                      <p style={{
                        color: '#93c5fd',
                        fontSize: '0.75rem',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        Technician
                      </p>
                      <p style={{
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {service.technician.fullName}
                      </p>
                      <p style={{
                        color: '#93c5fd',
                        fontSize: '0.75rem',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {service.technician.specialization}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Clock style={{ width: '20px', height: '20px', color: 'white' }} />
                    </div>
                    <div>
                      <p style={{
                        color: '#93c5fd',
                        fontSize: '0.75rem',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        Est. Completion
                      </p>
                      <p style={{
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {new Date(service.estimatedCompletion).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Updates */}
              {/* Live Updates */}
              <div>
                <h4 style={{
                  color: 'white',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: '1.125rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Live Updates
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {service.updates.map((update, index) => (
                    <div 
                      key={index} 
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(47, 139, 255, 0.1)',
                        border: '1px solid rgba(47, 139, 255, 0.2)'
                      }}
                    >
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        marginTop: '6px',
                        flexShrink: 0,
                        background: index === 0 ? '#2F8BFF' : '#60a5fa',
                        animation: index === 0 ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{
                          color: 'white',
                          fontSize: '0.875rem',
                          fontFamily: 'Poppins, sans-serif'
                        }}>
                          {update.message}
                        </p>
                        <p style={{
                          color: '#93c5fd',
                          fontSize: '0.75rem',
                          fontFamily: 'Poppins, sans-serif'
                        }}>
                          {update.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
