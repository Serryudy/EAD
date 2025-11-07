/**
 * Service Selection Step
 * 
 * Display available services with details and allow multiple selection
 */

import { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { 
  Clock, 
  DollarSign, 
  Wrench, 
  Loader2,
  Wind,
  Battery,
  Droplet,
  Zap,
  Gauge,
  Shield,
  CircleDot,
  Settings,
  Fuel,
  ThermometerSun,
  Sparkles,
  Cog
} from 'lucide-react';
import { toast } from 'sonner';
import type { Service } from './BookingWizard';

interface ServiceSelectionStepProps {
  selectedServices: Service[];
  onServicesChange: (services: Service[]) => void;
}

export default function ServiceSelectionStep({
  selectedServices,
  onServicesChange
}: ServiceSelectionStepProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get icon for service
  const getServiceIcon = (serviceName: string, category?: string) => {
    const name = serviceName.toLowerCase();
    const cat = category?.toLowerCase() || '';
    
    if (name.includes('ac') || name.includes('air conditioning') || name.includes('cooling') || cat.includes('climate')) {
      return Wind;
    }
    if (name.includes('battery') || cat.includes('electrical')) {
      return Battery;
    }
    if (name.includes('oil') || name.includes('fluid') || cat.includes('maintenance')) {
      return Droplet;
    }
    if (name.includes('electric') || name.includes('spark')) {
      return Zap;
    }
    if (name.includes('brake')) {
      return CircleDot;
    }
    if (name.includes('tire') || name.includes('wheel')) {
      return Gauge;
    }
    if (name.includes('inspect')) {
      return Shield;
    }
    if (name.includes('engine')) {
      return Cog;
    }
    if (name.includes('fuel')) {
      return Fuel;
    }
    if (name.includes('heat') || name.includes('temperature')) {
      return ThermometerSun;
    }
    if (name.includes('wash') || name.includes('clean') || name.includes('detail')) {
      return Sparkles;
    }
    if (cat.includes('diagnostic')) {
      return Settings;
    }
    // Default icon
    return Wrench;
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/services?isActive=true&limit=100');

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const result = await response.json();
      
      // API returns { success, data, pagination }
      const servicesData = result.data || result;
      
      // Filter only active services
      const activeServices = Array.isArray(servicesData) 
        ? servicesData.filter((s: Service) => s.isActive)
        : [];
      
      setServices(activeServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = (service: Service) => {
    const isSelected = selectedServices.some(s => s._id === service._id);
    
    if (isSelected) {
      onServicesChange(selectedServices.filter(s => s._id !== service._id));
    } else {
      onServicesChange([...selectedServices, service]);
    }
  };

  const isSelected = (serviceId: string) => {
    return selectedServices.some(s => s._id === serviceId);
  };

  // Calculate totals
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.estimatedDuration, 0);
  const totalCost = selectedServices.reduce((sum, s) => sum + s.basePrice, 0);

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
            color: '#64748b',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Loading services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h3 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#0A2C5E',
          marginBottom: '0.5rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Select Services
        </h3>
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Choose one or more services for your appointment
        </p>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {services.map((service) => {
          const selected = isSelected(service._id);
          const IconComponent = getServiceIcon(service.name, service.category);
          
          return (
            <div
              key={service._id}
              onClick={() => handleToggleService(service)}
              style={{
                background: selected ? 'linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)' : '#042A5C',
                border: selected ? '2px solid #2F8BFF' : '1px solid rgba(47, 139, 255, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.border = '1px solid #2F8BFF';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(47, 139, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.border = '1px solid rgba(47, 139, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Selection Check */}
              {selected && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: selected 
                    ? 'linear-gradient(135deg, #2F8BFF 0%, #1e6fd8 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(47, 139, 255, 0.3)'
                }}>
                  <IconComponent color="white" size={28} />
                </div>

                <div style={{ flex: 1 }}>
                  {/* Service Name */}
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '0.25rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {service.name}
                  </h4>

                  {/* Category Badge */}
                  <div style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(47, 139, 255, 0.2)',
                    border: '1px solid rgba(47, 139, 255, 0.4)',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#93c5fd',
                    marginBottom: '0.75rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {service.category}
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#93c5fd',
                    marginBottom: '1rem',
                    lineHeight: '1.5',
                    fontFamily: 'Poppins, sans-serif',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {service.description || 'Professional service for your vehicle'}
                  </p>

                  {/* Details */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(147, 197, 253, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock color="#93c5fd" size={16} />
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#e0e7ff',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {service.estimatedDuration}h
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <DollarSign color="#10b981" size={16} />
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#10b981',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        ${service.basePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedServices.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #2F8BFF',
          boxShadow: '0 4px 12px rgba(10, 44, 94, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: '#93c5fd',
                marginBottom: '0.25rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock color="#e0e7ff" size={20} />
                  <span style={{
                    fontWeight: '600',
                    color: 'white',
                    fontSize: '1.125rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    ~{totalDuration}h total
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign color="#10b981" size={20} />
                  <span style={{
                    fontWeight: '700',
                    color: '#10b981',
                    fontSize: '1.5rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <Wrench color="#2F8BFF" size={32} />
          </div>
        </div>
      )}

      {/* Empty State */}
      {services.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: '#042A5C',
          borderRadius: '12px',
          border: '1px solid #2F8BFF'
        }}>
          <Wrench style={{
            width: '64px',
            height: '64px',
            color: '#2F8BFF',
            margin: '0 auto 1rem'
          }} />
          <p style={{
            color: '#93c5fd',
            fontFamily: 'Poppins, sans-serif'
          }}>
            No services available at the moment
          </p>
        </div>
      )}
    </div>
  );
}
