import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Toast, ToastContainer, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPhone, FiCalendar, FiClock, FiEdit2, FiCheck } from 'react-icons/fi';
import { BsFillCarFrontFill } from 'react-icons/bs';
import ApiService from '../../services/api';
import ServiceManagement from './ServiceManagement';
import './EmployeeAppoinmentDetails.css';

type AppointmentStatus = 'pending' | 'confirmed' | 'in-service' | 'completed' | 'cancelled';

interface AppointmentDetails {
  _id: string;
  customerId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  } | string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  vehicleId?: {
    _id?: string;
    registrationNumber?: string;
    make?: string;
    model?: string;
    year?: number;
    type?: string;
    mileage?: number;
  } | string;
  vehicleNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleType?: string;
  appointmentDate?: string;
  preferredDate?: string;
  scheduledDate?: string;
  timeWindow?: string;
  scheduledTime?: string;
  status: AppointmentStatus;
  serviceType?: string;
  serviceDescription?: string;
  services?: {
    serviceId?: {
      _id?: string;
      name?: string;
      description?: string;
      price?: number;
    } | string;
  }[];
  assignedTo?: {
    _id?: string;
    name?: string;
    employeeId?: string;
  } | string;
  assignedEmployee?: string;
  employeeName?: string;
  notes?: string;
  additionalNotes?: string;
  estimatedCost?: number;
}

const EmployeeAppoinmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditingStatus, setIsEditingStatus] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<AppointmentStatus>('pending');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');

  // Helper functions to safely access nested properties
  const getCustomerName = () => {
    if (!appointment) return 'N/A';
    if (typeof appointment.customerId === 'object' && appointment.customerId?.name) {
      return appointment.customerId.name;
    }
    return appointment.customerName || 'N/A';
  };

  const getCustomerPhone = () => {
    if (!appointment) return 'N/A';
    if (typeof appointment.customerId === 'object' && appointment.customerId?.phone) {
      return appointment.customerId.phone;
    }
    return appointment.customerPhone || 'N/A';
  };

  const getCustomerEmail = () => {
    if (!appointment) return 'N/A';
    if (typeof appointment.customerId === 'object' && appointment.customerId?.email) {
      return appointment.customerId.email;
    }
    return appointment.customerEmail || 'N/A';
  };

  const getVehicleNumber = () => {
    if (!appointment) return 'N/A';
    if (typeof appointment.vehicleId === 'object' && appointment.vehicleId?.registrationNumber) {
      return appointment.vehicleId.registrationNumber;
    }
    return appointment.vehicleNumber || 'N/A';
  };

  const getVehicleDetails = () => {
    if (!appointment) return 'N/A';
    if (typeof appointment.vehicleId === 'object') {
      const { make, model, year } = appointment.vehicleId;
      return `${make || ''} ${model || ''} ${year ? `(${year})` : ''}`.trim() || 'N/A';
    }
    return `${appointment.vehicleMake || ''} ${appointment.vehicleModel || ''} ${appointment.vehicleYear ? `(${appointment.vehicleYear})` : ''}`.trim() || 'N/A';
  };

  const getVehicleType = () => {
    if (!appointment) return 'N/A';
    if (typeof appointment.vehicleId === 'object' && appointment.vehicleId?.type) {
      return appointment.vehicleId.type;
    }
    return appointment.vehicleType || 'N/A';
  };

  const getVehicleMileage = () => {
    if (!appointment) return null;
    if (typeof appointment.vehicleId === 'object' && appointment.vehicleId?.mileage) {
      return appointment.vehicleId.mileage;
    }
    return null;
  };

  const getServiceName = () => {
    if (!appointment) return 'N/A';
    if (appointment.services?.[0]?.serviceId) {
      if (typeof appointment.services[0].serviceId === 'object') {
        return appointment.services[0].serviceId.name || 'N/A';
      }
    }
    return appointment.serviceType || 'N/A';
  };

  const getServiceDescription = () => {
    if (!appointment) return 'N/A';
    if (appointment.services?.[0]?.serviceId) {
      if (typeof appointment.services[0].serviceId === 'object') {
        return appointment.services[0].serviceId.description || 'N/A';
      }
    }
    return appointment.serviceDescription || 'N/A';
  };

  const getServicePrice = () => {
    if (!appointment) return 'N/A';
    if (appointment.services?.[0]?.serviceId) {
      if (typeof appointment.services[0].serviceId === 'object' && appointment.services[0].serviceId.price) {
        return appointment.services[0].serviceId.price.toFixed(2);
      }
    }
    return appointment.estimatedCost ? appointment.estimatedCost.toFixed(2) : 'N/A';
  };

  const getAppointmentDate = () => {
    if (!appointment) return '';
    return appointment.appointmentDate || appointment.preferredDate || appointment.scheduledDate || '';
  };

  const getAssignedEmployee = () => {
    if (!appointment) return null;
    if (typeof appointment.assignedTo === 'object' && appointment.assignedTo?.name) {
      return appointment.assignedTo.name;
    }
    return appointment.employeeName || null;
  };

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.getAppointmentById(id);
      
      if (response.success && response.data) {
        setAppointment(response.data);
        setNewStatus(response.data.status);
      } else {
        setError('Failed to fetch appointment details');
      }
    } catch (err: any) {
      console.error('Error fetching appointment:', err);
      setError(err.message || 'Failed to fetch appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceStarted = () => {
    // Refresh appointment data after service is started
    fetchAppointment();
    setToastMessage('Service started successfully!');
    setToastVariant('success');
    setShowToast(true);
  };

  const handleCallCustomer = (): void => {
    const phone = typeof appointment?.customerId === 'object' 
      ? appointment.customerId?.phone 
      : appointment?.customerPhone;
    
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleUpdateStatus = async (): Promise<void> => {
    if (!appointment || !id) return;

    try {
      const response = await ApiService.updateAppointmentStatus(id, newStatus);
      
      if (response.success) {
        setAppointment({ ...appointment, status: newStatus });
        setIsEditingStatus(false);
        setToastMessage('Status updated successfully!');
        setToastVariant('success');
        setShowToast(true);
        fetchAppointment(); // Refresh data
      } else {
        setToastMessage('Failed to update status');
        setToastVariant('danger');
        setShowToast(true);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setToastMessage(err.message || 'Failed to update status');
      setToastVariant('danger');
      setShowToast(true);
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

    return <Badge bg="primary" style={{ backgroundColor: '#0d6efd' }} className="status-badge-large">{statusText[status]}</Badge>;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="appointment-details-page">
        <Container fluid className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading appointment details...</p>
        </Container>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="appointment-details-page">
        <Container fluid className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Error Loading Appointment</Alert.Heading>
            <p>{error || 'Appointment not found'}</p>
            <Button variant="outline-danger" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="appointment-details-page">
      {/* Header */}
      <div className="details-header">
        <div className="header-left">
          <Button variant="outline-secondary" className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft className="me-1" />
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
                      className="contact-btn"
                      onClick={handleCallCustomer}
                    >
                      <FiPhone className="me-1" />
                      Call
                    </Button>
                  </div>
                </div>

                <div className="info-group">
                  <div className="info-item">
                    <label>Name:</label>
                    <strong>{getCustomerName()}</strong>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <strong>{getCustomerPhone()}</strong>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <strong>{getCustomerEmail()}</strong>
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
                    <label>Vehicle No:</label>
                    <strong>{getVehicleNumber()}</strong>
                  </div>
                  <div className="info-item">
                    <label>Vehicle:</label>
                    <strong>{getVehicleDetails()}</strong>
                  </div>
                  <div className="info-item">
                    <label>Type:</label>
                    <strong>{getVehicleType()}</strong>
                  </div>
                  {getVehicleMileage() && (
                    <div className="info-item">
                      <label>Mileage:</label>
                      <strong>{getVehicleMileage()?.toLocaleString()} km</strong>
                    </div>
                  )}
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
                      <FiEdit2 className="me-1" />
                      Edit Status
                    </Button>
                  )}
                </div>

                {isEditingStatus ? (
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Select
                      id="status-update"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as AppointmentStatus)}
                      aria-label="Update appointment status"
                      style={{ width: 'auto', flex: '1' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in-service">In Service</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                    <Button variant="primary" size="sm" onClick={handleUpdateStatus}>
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsEditingStatus(false);
                        setNewStatus(appointment.status);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="info-item d-flex align-items-center gap-2">
                    <label className="mb-0">Current Status:</label>
                    {getStatusBadge(appointment.status)}
                  </div>
                )}
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
                    <strong>{getServiceName()}</strong>
                  </div>
                  <div className="info-item">
                    <label>Description:</label>
                    <p className="service-description">
                      {getServiceDescription()}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Estimated Cost:</label>
                    <strong className="text-success">
                      ${getServicePrice()}
                    </strong>
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
                    <strong>{getAppointmentDate() ? formatDate(getAppointmentDate()) : 'N/A'}</strong>
                  </div>
                  <div className="info-item">
                    <label>
                      <FiClock className="me-1" />
                      Time Window:
                    </label>
                    <strong>{appointment.timeWindow || appointment.scheduledTime || 'N/A'}</strong>
                  </div>
                  {getAssignedEmployee() && (
                    <div className="info-item">
                      <label>Assigned To:</label>
                      <strong>{getAssignedEmployee()}</strong>
                    </div>
                  )}
                </div>

                {(appointment.notes || appointment.additionalNotes) && (
                  <div className="mt-3">
                    <label className="fw-bold">Notes:</label>
                    <p className="text-muted">{appointment.notes || appointment.additionalNotes}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Service Management Component */}
        <Row className="mt-4">
          <Col xs={12}>
            <ServiceManagement 
              appointmentId={appointment._id}
              appointmentStatus={appointment.status}
              onServiceStarted={handleServiceStarted}
            />
          </Col>
        </Row>
      </Container>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <FiCheck className="me-2" />
            <strong className="me-auto">{toastVariant === 'success' ? 'Success' : 'Error'}</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default EmployeeAppoinmentDetails;
