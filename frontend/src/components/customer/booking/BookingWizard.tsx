/**
 * Booking Wizard - Main Component
 * 
 * Multi-step appointment booking flow:
 * 1. Service Selection
 * 2. Vehicle Selection
 * 3. Date Selection
 * 4. Time Slot Selection
 * 5. Review & Confirm
 * 6. Confirmation
 */

import { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import ServiceSelectionStep from './ServiceSelectionStep';
import VehicleSelectionStep from './VehicleSelectionStep';
import DateSelectionStep from './DateSelectionStep';
import TimeSlotSelectionStep from './TimeSlotSelectionStep';
import ReviewConfirmStep from './ReviewConfirmStep';
import ConfirmationStep from './ConfirmationStep';
import type { User } from '../../../contexts/AuthContext';

export interface Service {
  _id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  estimatedDuration: number; // in hours
  basePrice: number;
  isActive: boolean;
}

export interface Vehicle {
  _id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: string;
  mileage?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
  displayEndTime: string;
  isAvailable: boolean;
  capacityRemaining: number;
  capacityUsed: number;
  totalCapacity: number;
}

export interface BookingData {
  services: Service[];
  vehicles: Vehicle[];
  date: Date | null;
  timeSlot: TimeSlot | null;
  specialInstructions: string;
}

type Step = 'services' | 'vehicles' | 'date' | 'time' | 'review' | 'confirmation';

interface BookingWizardProps {
  user: User;
  onComplete: () => void;
  onCancel: () => void;
}

export default function BookingWizard({ user, onComplete, onCancel }: BookingWizardProps) {
  // Initialize state from sessionStorage IMMEDIATELY
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    const savedStep = sessionStorage.getItem('bookingCurrentStep');
    return (savedStep && savedStep !== 'confirmation') ? savedStep as Step : 'services';
  });
  
  const [bookingData, setBookingData] = useState<BookingData>(() => {
    const draft = sessionStorage.getItem('bookingDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return {
          ...parsed,
          date: parsed.date ? new Date(parsed.date) : null
        };
      } catch (error) {
        console.error('Failed to restore booking draft:', error);
      }
    }
    return {
      services: [],
      vehicles: [],
      date: null,
      timeSlot: null,
      specialInstructions: ''
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Record<string, unknown> | null>(null);

  // Save to sessionStorage whenever data or step changes
  useEffect(() => {
    if (currentStep !== 'confirmation') {
      sessionStorage.setItem('bookingDraft', JSON.stringify({
        ...bookingData,
        date: bookingData.date?.toISOString()
      }));
      sessionStorage.setItem('bookingCurrentStep', currentStep);
      console.log('💾 Saved booking draft - Step:', currentStep, 'Data:', bookingData);
    }
  }, [bookingData, currentStep]);

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);

      // Validate all required data
      if (!bookingData.vehicles[0]) {
        throw new Error('Please select a vehicle');
      }
      if (!bookingData.services || bookingData.services.length === 0) {
        throw new Error('Please select at least one service');
      }
      if (!bookingData.date) {
        throw new Error('Please select a date');
      }
      if (!bookingData.timeSlot) {
        throw new Error('Please select a time slot');
      }

      // Prepare appointment data for backend
      const appointmentPayload = {
        vehicleId: bookingData.vehicles[0]._id,
        // Send first service as serviceType (required enum field)
        serviceType: bookingData.services[0].name,
        serviceDescription: bookingData.services.map(s => `${s.name} - ${s.description || 'Professional service'}`).join('\n'),
        // Both old and new date/time fields (model has both as required)
        appointmentDate: bookingData.date.toISOString(),
        appointmentTime: bookingData.timeSlot.startTime || bookingData.timeSlot.time?.split(' - ')[0] || '09:00',
        preferredDate: bookingData.date.toISOString(),
        timeWindow: bookingData.timeSlot.time || `${bookingData.timeSlot.displayTime || bookingData.timeSlot.startTime} - ${bookingData.timeSlot.displayEndTime || bookingData.timeSlot.endTime}`,
        duration: bookingData.timeSlot.duration || 180,
        additionalNotes: bookingData.specialInstructions || '',
        estimatedDuration: `~${bookingData.services.reduce((sum, s) => sum + s.estimatedDuration, 0)}h`,
        estimatedCost: bookingData.services.reduce((sum, s) => sum + s.basePrice, 0) * bookingData.vehicles.length
      };

      console.log('📤 Submitting appointment:', appointmentPayload);

      // Use native fetch with auth token
      const token = sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointmentPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create appointment');
      }

      if (data.success) {
        console.log('✅ Appointment created:', data.appointment);
        setCreatedAppointment(data.appointment);
        setCurrentStep('confirmation');
        
        // Clear draft after successful submission
        sessionStorage.removeItem('bookingDraft');
        sessionStorage.removeItem('bookingCurrentStep');
      } else {
        throw new Error(data.message || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert(err.response?.data?.message || err.message || 'Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: { key: Step; label: string; number: number }[] = [
    { key: 'services', label: 'Services', number: 1 },
    { key: 'vehicles', label: 'Vehicles', number: 2 },
    { key: 'date', label: 'Date', number: 3 },
    { key: 'time', label: 'Time', number: 4 },
    { key: 'review', label: 'Review', number: 5 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = currentStep === 'confirmation' ? 100 : ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].key);
    }
  };

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].key);
    } else {
      // First step, ask confirmation to cancel
      if (window.confirm('Are you sure you want to cancel this booking?')) {
        sessionStorage.removeItem('bookingDraft');
        sessionStorage.removeItem('bookingCurrentStep');
        onCancel();
      }
    }
  };

  const handleStepClick = (stepKey: Step) => {
    // Only allow navigation to completed or current steps
    const targetIndex = steps.findIndex(s => s.key === stepKey);
    if (targetIndex <= currentStepIndex) {
      setCurrentStep(stepKey);
    }
  };

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'services':
        return bookingData.services.length > 0;
      case 'vehicles':
        return bookingData.vehicles.length > 0;
      case 'date':
        return bookingData.date !== null;
      case 'time':
        return bookingData.timeSlot !== null;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  if (currentStep === 'confirmation') {
    return (
      <ConfirmationStep
        appointment={createdAppointment}
        bookingData={bookingData}
        onComplete={() => {
          // Clear saved draft when going to dashboard
          sessionStorage.removeItem('bookingDraft');
          sessionStorage.removeItem('bookingCurrentStep');
          onComplete();
        }}
        onBookAnother={() => {
          sessionStorage.removeItem('bookingDraft');
          sessionStorage.removeItem('bookingCurrentStep');
          setCreatedAppointment(null);
          setBookingData({
            services: [],
            vehicles: [],
            date: null,
            timeSlot: null,
            specialInstructions: ''
          });
          setCurrentStep('services');
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Progress Header */}
      <Card className="p-6 mb-6 border-slate-200">
        <div className="mb-4">
          <h2 className="text-[#03045e] mb-2">Book an Appointment</h2>
          <p className="text-slate-600">Complete the steps below to schedule your service</p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-slate-600 mt-2">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <button
                onClick={() => handleStepClick(step.key)}
                disabled={index > currentStepIndex}
                className={`flex flex-col items-center ${
                  index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    index < currentStepIndex
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStepIndex
                      ? 'bg-[#0077b6] border-[#0077b6] text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 hidden md:block ${
                    index <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-6 border-slate-200">
        {currentStep === 'services' && (
          <ServiceSelectionStep
            selectedServices={bookingData.services}
            onServicesChange={(services: Service[]) => updateBookingData({ services })}
          />
        )}

        {currentStep === 'vehicles' && (
          <VehicleSelectionStep
            selectedVehicles={bookingData.vehicles}
            onVehiclesChange={(vehicles: Vehicle[]) => updateBookingData({ vehicles })}
          />
        )}

        {currentStep === 'date' && (
          <DateSelectionStep
            services={bookingData.services}
            vehicles={bookingData.vehicles}
            selectedDate={bookingData.date}
            onDateChange={(date: Date | null) => updateBookingData({ date })}
          />
        )}

        {currentStep === 'time' && bookingData.date && (
          <TimeSlotSelectionStep
            date={bookingData.date}
            selectedServices={bookingData.services}
            vehicleCount={bookingData.vehicles.length}
            selectedSlot={bookingData.timeSlot}
            onSlotChange={(timeSlot: TimeSlot | null) => updateBookingData({ timeSlot })}
          />
        )}

        {currentStep === 'review' && (
          <ReviewConfirmStep
            bookingData={bookingData}
            user={user}
            onSpecialInstructionsChange={(specialInstructions: string) =>
              updateBookingData({ specialInstructions })
            }
            onConfirm={handleConfirmBooking}
            onEditStep={(step: Step) => setCurrentStep(step)}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep !== 'review' && (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="ml-auto flex items-center gap-2 bg-[#0077b6] hover:bg-[#03045e]"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
