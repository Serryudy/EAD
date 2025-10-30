import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaArrowLeft, FaPlus } from 'react-icons/fa';

interface CalendarHeaderProps {
  onBack?: () => void;
  onNewAppointment?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  onBack,
  onNewAppointment
}) => {
  return (
    <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
      <Card.Body className="py-3 px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
            <FaCalendarAlt size={20} />
            <h4 className="mb-0 fw-semibold">My Calendar</h4>
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
            <Button
              variant="primary"
              onClick={onNewAppointment}
              className="d-flex align-items-center"
              style={{
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#38bdf8',
                border: 'none'
              }}
            >
              <FaPlus size={14} />
              New Appointment
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CalendarHeader;
