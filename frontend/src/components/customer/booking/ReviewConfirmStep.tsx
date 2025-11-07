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
  FileText
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <Wrench className="w-6 h-6 text-white" />
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
            {bookingData.services.map((service) => (
              <div
                key={service._id}
                className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900">{service.name}</p>
                  <p className="text-sm text-slate-600">{service.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-blue-900">
                    ${service.basePrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-600">
                    ~{service.estimatedDuration}h
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Vehicles Summary */}
        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <Car className="w-6 h-6 text-white" />
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <Calendar className="w-6 h-6 text-white" />
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
              <DollarSign className="w-6 h-6 text-white" />
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
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-md">
                <span className="font-bold text-white text-lg">Total Estimate</span>
                <span className="font-bold text-2xl text-white">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Special Instructions */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
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
              <p className="font-medium text-slate-900">{user.phoneNumber}</p>
            </div>
          </div>
        </Card>

        {/* Confirm Button */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white py-7 text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Creating Your Appointment...
              </>
            ) : (
              <>
                <CheckSquare className="w-6 h-6 mr-3" />
                Confirm & Book Appointment
              </>
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
