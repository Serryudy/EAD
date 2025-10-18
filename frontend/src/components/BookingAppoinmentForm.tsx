import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import PageLayout from './PageLayout';
import {
  FaCar,
  FaWrench,
  FaCalendarAlt,
  FaClock,
  FaStickyNote,
  FaSave,
  FaArrowRight,
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaHourglass
} from 'react-icons/fa';

interface BookAppointmentFormProps {
  onSaveDraft?: (appointmentData: AppointmentData) => void;
  onContinue?: (appointmentData: AppointmentData) => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

interface AppointmentData {
  vehicle: string;
  serviceType: string;
  preferredDate: string;
  timeWindow: string;
  additionalNotes: string;
  employee: string;
  customerName: string;
  customerPhone: string;
  estimatedDuration: string;
  serviceBayAllocation: string;
}

const BookAppointmentForm: React.FC<BookAppointmentFormProps> = ({
  onSaveDraft,
  onContinue,
  onBack,
  currentStep = 2,
  totalSteps = 3
}) => {
  const [vehicle, setVehicle] = useState('Toyota Corolla • AB12 XYZ');
  const [serviceType, setServiceType] = useState('Periodic Maintenance');
  const [preferredDate, setPreferredDate] = useState('2025-10-22');
  const [timeWindow, setTimeWindow] = useState('09:00 AM - 11:00 AM');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Summary data
  const employee = 'EMP-000123';
  const vehicleSummary = 'Toyota Corolla (2019)';
  const customerName = 'John Smith';
  const customerPhone = '+1 202 555 0142';
  const estimatedDuration = '~ 2 hours';
  const serviceBayAllocation = 'Auto';

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft({
        vehicle,
        serviceType,
        preferredDate,
        timeWindow,
        additionalNotes,
        employee,
        customerName,
        customerPhone,
        estimatedDuration,
        serviceBayAllocation
      });
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue({
        vehicle,
        serviceType,
        preferredDate,
        timeWindow,
        additionalNotes,
        employee,
        customerName,
        customerPhone,
        estimatedDuration,
        serviceBayAllocation
      });
    }
  };

  return (
    <PageLayout>
      <div>
        {/* Header */}
        <div className="mb-4">
          <Card 
            className="shadow-sm border-0"
            style={{ borderRadius: '16px' }}
          >
            <Card.Body className="py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
                  <FaCalendarAlt size={20} />
                  <h4 className="mb-0 fw-semibold">Book Appointment</h4>
                </div>
                <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
                  {onBack && (
                    <Button
                      variant="link"
                      onClick={onBack}
                      className="text-decoration-none text-dark d-flex align-items-center"
                      style={{ gap: '0.5rem' }}
                    >
                      <FaArrowLeft size={14} />
                      Back
                    </Button>
                  )}
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Main Content */}
        <Row className="g-4">
          {/* Left Side - Form */}
          <Col lg={8}>
          <Card 
            className="shadow-sm border-0"
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(to bottom, #f3f4f6, #ffffff)'
            }}
          >
            <Card.Body className="p-4">
              <h5 className="mb-4 fw-semibold" style={{ fontSize: '1.25rem' }}>
                Select Vehicle & Service
              </h5>

              <Row className="g-4">
                {/* Vehicle */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-medium mb-2">
                      Vehicle
                    </Form.Label>
                    <div className="position-relative">
                      <FaCar
                        className="position-absolute text-muted"
                        style={{
                          left: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none'
                        }}
                      />
                      <Form.Control
                        type="text"
                        value={vehicle}
                        onChange={(e) => setVehicle(e.target.value)}
                        style={{
                          paddingLeft: '2.5rem',
                          height: '48px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                  </Form.Group>
                </Col>

                {/* Service Type */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-medium mb-2">
                      Service Type
                    </Form.Label>
                    <div className="position-relative">
                      <FaWrench
                        className="position-absolute text-muted"
                        style={{
                          left: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none'
                        }}
                      />
                      <Form.Select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        style={{
                          paddingLeft: '2.5rem',
                          height: '48px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="Periodic Maintenance">Periodic Maintenance</option>
                        <option value="Oil Change">Oil Change</option>
                        <option value="Tire Rotation">Tire Rotation</option>
                        <option value="Brake Inspection">Brake Inspection</option>
                        <option value="Full Service">Full Service</option>
                      </Form.Select>
                    </div>
                  </Form.Group>
                </Col>

                {/* Preferred Date */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-medium mb-2">
                      Preferred Date
                    </Form.Label>
                    <div className="position-relative">
                      <FaCalendarAlt
                        className="position-absolute text-muted"
                        style={{
                          left: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none'
                        }}
                      />
                      <Form.Control
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        style={{
                          paddingLeft: '2.5rem',
                          height: '48px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                  </Form.Group>
                </Col>

                {/* Time Window */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-medium mb-2">
                      Time Window
                    </Form.Label>
                    <div className="position-relative">
                      <FaClock
                        className="position-absolute text-muted"
                        style={{
                          left: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none'
                        }}
                      />
                      <Form.Control
                        type="text"
                        value={timeWindow}
                        onChange={(e) => setTimeWindow(e.target.value)}
                        style={{
                          paddingLeft: '2.5rem',
                          height: '48px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                  </Form.Group>
                </Col>

                {/* Additional Notes */}
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-medium mb-2">
                      Additional Notes
                    </Form.Label>
                    <div className="position-relative">
                      <FaStickyNote
                        className="position-absolute text-muted"
                        style={{
                          left: '1rem',
                          top: '1rem',
                          pointerEvents: 'none'
                        }}
                      />
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Describe any issues or requests..."
                        style={{
                          paddingLeft: '2.5rem',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white',
                          resize: 'none'
                        }}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end mt-4" style={{ gap: '1rem' }}>
                <Button
                  variant="outline-secondary"
                  onClick={handleSaveDraft}
                  className="d-flex align-items-center"
                  style={{
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db'
                  }}
                >
                  <FaSave size={16} />
                  Save Draft
                </Button>
                <Button
                  variant="primary"
                  onClick={handleContinue}
                  className="d-flex align-items-center"
                  style={{
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#38bdf8',
                    border: 'none'
                  }}
                >
                  Continue
                  <FaArrowRight size={16} />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Side - Summary */}
        <Col lg={4}>
          <Card 
            className="shadow-sm border-0"
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #d1fae5 0%, #dbeafe 100%)'
            }}
          >
            <Card.Body className="p-4">
              <h5 className="mb-4 fw-semibold" style={{ fontSize: '1.25rem' }}>
                Summary
              </h5>

              <div className="d-flex flex-column" style={{ gap: '1rem' }}>
                {/* Employee */}
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                      <FaUser size={14} className="text-muted" />
                      <span className="small fw-medium">Employee: {employee}</span>
                    </div>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.5rem'
                      }}
                    >
                      Authenticated
                    </span>
                  </div>
                </div>

                {/* Vehicle */}
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <FaCar size={14} className="text-muted" />
                    <span className="small fw-medium">{vehicleSummary}</span>
                  </div>
                </div>

                {/* Service */}
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <FaWrench size={14} className="text-muted" />
                    <span className="small fw-medium">{serviceType}</span>
                  </div>
                </div>

                {/* Date & Time */}
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <FaCalendarAlt size={14} className="text-muted" />
                    <span className="small fw-medium">
                      Tue, Oct 22 • 9-11 AM
                    </span>
                  </div>
                </div>

                {/* Service Bay Allocation */}
                <div 
                  className="p-3 rounded"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <FaMapMarkerAlt size={14} className="text-muted" />
                    <span className="small fw-medium">
                      Service Bay Allocation: {serviceBayAllocation}
                    </span>
                  </div>
                </div>

                {/* Estimated Duration Section */}
                <div className="mt-3">
                  <p className="text-muted small fw-medium mb-2">Estimated Duration</p>
                  <div 
                    className="p-3 rounded"
                    style={{ 
                      backgroundColor: 'rgba(219, 234, 254, 0.6)',
                      border: '1px solid rgba(219, 234, 254, 0.5)'
                    }}
                  >
                    <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                      <FaHourglass size={14} className="text-muted" />
                      <span className="small fw-medium">{estimatedDuration}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Section */}
                <div className="mt-3">
                  <p className="text-muted small fw-medium mb-2">Customer</p>
                  <div 
                    className="p-3 rounded"
                    style={{ 
                      backgroundColor: 'rgba(219, 234, 254, 0.6)',
                      border: '1px solid rgba(219, 234, 254, 0.5)'
                    }}
                  >
                    <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                      <FaPhone size={14} className="text-muted" />
                      <span className="small fw-medium">
                        {customerName} • {customerPhone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </div>
    </PageLayout>
  );
};

export default BookAppointmentForm;