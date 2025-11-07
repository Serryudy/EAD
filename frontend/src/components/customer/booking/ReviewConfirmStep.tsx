/**
 * Review & Confirm Step
 * 
 * Final review of booking details before submission
 */

import { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { 
  CheckSquare, 
  Wrench, 
  Car, 
  Calendar, 
  Clock, 
  Edit2, 
  Loader2,
  DollarSign,
  FileText,
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
import { Textarea } from '../../ui/textarea';
import type { BookingData } from './BookingWizard';
import type { User } from '../../../contexts/AuthContext';

interface ReviewConfirmStepProps {
  bookingData: BookingData;
  user: User;
  onSpecialInstructionsChange: (instructions: string) => void;
  onConfirm: () => void;
  onEditStep: (step: 'services' | 'vehicles' | 'date' | 'time') => void;
  isSubmitting?: boolean;
}

export default function ReviewConfirmStep({
  bookingData,
  user,
  onSpecialInstructionsChange,
  onConfirm,
  onEditStep,
  isSubmitting = false
}: ReviewConfirmStepProps) {
  const [localInstructions, setLocalInstructions] = useState(bookingData.specialInstructions);

  // Helper function to get icon for service
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    
    if (name.includes('ac') || name.includes('air conditioning') || name.includes('cooling')) {
      return Wind;
    }
    if (name.includes('battery')) {
      return Battery;
    }
    if (name.includes('oil') || name.includes('fluid')) {
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
    // Default icon
    return Wrench;
  };

  // Calculate total cost
  const totalCost = bookingData.services.reduce((sum, service) => {
    return sum + (service.basePrice * bookingData.vehicles.length);
  }, 0);

  // Calculate total duration
  const totalDuration = bookingData.services.reduce((sum, service) => {
    return sum + service.estimatedDuration;
  }, 0);

  const handleInstructionsChange = (value: string) => {
    setLocalInstructions(value);
    onSpecialInstructionsChange(value);
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#03045e] mb-2">
          Review & Confirm Booking
        </h3>
        <p className="text-slate-600">
          Please review your appointment details before confirming
        </p>
      </div>

      <div className="space-y-4">
        {/* Services Summary */}
        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Wrench color="white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Selected Services</h4>
                <p className="text-sm text-slate-600">{bookingData.services.length} service(s) selected</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep('services')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="space-y-3">
            {bookingData.services.map((service) => {
              return (
              <div
                key={service._id}
                className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-colors"
              >
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
                
                {/* Service Details */}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-base">{service.name}</p>
                  <p className="text-sm text-slate-600">{service.category}</p>
                </div>
                
                {/* Price & Duration */}
                <div className="text-right">
                  <p className="font-bold text-lg text-blue-900">
                    ${service.basePrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-600">
                    ~{service.estimatedDuration}h
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </Card>

        {/* Vehicles Summary */}
        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Car color="white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Selected Vehicles</h4>
                <p className="text-sm text-slate-600">{bookingData.vehicles.length} vehicle(s) selected</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep('vehicles')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="space-y-3">
            {bookingData.vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 rounded-xl border-2 border-slate-200 hover:border-green-300 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-slate-600">{vehicle.licensePlate}</p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full border border-green-300">
                  {vehicle.type}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Date & Time Summary */}
        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'linear-gradient(to bottom right, #a855f7, #9333ea)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Calendar color="white" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Date & Time</h4>
                <p className="text-sm text-slate-600">Appointment schedule</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep('time')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 rounded-xl border-2 border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">Date</span>
              </div>
              <p className="font-bold text-purple-900">
                {bookingData.date?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 via-sky-100 to-blue-50 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Time Slot</span>
              </div>
              <p className="font-bold text-blue-900">
                {bookingData.timeSlot?.displayTime} - {bookingData.timeSlot?.displayEndTime}
              </p>
            </div>
          </div>
        </Card>

        {/* Cost Summary */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 border-blue-300 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'linear-gradient(to bottom right, #2563eb, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <DollarSign color="white" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 text-lg">Cost Summary</h4>
              <p className="text-sm text-blue-700">Estimated total cost</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-base text-blue-900 p-2 bg-white/50 rounded-lg">
              <span className="font-medium">Services ({bookingData.services.length})</span>
              <span className="font-semibold">
                ${bookingData.services.reduce((sum, s) => sum + s.basePrice, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-base text-blue-900 p-2 bg-white/50 rounded-lg">
              <span className="font-medium">Vehicles ({bookingData.vehicles.length})</span>
              <span className="font-semibold">× {bookingData.vehicles.length}</span>
            </div>
            <div className="flex justify-between text-base text-blue-900 p-2 bg-white/50 rounded-lg">
              <span className="font-medium">Estimated Duration</span>
              <span className="font-semibold">~{totalDuration}h</span>
            </div>
            <div className="pt-3 border-t-2 border-blue-400">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '18px' }}>Total Estimate</span>
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '24px' }}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Special Instructions */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              background: 'linear-gradient(to bottom right, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText color="white" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Special Instructions</h4>
              <p className="text-sm text-slate-600">Optional notes for the service team</p>
            </div>
          </div>
          <Textarea
            placeholder="Any specific concerns or requests? (optional)"
            value={localInstructions}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            className="min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-slate-500 mt-2">
            {localInstructions.length}/500 characters
          </p>
        </Card>

        {/* Customer Info */}
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-3">Customer Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Name:</span>
              <p className="font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <span className="text-slate-600">Phone:</span>
              <p className="font-medium text-slate-900">
                {user.phone || 'Not provided'}
              </p>
            </div>
          </div>
        </Card>

        {/* Confirm Button */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              flex: 1,
              background: 'linear-gradient(to right, #2563eb, #1d4ed8, #1e40af)',
              color: 'white',
              padding: '28px 24px',
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              borderRadius: '8px',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 color="white" size={24} style={{ marginRight: '12px', animation: 'spin 1s linear infinite' }} />
                Creating Your Appointment...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckSquare color="white" size={24} style={{ marginRight: '12px' }} />
                Confirm & Book Appointment
              </span>
            )}
          </Button>
        </div>

        {/* Terms */}
        <p className="text-xs text-center text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
          🔒 By confirming, you agree to our service terms and cancellation policy.
          You will receive a confirmation email and SMS shortly.
        </p>
      </div>
    </div>
  );
}
