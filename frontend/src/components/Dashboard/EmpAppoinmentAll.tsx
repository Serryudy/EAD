import React from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import { FiClock, FiCalendar, FiEye } from 'react-icons/fi';
import { BsFillCarFrontFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import './EmpAppoinmentAll.css';

type AppointmentStatus = 'pending' | 'confirmed' | 'in-service' | 'completed' | 'cancelled';

interface Appointment {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleNumber: string;
  vehicleType: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  service: string;
  serviceDescription: string;
  estimatedCost: number;
}

const EmpAppoinmentAll: React.FC = () => {
  const navigate = useNavigate();

  // Sample appointment data
  const appointments: Appointment[] = [
    {
      id: 1,
      customerName: 'John Smith',
      customerPhone: '+1 (555) 123-4567',
      customerEmail: 'john.smith@email.com',
      vehicleNumber: 'ABC-1234',
      vehicleType: 'Toyota Corolla',
      date: '2025-10-29',
      time: '09:00 AM',
      status: 'pending',
      service: 'Oil Change',
      serviceDescription: 'Full synthetic oil change with filter replacement',
      estimatedCost: 89.99
    },
    {
      id: 2,
      customerName: 'Sarah Johnson',
      customerPhone: '+1 (555) 234-5678',
      customerEmail: 'sarah.j@email.com',
      vehicleNumber: 'XYZ-5678',
      vehicleType: 'Honda Civic',
      date: '2025-10-29',
      time: '11:30 AM',
      status: 'confirmed',
      service: 'Brake Check',
      serviceDescription: 'Complete brake system inspection and pad replacement',
      estimatedCost: 249.99
    },
    {
      id: 3,
      customerName: 'Mike Wilson',
      customerPhone: '+1 (555) 345-6789',
      customerEmail: 'mike.wilson@email.com',
      vehicleNumber: 'DEF-9012',
      vehicleType: 'Ford Focus',
      date: '2025-10-29',
      time: '02:00 PM',
      status: 'in-service',
      service: 'Full Service',
      serviceDescription: 'Complete vehicle maintenance and inspection',
      estimatedCost: 399.99
    },
    {
      id: 4,
      customerName: 'Emily Davis',
      customerPhone: '+1 (555) 456-7890',
      customerEmail: 'emily.d@email.com',
      vehicleNumber: 'GHI-3456',
      vehicleType: 'BMW 320i',
      date: '2025-10-30',
      time: '10:00 AM',
      status: 'completed',
      service: 'Tire Replacement',
      serviceDescription: 'Four tire replacement with alignment',
      estimatedCost: 699.99
    },
    {
      id: 5,
      customerName: 'Robert Brown',
      customerPhone: '+1 (555) 567-8901',
      customerEmail: 'robert.brown@email.com',
      vehicleNumber: 'JKL-7890',
      vehicleType: 'Mercedes C-Class',
      date: '2025-10-30',
      time: '03:30 PM',
      status: 'pending',
      service: 'AC Repair',
      serviceDescription: 'Air conditioning system diagnostics and repair',
      estimatedCost: 450.00
    }
  ];

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

  const handleViewDetails = (appointmentId: number): void => {
    navigate(`/employeeappointment/${appointmentId}`);
  };

  return (
    <>
      <Card className="appointment-all-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="appointment-all-title">All Appointments</h5>
            <Badge bg="secondary" className="total-badge">
              Total: {appointments.length}
            </Badge>
          </div>

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
                  <tr key={appointment.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="customer-info">
                        <strong>{appointment.customerName}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <div className="d-flex align-items-center">
                          <BsFillCarFrontFill className="me-2 text-primary" />
                          <div>
                            <div className="vehicle-number">{appointment.vehicleNumber}</div>
                            <small className="text-muted">{appointment.vehicleType}</small>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="service-name">{appointment.service}</span>
                    </td>
                    <td>
                      <div className="schedule-info">
                        <div className="d-flex align-items-center mb-1">
                          <FiCalendar className="me-2 text-muted" size={14} />
                          <small>{appointment.date}</small>
                        </div>
                        <div className="d-flex align-items-center">
                          <FiClock className="me-2 text-muted" size={14} />
                          <small>{appointment.time}</small>
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        className="details-btn"
                        onClick={() => handleViewDetails(appointment.id)}
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
        </Card.Body>
      </Card>
    </>
  );
};

export default EmpAppoinmentAll;
