import { Calendar, User, Car, Wrench, Clock, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { employeeApi, serviceRecordApi } from '../../services/api';
import { toast } from 'sonner';

interface Service {
  _id: string;
  name: string;
  price: number;
  estimatedTime: number;
  description?: string;
}

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  type: string;
  make: string;
  model: string;
  year: number;
}

interface Appointment {
  _id: string;
  customerId?: UserData;
  vehicleId?: Vehicle;
  serviceIds: Service[];
  preferredDate: string;
  timeWindow?: string;
  scheduledTime?: string;
  status: string;
  notes?: string;
  assignedEmployee?: UserData;
  estimatedCost?: number;
}

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvertToService?: () => void;
}

export function AppointmentDetailsDialog({ 
  appointment, 
  open, 
  onOpenChange,
  onConvertToService 
}: AppointmentDetailsDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [converting, setConverting] = useState(false);

  // Fetch employees when dialog opens
  useEffect(() => {
    if (open) {
      fetchEmployees();
      // Set current assigned employee if exists
      if (appointment?.assignedEmployee?._id) {
        setSelectedEmployeeId(appointment.assignedEmployee._id);
      } else {
        setSelectedEmployeeId('');
      }
    }
  }, [open, appointment]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await employeeApi.getAllEmployees();
      if (response.success) {
        setEmployees(response.data.filter((emp: Employee) => emp.isActive !== false));
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleConvert = async () => {
    if (!appointment) return;

    if (!selectedEmployeeId) {
      toast.error('Please select an employee to assign');
      return;
    }

    setConverting(true);
    try {
      const response = await serviceRecordApi.transferAppointmentToService(
        appointment._id,
        { assignedEmployeeId: selectedEmployeeId }
      );

      if (response.success) {
        toast.success('Appointment converted to service successfully!');
        if (onConvertToService) {
          onConvertToService();
        }
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to convert appointment');
      }
    } catch (error: any) {
      console.error('Error converting appointment:', error);
      toast.error(error.message || 'Failed to convert appointment to service');
    } finally {
      setConverting(false);
    }
  };

  if (!appointment) return null;

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
              <p className="font-mono text-slate-700">#{appointment._id}</p>
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
                <p className="font-medium text-slate-900">
                  {appointment.customerId ? `${appointment.customerId.firstName} ${appointment.customerId.lastName}` : 'Guest Customer'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium text-slate-900">
                  {appointment.customerId?.phoneNumber || appointment.customerId?.phone || 'N/A'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">
                  {appointment.customerId?.email || 'N/A'}
                </p>
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
                  {appointment.vehicleId ? 
                    `${appointment.vehicleId.year || ''} ${appointment.vehicleId.make || ''} ${appointment.vehicleId.model || ''}`.trim() 
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">License Plate</p>
                <p className="font-medium text-slate-900">
                  {appointment.vehicleId?.vehicleNumber || 'N/A'}
                </p>
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
                <p className="font-medium text-slate-900">
                  {new Date(appointment.preferredDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Time</p>
                <p className="font-medium text-slate-900">
                  {appointment.timeWindow || appointment.scheduledTime || 'TBD'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">Assigned Technician</p>
                <p className="font-medium text-slate-900">
                  {appointment.assignedEmployee ? 
                    `${appointment.assignedEmployee.firstName} ${appointment.assignedEmployee.lastName}` 
                    : 'Not assigned yet'
                  }
                </p>
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
              {appointment.serviceIds && appointment.serviceIds.length > 0 ? (
                appointment.serviceIds.map((service) => (
                  <div key={service._id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{service.name}</p>
                      <p className="text-sm text-slate-500">Est. Duration: {service.estimatedTime} min</p>
                    </div>
                    <p className="font-semibold text-[#0077b6]">${service.price}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No services listed</p>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">Total Estimate</p>
              <p className="text-xl font-bold text-[#0077b6]">
                ${appointment.estimatedCost || appointment.serviceIds?.reduce((sum, s) => sum + s.price, 0) || 0}
              </p>
            </div>
          </Card>

          {/* Assign Employee */}
          <Card className="p-4 bg-slate-50">
            <h3 className="font-semibold text-[#03045e] mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              Assign Technician for Service
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Select a technician to assign this appointment to as an active service
              </p>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
                disabled={loadingEmployees}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Select a technician"} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} ({employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEmployeeId && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Technician selected
                </p>
              )}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={converting}>
            Close
          </Button>
          <Button 
            onClick={handleConvert}
            className="bg-[#0077b6] hover:bg-[#03045e]"
            disabled={!selectedEmployeeId || converting}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {converting ? 'Converting...' : 'Convert to Active Service'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
