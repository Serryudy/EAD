import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPhone, FiMail, FiCalendar, FiClock, FiDollarSign } from 'react-icons/fi';
import { BsFillCarFrontFill } from 'react-icons/bs';
import './EmployeeAppoinmentDetails.css';

type AppointmentStatus = 'pending' | 'confirmed' | 'in-service' | 'completed' | 'cancelled';

interface AppointmentDetails {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  service: string;
  serviceDescription: string;
  estimatedCost: number;
  notes: string;
}

const EmployeeAppoinmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Sample appointment data (in real app, fetch from API using id)
  const [appointment, setAppointment] = useState<AppointmentDetails>({
    id: Number(id) || 1,
    customerName: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    customerEmail: 'john.smith@email.com',
    vehicleNumber: 'ABC-1234',
    vehicleType: 'Toyota Corolla',
    vehicleMake: 'Toyota',
    vehicleModel: 'Corolla',
    vehicleYear: 2020,
    date: '2025-10-29',
    time: '09:00 AM',
    status: 'pending',
    service: 'Oil Change',
    serviceDescription: 'Full synthetic oil change with filter replacement. Includes multi-point inspection.',
    estimatedCost: 89.99,
    notes: 'Customer requested Mobil 1 synthetic oil.'
  });

  const [isEditingStatus, setIsEditingStatus] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<AppointmentStatus>(appointment.status);

  const handleCallCustomer = (): void => {
    window.location.href = `tel:${appointment.customerPhone}`;
  };

  const handleEmailCustomer = (): void => {
    window.location.href = `mailto:${appointment.customerEmail}`;
  };

  const handleUpdateStatus = (): void => {
    setAppointment({ ...appointment, status: newStatus });
    setIsEditingStatus(false);
  };

  const getStatusBadge = (status: AppointmentStatus): React.ReactElement => {
    const statusText = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-service': 'In Service',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    return <Badge bg="primary" style={{ backgroundColor: '#0d6efd' }} className="status-badge-large">{statusText[status]}</Badge>;
  };

  return (
    <div className="appointment-details-page">
      {/* Header */}
      <div className="details-header">
        <div className="header-left">
          <Button variant="outline-secondary" className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft className="me-2" />
            Back
          </Button>
          <h4 className="details-title">Appointment Details</h4>
        </div>
        <div className="header-right">
          {getStatusBadge(appointment.status)}
        </div>
      </div>

      <Container fluid className="details-content">
        <Row className="g-4">
          {/* Left Column - Customer & Vehicle Info */}
          <Col lg={6}>
            {/* Customer Information */}
            <Card className="detail-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-section-title">Customer Information</h5>
                  <div className="contact-buttons">
                    <Button 
                      variant="success" 
                      size="sm" 
                      className="me-2 contact-btn"
                      onClick={handleCallCustomer}
                    >
                      <FiPhone className="me-1" />
                      Call
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="contact-btn"
                      onClick={handleEmailCustomer}
                    >
                      <FiMail className="me-1" />
                      Email
                    </Button>
                  </div>
                </div>

                <div className="info-group">
                  <div className="info-item">
                    <label>Name:</label>
                    <strong>{appointment.customerName}</strong>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <strong>{appointment.customerPhone}</strong>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <strong>{appointment.customerEmail}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Vehicle Information */}
            <Card className="detail-card mt-4">
              <Card.Body>
                <h5 className="card-section-title mb-3">
                  <BsFillCarFrontFill className="me-2" />
                  Vehicle Information
                </h5>

                <div className="info-group">
                  <div className="info-item">
                    <label>License Plate:</label>
                    <strong>{appointment.vehicleNumber}</strong>
                  </div>
                  <div className="info-item">
                    <label>Make & Model:</label>
                    <strong>{appointment.vehicleMake} {appointment.vehicleModel}</strong>
                  </div>
                  <div className="info-item">
                    <label>Year:</label>
                    <strong>{appointment.vehicleYear}</strong>
                  </div>
                  <div className="info-item">
                    <label>Type:</label>
                    <strong>{appointment.vehicleType}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Appointment Info */}
          <Col lg={6}>
            {/* Service Information */}
            <Card className="detail-card">
              <Card.Body>
                <h5 className="card-section-title mb-3">Service Details</h5>

                <div className="info-group">
                  <div className="info-item">
                    <label>Service Type:</label>
                    <strong>{appointment.service}</strong>
                  </div>
                  <div className="info-item">
                    <label>Description:</label>
                    <p className="service-description">{appointment.serviceDescription}</p>
                  </div>
                  <div className="info-item">
                    <label>
                      <FiDollarSign className="me-1" />
                      Estimated Cost:
                    </label>
                    <strong className="cost-amount">${appointment.estimatedCost.toFixed(2)}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Schedule Information */}
            <Card className="detail-card mt-4">
              <Card.Body>
                <h5 className="card-section-title mb-3">Schedule Information</h5>

                <div className="info-group">
                  <div className="info-item">
                    <label>
                      <FiCalendar className="me-1" />
                      Date:
                    </label>
                    <strong>{appointment.date}</strong>
                  </div>
                  <div className="info-item">
                    <label>
                      <FiClock className="me-1" />
                      Time:
                    </label>
                    <strong>{appointment.time}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Status Management */}
            <Card className="detail-card mt-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-section-title mb-0">Status Management</h5>
                  {!isEditingStatus && (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => setIsEditingStatus(true)}
                    >
                      Edit Status
                    </Button>
                  )}
                </div>

                {isEditingStatus ? (
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="status-update">Update Status</Form.Label>
                      <Form.Select
                        id="status-update"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as AppointmentStatus)}
                        aria-label="Update appointment status"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-service">In Service</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Form.Group>
                    <div className="d-flex gap-2">
                      <Button variant="primary" onClick={handleUpdateStatus}>
                        Save Status
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setIsEditingStatus(false);
                          setNewStatus(appointment.status);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="info-item">
                    <label>Current Status:</label>
                    {getStatusBadge(appointment.status)}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Additional Notes */}
            {appointment.notes && (
              <Card className="detail-card mt-4">
                <Card.Body>
                  <h5 className="card-section-title mb-3">Additional Notes</h5>
                  <p className="notes-text">{appointment.notes}</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EmployeeAppoinmentDetails;
