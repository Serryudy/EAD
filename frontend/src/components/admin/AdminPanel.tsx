import { useState } from 'react';
import { Users, Wrench, CheckCircle2, TrendingUp, DollarSign, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { EditServiceDialog } from './EditServiceDialog';
import { EditEmployeeDialog } from './EditEmployeeDialog';
import { toast } from 'sonner';

export function AdminPanel() {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showEditServiceDialog, setShowEditServiceDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showEditEmployeeDialog, setShowEditEmployeeDialog] = useState(false);
  const stats = [
    { label: 'Total Customers', value: '248', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Projects', value: '18', change: '+5%', icon: Wrench, color: 'bg-amber-500' },
    { label: 'Completed (Month)', value: '156', change: '+23%', icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Revenue (Month)', value: '$28.4K', change: '+18%', icon: DollarSign, color: 'bg-purple-500' }
  ];

  const employees = [
    { id: '1', name: 'Mike Johnson', role: 'Senior Technician', active: 2, completed: 45, rating: 4.9, status: 'active' },
    { id: '2', name: 'Sarah Williams', role: 'Technician', active: 1, completed: 38, rating: 4.8, status: 'active' },
    { id: '3', name: 'David Chen', role: 'Junior Technician', active: 2, completed: 28, rating: 4.7, status: 'active' },
    { id: '4', name: 'Emily Brown', role: 'Technician', active: 1, completed: 41, rating: 4.9, status: 'on-leave' }
  ];

  const serviceTypes = [
    { id: '1', name: 'Oil Change', duration: '1 hour', price: '$49.99', count: 45 },
    { id: '2', name: 'Brake Service', duration: '2 hours', price: '$129.99', count: 28 },
    { id: '3', name: 'Engine Tune-Up', duration: '3 hours', price: '$299.99', count: 15 },
    { id: '4', name: 'Tire Service', duration: '1 hour', price: '$69.99', count: 38 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 22000, services: 120 },
    { month: 'Feb', revenue: 25000, services: 135 },
    { month: 'Mar', revenue: 23500, services: 128 },
    { month: 'Apr', revenue: 27000, services: 145 },
    { month: 'May', revenue: 26500, services: 142 },
    { month: 'Jun', revenue: 28400, services: 156 }
  ];

  const upcomingAppointments = [
    { 
      id: 'APT001',
      time: '9:00 AM', 
      date: 'June 15, 2025',
      customer: 'John Doe',
      customerPhone: '+1 (555) 123-4567',
      customerEmail: 'john.doe@email.com',
      service: 'Oil Change',
      services: [
        { id: '1', name: 'Oil Change', price: '$49.99', duration: '1 hour' },
        { id: '2', name: 'Filter Replacement', price: '$29.99', duration: '30 mins' }
      ],
      technician: 'Mike Johnson',
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: '2020',
        licensePlate: 'ABC-1234'
      },
      status: 'confirmed',
      totalPrice: '$79.98',
      notes: 'Customer requested synthetic oil'
    },
    { 
      id: 'APT002',
      time: '10:30 AM',
      date: 'June 15, 2025',
      customer: 'Jane Smith',
      customerPhone: '+1 (555) 234-5678',
      customerEmail: 'jane.smith@email.com',
      service: 'Brake Service',
      services: [
        { id: '3', name: 'Brake Pad Replacement', price: '$129.99', duration: '2 hours' }
      ],
      technician: 'Sarah Williams',
      vehicle: {
        make: 'Honda',
        model: 'Civic',
        year: '2019',
        licensePlate: 'XYZ-5678'
      },
      status: 'pending',
      totalPrice: '$129.99'
    },
    { 
      id: 'APT003',
      time: '2:00 PM',
      date: 'June 15, 2025',
      customer: 'Bob Wilson',
      customerPhone: '+1 (555) 345-6789',
      customerEmail: 'bob.wilson@email.com',
      service: 'Engine Tune-Up',
      services: [
        { id: '4', name: 'Engine Diagnostics', price: '$149.99', duration: '1.5 hours' },
        { id: '5', name: 'Engine Tune-Up', price: '$199.99', duration: '2 hours' }
      ],
      technician: 'David Chen',
      vehicle: {
        make: 'Ford',
        model: 'F-150',
        year: '2021',
        licensePlate: 'DEF-9012'
      },
      status: 'confirmed',
      totalPrice: '$349.98',
      notes: 'Check engine light is on'
    }
  ];

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  };

  const handleConvertToService = (appointment: any) => {
    // Here you would typically make an API call to create a service from the appointment
    toast.success(`Appointment #${appointment.id} converted to active service!`, {
      description: `Service has been assigned to ${appointment.technician}`
    });
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setShowEditServiceDialog(true);
  };

  const handleSaveService = (updatedService: any) => {
    // Here you would typically make an API call to update the service
    console.log('Updated service:', updatedService);
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEditEmployeeDialog(true);
  };

  const handleSaveEmployee = (updatedEmployee: any) => {
    // Here you would typically make an API call to update the employee
    console.log('Updated employee:', updatedEmployee);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-[#03045e]">Admin Dashboard</h2>
          <p className="text-slate-600">Manage your automotive service center</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-slate-600">{stat.label}</p>
                  <h3 className="text-[#03045e] mt-1">{stat.value}</h3>
                </div>
                <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">{stat.change}</span>
                <span className="text-slate-500">vs last month</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-200">
          <h3 className="text-[#03045e] mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#0077b6" strokeWidth={2} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-slate-200">
          <h3 className="text-[#03045e] mb-4">Services by Month</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="services" fill="#0077b6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card className="border-slate-200">
            <div className="p-6 flex items-center justify-between border-b border-slate-200">
              <h3 className="text-[#03045e]">Employee Management</h3>
              <Button className="bg-[#0077b6] hover:bg-[#03045e]">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Active Services</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#90e0ef]/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-[#0077b6]" />
                        </div>
                        <span className="text-slate-900">{employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{employee.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {employee.active}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-900">{employee.completed}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-900">{employee.rating}</span>
                        <span className="text-amber-500">★</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        employee.status === 'active' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }>
                        {employee.status === 'active' ? 'Active' : 'On Leave'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card className="border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-[#03045e]">Service Types</h3>
              <p className="text-sm text-slate-500 mt-1">Manage available service types and pricing</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Completed (Month)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceTypes.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#0077b6] flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-slate-900">{service.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{service.duration}</TableCell>
                    <TableCell className="text-[#0077b6]">{service.price}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {service.count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card className="p-6 border-slate-200">
            <h3 className="text-[#03045e] mb-4">Today's Appointments</h3>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="p-4 bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#0077b6] flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900">{appointment.service}</p>
                          <Badge 
                            variant="outline"
                            className={
                              appointment.status === 'confirmed' 
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">Customer: {appointment.customer}</p>
                        <p className="text-sm text-slate-600">Technician: {appointment.technician}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#0077b6] mb-2">{appointment.time}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(appointment)}
                        className="hover:bg-[#0077b6] hover:text-white"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onConvertToService={handleConvertToService}
      />

      {/* Edit Service Dialog */}
      <EditServiceDialog
        service={selectedService}
        open={showEditServiceDialog}
        onOpenChange={setShowEditServiceDialog}
        onSave={handleSaveService}
      />

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        employee={selectedEmployee}
        open={showEditEmployeeDialog}
        onOpenChange={setShowEditEmployeeDialog}
        onSave={handleSaveEmployee}
      />
    </div>
  );
}
