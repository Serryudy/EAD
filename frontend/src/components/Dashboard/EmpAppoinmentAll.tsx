import React, { useState } from 'react';
import { Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FiEdit, FiClock, FiCalendar } from 'react-icons/fi';
import { BsFillCarFrontFill } from 'react-icons/bs';
import './EmpAppoinmentAll.css';

type AppointmentStatus = 'pending' | 'confirmed' | 'in-service' | 'completed' | 'cancelled';

interface Appointment {
  id: number;
  customerName: string;
  vehicleNumber: string;
  vehicleType: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  service: string;
}

interface StatusConfig {
  bg: string;
  text: string;
}

const EmpAppoinmentAll: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState<AppointmentStatus>('pending');

  // Sample appointment data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      customerName: 'John Smith',
      vehicleNumber: 'ABC-1234',
      vehicleType: 'Toyota Corolla',
      date: '2025-10-29',
      time: '09:00 AM',
      status: 'pending',
      service: 'Oil Change'
    },
    {
      id: 2,
      customerName: 'Sarah Johnson',
      vehicleNumber: 'XYZ-5678',
      vehicleType: 'Honda Civic',
      date: '2025-10-29',
      time: '11:30 AM',
      status: 'confirmed',
      service: 'Brake Check'
    },
    {
      id: 3,
      customerName: 'Mike Wilson',
      vehicleNumber: 'DEF-9012',
      vehicleType: 'Ford Focus',
      date: '2025-10-29',
      time: '02:00 PM',
      status: 'in-service',
      service: 'Full Service'
    },
    {
      id: 4,
      customerName: 'Emily Davis',
      vehicleNumber: 'GHI-3456',
      vehicleType: 'BMW 320i',
      date: '2025-10-30',
      time: '10:00 AM',
      status: 'completed',
      service: 'Tire Replacement'
    },
    {
      id: 5,
      customerName: 'Robert Brown',
      vehicleNumber: 'JKL-7890',
      vehicleType: 'Mercedes C-Class',
      date: '2025-10-30',
      time: '03:30 PM',
      status: 'pending',
      service: 'AC Repair'
    }
  ]);

  const getStatusBadge = (status: AppointmentStatus): React.ReactElement => {
    const statusConfig: Record<AppointmentStatus, StatusConfig> = {
      pending: { bg: 'warning', text: 'Pending' },
      confirmed: { bg: 'primary', text: 'Confirmed' },
      'in-service': { bg: 'info', text: 'In Service' },
      completed: { bg: 'success', text: 'Completed' },
      cancelled: { bg: 'danger', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const handleStatusChange = (appointment: Appointment): void => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setShowModal(true);
  };

  const handleSaveStatus = (): void => {
    if (selectedAppointment) {
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointment.id 
          ? { ...apt, status: newStatus }
          : apt
      ));
      setShowModal(false);
      setSelectedAppointment(null);
    }
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
                  <th>Action</th>
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
                        variant="outline-primary"
                        size="sm"
                        className="action-btn"
                        onClick={() => handleStatusChange(appointment)}
                      >
                        <FiEdit className="me-1" />
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Appointment Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div>
              <p><strong>Customer:</strong> {selectedAppointment.customerName}</p>
              <p><strong>Vehicle:</strong> {selectedAppointment.vehicleNumber} - {selectedAppointment.vehicleType}</p>
              <p><strong>Service:</strong> {selectedAppointment.service}</p>
              <hr />
              <Form.Group>
                <Form.Label htmlFor="status-select">Change Status</Form.Label>
                <Form.Select 
                  id="status-select"
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value as AppointmentStatus)}
                  aria-label="Select appointment status"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-service">In Service</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveStatus}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EmpAppoinmentAll;
