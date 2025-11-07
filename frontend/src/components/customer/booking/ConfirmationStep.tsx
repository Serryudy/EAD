/**
 * Confirmation Step
 * 
 * Displays successful booking confirmation with appointment details
 */

import { Card } from '../../ui/card';
import { CheckCircle2, Calendar, Clock, Car, Wrench, FileText, Home, CalendarPlus } from 'lucide-react';
import { Button } from '../../ui/button';
import type { BookingData } from './BookingWizard';

interface AppointmentResponse {
  _id?: string;
  appointmentNumber?: string;
  status?: string;
  [key: string]: unknown;
}

interface ConfirmationStepProps {
  appointment: AppointmentResponse | null;
  bookingData: BookingData;
  onComplete: () => void;
  onBookAnother: () => void;
}

export default function ConfirmationStep({
  appointment,
  bookingData,
  onComplete,
  onBookAnother
}: ConfirmationStepProps) {
  const referenceNumber = appointment?.appointmentNumber || appointment?._id?.slice(-8).toUpperCase() || 'PENDING';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4 shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-slate-600 text-lg">
          Your appointment has been successfully scheduled
        </p>
      </div>

      {/* Reference Number */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 mb-6">
        <div className="text-center">
          <p className="text-sm text-blue-700 mb-2 font-medium">Reference Number</p>
          <p className="text-3xl font-bold text-blue-900 tracking-wider">
            {referenceNumber}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Please save this reference number for your records
          </p>
        </div>
      </Card>

      {/* Appointment Details */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Appointment Details</h3>
        
        <div className="space-y-4">
          {/* Date & Time */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">Date & Time</p>
              <p className="font-semibold text-slate-900">
                {bookingData.date?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              {bookingData.timeSlot && (
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <p className="text-sm font-medium text-slate-700">
                    {bookingData.timeSlot.displayTime} - {bookingData.timeSlot.displayEndTime}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-2">Services ({bookingData.services.length})</p>
              <div className="space-y-1">
                {bookingData.services.map((service) => (
                  <div key={service._id} className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">• {service.name}</p>
                    <p className="text-sm text-slate-600">${service.basePrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicles */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-2">Vehicles ({bookingData.vehicles.length})</p>
              <div className="space-y-1">
                {bookingData.vehicles.map((vehicle) => (
                  <p key={vehicle._id} className="text-sm font-medium text-slate-900">
                    • {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {bookingData.specialInstructions && (
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 mb-1">Special Instructions</p>
                <p className="text-sm text-slate-700">{bookingData.specialInstructions}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Status */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-900 mb-1">What's Next?</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✓ You will receive a confirmation email shortly</li>
              <li>✓ A service team member will be assigned to your appointment</li>
              <li>✓ You can track your appointment status in your dashboard</li>
              <li>✓ You will receive a reminder 24 hours before your appointment</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={onComplete}
          variant="outline"
          className="py-6 text-lg font-semibold border-2"
        >
          <Home className="w-5 h-5 mr-2" />
          Go to Dashboard
        </Button>
        <Button
          onClick={onBookAnother}
          className="py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <CalendarPlus className="w-5 h-5 mr-2" />
          Book Another Appointment
        </Button>
      </div>

      {/* Footer Note */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Need to make changes? Contact us at (555) 123-4567 or visit your dashboard to manage your appointments.
      </p>
    </div>
  );
}
