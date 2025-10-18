import React, { useState } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { 
  FaWrench, 
  FaCalendarAlt, 
  FaClock,
  FaCheck
} from 'react-icons/fa';

interface BookingWizardProps {
  onConfirm?: (bookingData: BookingData) => void;
}

interface BookingData {
  service: string;
  date: string;
  time: string;
}

const BookingWizard: React.FC<BookingWizardProps> = ({ onConfirm }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const services = [
    { id: 'oil-change', label: 'Oil Change', icon: <FaWrench /> },
    { id: 'tire-rotation', label: 'Tire Rotation', icon: <FaWrench /> },
    { id: 'brake-inspection', label: 'Brake Inspection', icon: <FaWrench /> },
    { id: 'battery-check', label: 'Battery Check', icon: <FaWrench /> },
    { id: 'full-service', label: 'Full Service', icon: <FaWrench /> }
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleConfirmBooking = () => {
    if (onConfirm) {
      onConfirm({
        service: selectedService,
        date: selectedDate,
        time: selectedTime
      });
    }
  };

  const isStepComplete = (step: number) => {
    if (step === 1) return selectedService !== '';
    if (step === 2) return selectedDate !== '';
    if (step === 3) return selectedTime !== '';
    return false;
  };

  const canProceed = () => {
    return selectedService && selectedDate && selectedTime;
  };

  return (
    <Card 
      className="shadow-sm border"
      style={{
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      <Card.Body className="p-4">
        {/* Step Indicators */}
        <div className="d-flex mb-4" style={{ gap: '1rem' }}>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`px-3 py-2 rounded ${
                currentStep === step
                  ? 'bg-primary text-white'
                  : isStepComplete(step)
                  ? 'bg-light text-dark'
                  : 'bg-light text-muted'
              }`}
              style={{
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setCurrentStep(step)}
            >
              {step}. {step === 1 ? 'Service' : step === 2 ? 'Date' : 'Time'}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <Row className="g-4">
          {/* Service Selection */}
          <Col md={4}>
            <label className="form-label text-muted small fw-medium mb-3">
              Select Service
            </label>
            <div className="d-flex flex-column" style={{ gap: '0.5rem' }}>
              {services.map((service) => (
                <Button
                  key={service.id}
                  variant={selectedService === service.id ? 'primary' : 'outline-secondary'}
                  className="text-start d-flex align-items-center"
                  style={{
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    border: selectedService === service.id ? 'none' : '1px solid #dee2e6',
                    backgroundColor: selectedService === service.id ? '#0d6efd' : 'white',
                    color: selectedService === service.id ? 'white' : '#212529',
                    fontSize: '0.9375rem',
                    fontWeight: 400,
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  {service.icon}
                  {service.label}
                </Button>
              ))}
            </div>
          </Col>

          {/* Date Selection */}
          <Col md={4}>
            <label className="form-label text-muted small fw-medium mb-3">
              Preferred Date
            </label>
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
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  paddingLeft: '2.5rem',
                  height: '48px',
                  fontSize: '0.9375rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem'
                }}
              />
            </div>
          </Col>

          {/* Time Selection */}
          <Col md={4}>
            <label className="form-label text-muted small fw-medium mb-3">
              Preferred Time
            </label>
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
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={{
                  paddingLeft: '2.5rem',
                  height: '48px',
                  fontSize: '0.9375rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem'
                }}
              />
            </div>
          </Col>
        </Row>

        {/* Confirm Button */}
        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="primary"
            disabled={!canProceed()}
            onClick={handleConfirmBooking}
            className="d-flex align-items-center"
            style={{
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              fontSize: '0.9375rem',
              fontWeight: 500,
              borderRadius: '0.5rem',
              backgroundColor: canProceed() ? '#0dcaf0' : '#6c757d',
              border: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <FaCheck />
            Confirm Booking
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookingWizard;