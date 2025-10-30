import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaCar, FaMapMarkerAlt, FaEdit, FaCheck } from 'react-icons/fa';
import { type CalendarEvent } from './CalendarGrid';

interface AppointmentDetailsProps {
  event: CalendarEvent;
  onReschedule?: (eventId: string) => void;
  onConfirm?: (eventId: string) => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  event,
  onReschedule,
  onConfirm
}) => {
  return (
    <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: '16px' }}>
      <Card.Body className="p-4">
        <div className="mb-3">
          <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
            <FaCalendarAlt size={14} className="text-muted" />
            <span className="fw-semibold">Tue, Oct 22</span>
          </div>
          <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
            <FaClock size={14} className="text-muted" />
            <span className="text-muted">{event.time}-{event.endTime}</span>
          </div>
          <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
            <FaCar size={14} className="text-muted" />
            <span className="text-muted">{event.title} • Periodic Maintenance</span>
          </div>
          <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
            <FaMapMarkerAlt size={14} className="text-muted" />
            <span className="text-muted">Service Bay: Auto</span>
          </div>
        </div>

        <div className="d-flex" style={{ gap: '0.5rem' }}>
          <Button
            variant="outline-secondary"
            size="sm"
            className="flex-fill d-flex align-items-center justify-content-center"
            style={{ gap: '0.375rem', borderRadius: '8px' }}
            onClick={() => onReschedule && onReschedule(event.id)}
          >
            <FaEdit size={12} />
            Reschedule
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-fill d-flex align-items-center justify-content-center"
            style={{
              gap: '0.375rem',
              borderRadius: '8px',
              backgroundColor: '#38bdf8',
              border: 'none'
            }}
            onClick={() => onConfirm && onConfirm(event.id)}
          >
            <FaCheck size={12} />
            Confirm
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AppointmentDetails;
