import React, { useState } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';
import StepIndicator from './StepIndicator';
import ServiceSelector, { type Service } from './ServiceSelector';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';

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

  const services: Service[] = [
    { id: 'oil-change', label: 'Oil Change' },
    { id: 'tire-rotation', label: 'Tire Rotation' },
    { id: 'brake-inspection', label: 'Brake Inspection' },
    { id: 'battery-check', label: 'Battery Check' },
    { id: 'full-service', label: 'Full Service' }
  ];

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

  const steps = [
    { step: 1, label: 'Service' },
    { step: 2, label: 'Date' },
    { step: 3, label: 'Time' }
  ];

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
          {steps.map(({ step, label }) => (
            <StepIndicator
              key={step}
              step={step}
              label={label}
              currentStep={currentStep}
              isComplete={isStepComplete(step)}
              onClick={setCurrentStep}
            />
          ))}
        </div>

        {/* Content Area */}
        <Row className="g-4">
          {/* Service Selection */}
          <Col md={4}>
            <ServiceSelector
              services={services}
              selectedService={selectedService}
              onServiceSelect={setSelectedService}
            />
          </Col>

          {/* Date Selection */}
          <Col md={4}>
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </Col>

          {/* Time Selection */}
          <Col md={4}>
            <TimeSelector
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
            />
          </Col>
        </Row>

        {/* Confirm Button */}
        <div className="d-flex justify-content-end mt-4">
          <Button
            variant="success"
            disabled={!canProceed()}
            onClick={handleConfirmBooking}
            className="d-flex align-items-center"
            style={{
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9375rem',
              fontWeight: 500
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
