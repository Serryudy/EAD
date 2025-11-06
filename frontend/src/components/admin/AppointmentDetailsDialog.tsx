import { Calendar, User, Car, Wrench, Clock, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';

interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
}

interface Appointment {
  id: string;
  time: string;
  customer: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  services: Service[];
  technician: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    licensePlate: string;
  };
  date: string;
  status: string;
  notes?: string;
  totalPrice: string;
}

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvertToService: (appointment: Appointment) => void;
}

export function AppointmentDetailsDialog({ 
  appointment, 
  open, 
  onOpenChange,
  onConvertToService 
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null;

  const handleConvert = () => {
    onConvertToService(appointment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl flex flex-col p-0 gap-0 overflow-hidden"
        style={{ maxHeight: '85vh', height: 'auto' }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-2xl text-[#03045e] flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Appointment Details
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-6" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              className={
                appointment.status === 'confirmed' 
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : appointment.status === 'pending'
                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              }
            >
              {appointment.status.toUpperCase()}
            </Badge>
            <div className="text-right">
              <p className="text-sm text-slate-500">Appointment ID</p>
              <p className="font-mono text-slate-700">#{appointment.id}</p>
            </div>
          </div>

          {/* Customer Information */}
          <Card className="p-4 bg-slate-50">
            <h3 className="font-semibold text-[#03045e] mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="font-medium text-slate-900">{appointment.customer}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium text-slate-900">{appointment.customerPhone}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{appointment.customerEmail}</p>
              </div>
            </div>
          </Card>

          {/* Vehicle Information */}
          <Card className="p-4 bg-slate-50">
            <h3 className="font-semibold text-[#03045e] mb-3 flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-slate-500">Vehicle</p>
                <p className="font-medium text-slate-900">
                  {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">License Plate</p>
                <p className="font-medium text-slate-900">{appointment.vehicle.licensePlate}</p>
              </div>
            </div>
          </Card>

          {/* Appointment Schedule */}
          <Card className="p-4 bg-slate-50">
            <h3 className="font-semibold text-[#03045e] mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Schedule
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-slate-500">Date</p>
                <p className="font-medium text-slate-900">{appointment.date}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Time</p>
                <p className="font-medium text-slate-900">{appointment.time}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">Assigned Technician</p>
                <p className="font-medium text-slate-900">{appointment.technician}</p>
              </div>
            </div>
          </Card>

          {/* Services */}
          <Card className="p-4 bg-slate-50">
            <h3 className="font-semibold text-[#03045e] mb-3 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Requested Services
            </h3>
            <div className="space-y-3">
              {appointment.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{service.name}</p>
                    <p className="text-sm text-slate-500">Est. Duration: {service.duration}</p>
                  </div>
                  <p className="font-semibold text-[#0077b6]">{service.price}</p>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">Total Estimate</p>
              <p className="text-xl font-bold text-[#0077b6]">{appointment.totalPrice}</p>
            </div>
          </Card>

          {/* Notes */}
          {appointment.notes && (
            <Card className="p-4 bg-slate-50">
              <h3 className="font-semibold text-[#03045e] mb-2">Notes</h3>
              <p className="text-slate-700">{appointment.notes}</p>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2 px-6 py-4 border-t bg-slate-50 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={handleConvert}
            className="bg-[#0077b6] hover:bg-[#03045e]"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Convert to Active Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
