import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FiClock, FiCalendar, FiEye } from 'react-icons/fi';
import { BsFillCarFrontFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../services/api';
import './EmpAppoinmentAll.css';

type AppointmentStatus = 'pending' | 'confirmed' | 'in-service' | 'completed' | 'cancelled';

interface Appointment {
  _id: string;
  customerId: {
    name: string;
    email: string;
    phone: string;
  };
  vehicleId: {
    registrationNumber: string;
    make: string;
    model: string;
  };
  appointmentDate: string;
  timeWindow: string;
  status: AppointmentStatus;
  services: {
    serviceId: {
      name: string;
      description: string;
      price: number;
    };
  }[];
  assignedTo?: {
    name: string;
    employeeId: string;
  };
  notes?: string;
}

const EmpAppoinmentAll: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all appointments for employees (no filter for now since backend doesn't support assignedEmployee filter yet)
      const response = await ApiService.getAllAppointments({});

      if (response.success && response.data) {
        // response.data could be an array or an object with appointments property
        const appointmentsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).appointments || (response.data as any).data || [];
        
        // Filter appointments assigned to this employee on the frontend
        const employeeAppointments = appointmentsData.filter((apt: Appointment) => 
          apt.assignedTo?.employeeId === user?.employeeId || 
          apt.assignedTo?.employeeId === user?.id ||
          apt.status === 'confirmed' // Show all confirmed appointments for now
        );
        setAppointments(employeeAppointments);
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus): React.ReactElement => {
    const statusText = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-service': 'In Service',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    return <Badge bg="primary" style={{ backgroundColor: '#0d6efd' }}>{statusText[status]}</Badge>;
  };

  const handleViewDetails = (appointmentId: string): void => {
    navigate(`/employeeappointment/${appointmentId}`);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Card className="appointment-all-card">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading appointments...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="appointment-all-card">
        <Card.Body>
          <Alert variant="danger">
            <Alert.Heading>Error Loading Appointments</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" size="sm" onClick={fetchAppointments}>
              Try Again
            </Button>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="appointment-all-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="appointment-all-title">My Appointments</h5>
            <Badge bg="secondary" className="total-badge">
              Total: {appointments.length}
            </Badge>
          </div>

          {appointments.length === 0 ? (
            <Alert variant="info">
              No appointments assigned to you yet.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="appointment-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer Name</th>
                    <th>Vehicle Info</th>
                    <th>Service</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment, index) => (
                    <tr key={appointment._id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="customer-info">
                          <strong>{appointment.customerId?.name || 'N/A'}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="vehicle-info">
                          <div className="d-flex align-items-center">
                            <BsFillCarFrontFill className="me-2 text-primary" />
                            <div>
                              <div className="vehicle-number">
                                {appointment.vehicleId?.registrationNumber || 'N/A'}
                              </div>
                              <small className="text-muted">
                                {appointment.vehicleId?.make} {appointment.vehicleId?.model}
                              </small>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="service-name">
                          {appointment.services?.[0]?.serviceId?.name || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div className="schedule-info">
                          <div className="d-flex align-items-center mb-1">
                            <FiCalendar className="me-2 text-muted" size={14} />
                            <small>{formatDate(appointment.appointmentDate)}</small>
                          </div>
                          <div className="d-flex align-items-center">
                            <FiClock className="me-2 text-muted" size={14} />
                            <small>{appointment.timeWindow}</small>
                          </div>
                        </div>
                      </td>
                      <td>{getStatusBadge(appointment.status)}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="details-btn"
                          onClick={() => handleViewDetails(appointment._id)}
                        >
                          <FiEye className="me-1" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default EmpAppoinmentAll;
