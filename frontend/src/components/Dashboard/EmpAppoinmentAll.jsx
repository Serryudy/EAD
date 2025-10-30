import React, { useState } from 'react';
import { Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import { FiEdit, FiClock, FiCalendar } from 'react-icons/fi';
import { BsFillCarFrontFill } from 'react-icons/bs';
import './EmpAppoinmentAll.css';

const EmpAppoinmentAll = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Sample appointment data
  const [appointments, setAppointments] = useState([
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Pending' },
      confirmed: { bg: 'primary', text: 'Confirmed' },
      'in-service': { bg: 'info', text: 'In Service' },
      completed: { bg: 'success', text: 'Completed' },
      cancelled: { bg: 'danger', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const handleStatusChange = (appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setShowModal(true);
  };

  const handleSaveStatus = () => {
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
                <Form.Label>Change Status</Form.Label>
                <Form.Select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
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
