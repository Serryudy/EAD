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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0077b6]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#03045e] mb-2">
          Select Services
        </h3>
        <p className="text-slate-600">
          Choose one or more services for your appointment
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {services.map((service) => {
          return (
          <Card
            key={service._id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              isSelected(service._id)
                ? 'border-2 border-[#0077b6] bg-blue-50'
                : 'border-slate-200'
            }`}
            onClick={() => handleToggleService(service)}
          >
            <div className="flex items-start gap-4">
              {/* Service Icon */}
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                flexShrink: 0
              }}>
                {service.name.toLowerCase().includes('ac') && <Wind color="white" size={28} />}
                {service.name.toLowerCase().includes('battery') && <Battery color="white" size={28} />}
                {service.name.toLowerCase().includes('oil') && <Droplet color="white" size={28} />}
                {service.name.toLowerCase().includes('brake') && <CircleDot color="white" size={28} />}
                {service.name.toLowerCase().includes('coolant') && <Droplet color="white" size={28} />}
                {service.name.toLowerCase().includes('engine') && <Cog color="white" size={28} />}
                {!service.name.toLowerCase().includes('ac') && 
                 !service.name.toLowerCase().includes('battery') && 
                 !service.name.toLowerCase().includes('oil') && 
                 !service.name.toLowerCase().includes('brake') &&
                 !service.name.toLowerCase().includes('coolant') &&
                 !service.name.toLowerCase().includes('engine') && 
                 <Wrench color="white" size={28} />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-base">{service.name}</h4>
                    <Badge variant="secondary" className="mt-1">
                      {service.category}
                    </Badge>
                  </div>
                  
                  <Checkbox
                    checked={isSelected(service._id)}
                    onCheckedChange={() => handleToggleService(service)}
                    className="ml-2 mt-1"
                  />
                </div>

                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {service.description || 'Professional service for your vehicle'}
                </p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{service.estimatedDuration}h</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#0077b6] font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>${service.basePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedServices.length > 0 && (
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-slate-900">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">~{totalDuration}h total</span>
                </div>
                <div className="flex items-center gap-1 text-[#0077b6]">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold text-lg">${totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Wrench className="w-8 h-8 text-slate-400" />
          </div>
        </Card>
      )}

      {/* Empty State */}
      {services.length === 0 && !loading && (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No services available at the moment</p>
        </div>
      )}
    </div>
  );
}
