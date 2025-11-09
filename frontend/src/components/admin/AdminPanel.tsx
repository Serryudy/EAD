import { useState, useEffect } from 'react';
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
import { employeeApi, appointmentApi, serviceApi, dashboardApi } from '../../services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  nic?: string;
  isActive?: boolean;
}

export function AdminPanel() {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showEditServiceDialog, setShowEditServiceDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEditEmployeeDialog, setShowEditEmployeeDialog] = useState(false);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showDeleteEmployeeDialog, setShowDeleteEmployeeDialog] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    nic: '',
    password: '',
  });

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
    fetchAppointments();
    fetchServices();
    fetchAdminStats();
    fetchMonthlyAnalytics();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await employeeApi.getAllEmployees();
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await appointmentApi.getAllAppointments({
        limit: 100, // Get more appointments for admin view
        sortBy: 'preferredDate',
        sortOrder: 'asc'
      });
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);
      console.log('🔍 Fetching all services for admin panel...');
      // Fetch ALL services without any filters - admin should see everything
      const response = await serviceApi.getAllServices({
        limit: 1000, // Set high limit to get all services
        page: 1,
        sortBy: 'name',
        sortOrder: 'asc'
        // No isActive, isPopular, or category filters - get ALL services
      });
      console.log('� Services API response:', response);
      console.log('� Services count:', response.data?.length);
      
      if (response.success && response.data) {
        // Filter out inactive (deleted) services - only show active services in admin panel
        const activeServices = response.data.filter((service: any) => service.isActive !== false);
        setServices(activeServices);
        console.log('✅ Active services loaded:', activeServices.length);
      } else {
        console.log('❌ Response not successful or no data');
        toast.error('Failed to load services');
      }
    } catch (error) {
      console.error('❌ Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoadingStats(true);
      console.log('🔍 Fetching admin stats...');
      const response = await dashboardApi.getAdminStats();
      console.log('📊 Admin stats response:', response);
      
      if (response.success && response.data) {
        setAdminStats(response.data);
        console.log('✅ Admin stats loaded:', response.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch admin stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchMonthlyAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      console.log('🔍 Fetching monthly analytics...');
      const response = await dashboardApi.getAdminMonthlyAnalytics();
      console.log('📈 Monthly analytics response:', response);
      
      if (response.success && response.data) {
        setMonthlyAnalytics(response.data);
        console.log('✅ Monthly analytics loaded:', response.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch monthly analytics:', error);
      toast.error('Failed to load analytics charts');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Handle add employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await employeeApi.createEmployee(employeeFormData);
      if (response.success) {
        setShowAddEmployeeDialog(false);
        setEmployeeFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          nic: '',
          password: '',
        });
        fetchEmployees();
        toast.success('Employee created successfully!');
      } else {
        // Show error message from backend
        toast.error(response.message || 'Failed to create employee');
      }
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      // Extract error message from error object
      const errorMessage = error?.message || 'Failed to create employee. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handle edit employee
  const handleEditEmployee = async (updatedData: Partial<Employee>) => {
    if (!selectedEmployee) return;

    try {
      const response = await employeeApi.updateEmployee(selectedEmployee._id, updatedData);
      if (response.success) {
        setShowEditEmployeeDialog(false);
        setSelectedEmployee(null);
        fetchEmployees();
        toast.success('Employee updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update employee');
      }
    } catch (error: any) {
      console.error('Failed to update employee:', error);
      const errorMessage = error?.message || 'Failed to update employee. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handle delete employee
  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const response = await employeeApi.deleteEmployee(selectedEmployee._id);
      if (response.success) {
        setShowDeleteEmployeeDialog(false);
        setSelectedEmployee(null);
        fetchEmployees();
        toast.success('Employee deactivated successfully!');
      } else {
        toast.error(response.message || 'Failed to deactivate employee');
      }
    } catch (error: any) {
      console.error('Failed to delete employee:', error);
      const errorMessage = error?.message || 'Failed to deactivate employee. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Open edit dialog
  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditEmployeeDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowDeleteEmployeeDialog(true);
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  };

  const handleConvertToService = async () => {
    // Refresh appointments list after successful conversion
    await fetchAppointments();
    toast.success('Appointment converted to active service successfully!');
  };

  const handleEditService = (service: any) => {
    setSelectedService(service);
    setShowEditServiceDialog(true);
  };

  const handleSaveService = async (updatedService: any) => {
    try {
      const response = await serviceApi.updateService(updatedService._id, updatedService);
      if (response.success) {
        toast.success('Service updated successfully');
        await fetchServices(); // Refresh services list
      }
    } catch (error: any) {
      console.error('Failed to update service:', error);
      toast.error(error.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async (service: any) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      try {
        const response = await serviceApi.deleteService(service._id);
        if (response.success) {
          toast.success('Service deleted successfully');
          await fetchServices(); // Refresh services list
        }
      } catch (error: any) {
        console.error('Failed to delete service:', error);
        toast.error(error.message || 'Failed to delete service');
      }
    }
  };

  // Prepare stats from adminStats data
  const stats = adminStats ? [
    { 
      label: 'Total Customers', 
      value: adminStats.totalCustomers?.toString() || '0', 
      change: '+12%', 
      icon: Users, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Active Services', 
      value: adminStats.activeServices?.toString() || '0', 
      change: '+5%', 
      icon: Wrench, 
      color: 'bg-amber-500' 
    },
    { 
      label: 'Completed Services', 
      value: adminStats.completedServices?.toString() || '0', 
      change: '+23%', 
      icon: CheckCircle2, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Total Revenue', 
      value: adminStats.totalRevenue ? `$${(adminStats.totalRevenue / 1000).toFixed(1)}K` : '$0', 
      change: '+18%', 
      icon: DollarSign, 
      color: 'bg-purple-500' 
    }
  ] : [
    { label: 'Total Customers', value: '-', change: '-', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Services', value: '-', change: '-', icon: Wrench, color: 'bg-amber-500' },
    { label: 'Completed Services', value: '-', change: '-', icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Total Revenue', value: '-', change: '-', icon: DollarSign, color: 'bg-purple-500' }
  ];

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
          {loadingAnalytics ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b6] mx-auto"></div>
                <p className="text-slate-500 text-sm mt-2">Loading chart...</p>
              </div>
            </div>
          ) : monthlyAnalytics.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyAnalytics}>
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
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-slate-500">No revenue data available</p>
            </div>
          )}
        </Card>

        <Card className="p-6 border-slate-200">
          <h3 className="text-[#03045e] mb-4">Services by Month</h3>
          {loadingAnalytics ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b6] mx-auto"></div>
                <p className="text-slate-500 text-sm mt-2">Loading chart...</p>
              </div>
            </div>
          ) : monthlyAnalytics.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyAnalytics}>
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
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-slate-500">No services data available</p>
            </div>
          )}
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
              <Button 
                className="bg-[#0077b6] hover:bg-[#03045e]"
                onClick={() => setShowAddEmployeeDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>NIC</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingEmployees ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No employees yet. Add your first employee!
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#90e0ef]/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-[#0077b6]" />
                          </div>
                          <span className="text-slate-900">{employee.firstName} {employee.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{employee.email || '-'}</TableCell>
                      <TableCell className="text-slate-600">{employee.phoneNumber}</TableCell>
                      <TableCell className="text-slate-600">{employee.nic || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openDeleteDialog(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card className="border-slate-200">
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
                {loadingServices ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      Loading services...
                    </TableCell>
                  </TableRow>
                ) : services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#0077b6] flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-slate-900 font-medium">{service.name}</p>
                            {service.category && (
                              <p className="text-xs text-slate-500">{service.category}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {service.estimatedDuration < 1 
                          ? `${Math.round(service.estimatedDuration * 60)} min` 
                          : `${service.estimatedDuration}h`
                        }
                      </TableCell>
                      <TableCell className="text-[#0077b6] font-semibold">
                        ${service.basePrice?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {service.timesBooked || 0}
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteService(service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card className="p-6 border-slate-200">
            <h3 className="text-[#03045e] mb-4">All Appointments</h3>
            <div className="space-y-3">
              {loadingAppointments ? (
                <div className="text-center py-8 text-slate-500">
                  Loading appointments...
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No appointments found
                </div>
              ) : (
                appointments.map((appointment) => (
                  <Card key={appointment._id} className="p-4 bg-slate-50 border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-[#0077b6] flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900">
                              {appointment.serviceType || 'Service Appointment'}
                            </p>
                            <Badge 
                              variant="outline"
                              className={
                                appointment.status === 'confirmed' 
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : appointment.status === 'completed'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : appointment.status === 'in-progress'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            Customer: {appointment.customerId ? 
                              `${appointment.customerId.firstName} ${appointment.customerId.lastName}` 
                              : 'Guest Customer'
                            }
                          </p>
                          {appointment.assignedEmployee && (
                            <p className="text-sm text-slate-600">
                              Technician: {appointment.assignedEmployee.firstName} {appointment.assignedEmployee.lastName}
                            </p>
                          )}
                          {appointment.vehicleId && (
                            <p className="text-sm text-slate-600">
                              Vehicle: {appointment.vehicleId.make} {appointment.vehicleId.model} ({appointment.vehicleId.vehicleNumber})
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 mb-1">
                          {new Date(appointment.preferredDate).toLocaleDateString()}
                        </p>
                        <p className="text-lg font-semibold text-[#0077b6] mb-2">
                          {appointment.timeWindow || appointment.scheduledTime || 'TBD'}
                        </p>
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
                ))
              )}
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
        onSave={handleEditEmployee}
      />

      {/* Add Employee Dialog */}
      <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account for your service team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={employeeFormData.firstName}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={employeeFormData.lastName}
                  onChange={(e) => setEmployeeFormData({ ...employeeFormData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={employeeFormData.email}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={employeeFormData.phoneNumber}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, phoneNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nic">NIC</Label>
              <Input
                id="nic"
                value={employeeFormData.nic}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, nic: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={employeeFormData.password}
                onChange={(e) => setEmployeeFormData({ ...employeeFormData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddEmployeeDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#0077b6] hover:bg-[#03045e]">Create Employee</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteEmployeeDialog} onOpenChange={setShowDeleteEmployeeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the employee account for{' '}
              <strong>
                {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </strong>
              . They will no longer be able to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEmployee}
              className="bg-red-600 hover:bg-red-700"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
