import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Car, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { vehicleApi, type VehicleDto } from '../../services/api';

interface AppointmentBookingProps {
  onNavigate: (page: string) => void;
}

export function AppointmentBooking({ onNavigate }: AppointmentBookingProps) {
  const [step, setStep] = useState<'vehicle' | 'service' | 'datetime' | 'confirm'>('vehicle');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await vehicleApi.getUserVehicles();
        if (response.success && response.data) {
          setVehicles(response.data);
          // Auto-select first vehicle if available
          if (response.data.length > 0) {
            setSelectedVehicle(response.data[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const services = [
    { id: 'oil-change', name: 'Oil Change & Filter', duration: '1 hour', price: '$49.99' },
    { id: 'brake-service', name: 'Brake Inspection & Service', duration: '2 hours', price: '$129.99' },
    { id: 'tire-rotation', name: 'Tire Rotation & Balance', duration: '1 hour', price: '$69.99' },
    { id: 'engine-tune', name: 'Engine Tune-Up', duration: '3 hours', price: '$299.99' },
    { id: 'diagnostics', name: 'Full Diagnostics Scan', duration: '1.5 hours', price: '$89.99' },
    { id: 'ac-service', name: 'AC Recharge & Service', duration: '1 hour', price: '$79.99' }
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const handleConfirmBooking = () => {
    setShowConfirmation(true);
  };

  const selectedServiceDetails = services.find(s => s.id === selectedService);

  if (showConfirmation) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <Card className="p-8 text-center border-slate-200">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-[#03045e] mb-2">Appointment Confirmed!</h2>
          <p className="text-slate-600 mb-6">
            Your appointment has been successfully booked. We've sent a confirmation to your phone.
          </p>
          
          <Card className="p-6 bg-slate-50 border-slate-200 text-left mb-6">
            <h3 className="text-[#03045e] mb-4">Appointment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Service:</span>
                <span className="text-slate-900">{selectedServiceDetails?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Date:</span>
                <span className="text-slate-900">{selectedDate?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Time:</span>
                <span className="text-slate-900">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Duration:</span>
                <span className="text-slate-900">{selectedServiceDetails?.duration}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-3">
                <span className="text-slate-900">Estimated Cost:</span>
                <span className="text-[#0077b6]">{selectedServiceDetails?.price}</span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col md:flex-row gap-3">
            <Button
              onClick={() => onNavigate('customer-dashboard')}
              className="flex-1 bg-[#0077b6] hover:bg-[#03045e]"
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmation(false);
                setStep('vehicle');
                setSelectedService('');
                setSelectedDate(undefined);
                setSelectedTime('');
              }}
              className="flex-1"
            >
              Book Another
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
        <h2 className="text-[#03045e]">Book an Appointment</h2>
        <p className="text-slate-600">Schedule your vehicle service in a few simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['vehicle', 'service', 'datetime', 'confirm'].map((s, index) => {
          const isActive = step === s;
          const isCompleted = ['vehicle', 'service', 'datetime', 'confirm'].indexOf(step) > index;
          
          return (
            <div key={s} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-[#0077b6] text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                <span className={`hidden md:block ${isActive ? 'text-[#0077b6]' : 'text-slate-600'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </div>
              {index < 3 && (
                <div className="flex-1 h-1 bg-slate-200 mx-2">
                  <div className={`h-full bg-[#0077b6] transition-all ${isCompleted ? 'w-full' : 'w-0'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Card className="p-6 border-slate-200">
        {/* Step 1: Select Vehicle */}
        {step === 'vehicle' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[#03045e] mb-4">Select Vehicle</h3>
              {loading ? (
                <div className="text-center py-8 text-slate-600">Loading vehicles...</div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">You don't have any vehicles registered yet.</p>
                  <Button
                    onClick={() => onNavigate('customer-dashboard')}
                    variant="outline"
                    className="border-[#0077b6] text-[#0077b6] hover:bg-[#90e0ef]/10"
                  >
                    Go to Profile to Add Vehicle
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {vehicles.map((vehicle) => (
                    <button
                      key={vehicle._id}
                      onClick={() => setSelectedVehicle(vehicle._id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedVehicle === vehicle._id
                          ? 'border-[#0077b6] bg-[#90e0ef]/10'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-[#0077b6] flex items-center justify-center">
                          <Car className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-slate-600">{vehicle.licensePlate}</p>
                        </div>
                        {selectedVehicle === vehicle._id && (
                          <CheckCircle2 className="h-6 w-6 text-[#0077b6]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {vehicles.length > 0 && (
              <Button
                onClick={() => setStep('service')}
                disabled={!selectedVehicle}
                className="w-full bg-[#0077b6] hover:bg-[#03045e]"
              >
                Continue
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Select Service */}
        {step === 'service' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[#03045e] mb-4">Select Service</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedService === service.id
                        ? 'border-[#0077b6] bg-[#90e0ef]/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-900">{service.name}</p>
                        <p className="text-slate-600 mt-1">{service.duration}</p>
                      </div>
                      {selectedService === service.id && (
                        <CheckCircle2 className="h-5 w-5 text-[#0077b6]" />
                      )}
                    </div>
                    <p className="text-[#0077b6] mt-3">{service.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('vehicle')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('datetime')}
                disabled={!selectedService}
                className="flex-1 bg-[#0077b6] hover:bg-[#03045e]"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[#03045e] mb-4">Select Date & Time</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start h-12"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {selectedDate ? selectedDate.toLocaleDateString() : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('service')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 bg-[#0077b6] hover:bg-[#03045e]"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[#03045e] mb-4">Confirm Booking</h3>
              
              <div className="space-y-4">
                <Card className="p-4 bg-slate-50 border-slate-200">
                  <h4 className="text-slate-900 mb-3">Appointment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vehicle:</span>
                      <span className="text-slate-900">
                        {(() => {
                          const vehicle = vehicles.find(v => v._id === selectedVehicle);
                          return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'N/A';
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service:</span>
                      <span className="text-slate-900">{selectedServiceDetails?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Date:</span>
                      <span className="text-slate-900">{selectedDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Time:</span>
                      <span className="text-slate-900">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Duration:</span>
                      <span className="text-slate-900">{selectedServiceDetails?.duration}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-300 pt-2 mt-2">
                      <span className="text-slate-900">Estimated Cost:</span>
                      <span className="text-[#0077b6]">{selectedServiceDetails?.price}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-[#90e0ef]/10 border-[#0077b6]/30">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#0077b6] flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700">
                      Please arrive 10 minutes early. You'll receive a confirmation message shortly.
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('datetime')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="flex-1 bg-[#0077b6] hover:bg-[#03045e]"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
