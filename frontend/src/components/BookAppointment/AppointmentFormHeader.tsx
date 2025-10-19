import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';

interface AppointmentFormHeaderProps {
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
}

const AppointmentFormHeader: React.FC<AppointmentFormHeaderProps> = ({
  onBack,
  currentStep,
  totalSteps
}) => {
  return (
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
  );
};

export default AppointmentFormHeader;
