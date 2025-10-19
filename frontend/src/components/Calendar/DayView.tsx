import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';

interface TimeSlot {
  time: string;
  status: 'booked' | 'in-service' | 'available';
}

interface DayViewProps {
  selectedDate: string;
  slots: TimeSlot[];
}

const DayView: React.FC<DayViewProps> = ({ selectedDate, slots }) => {
  return (
    <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
      <Card.Body className="p-4">
        <h6 className="mb-3 fw-semibold">Day View</h6>
        <div className="mb-3">
          <div className="d-flex align-items-center text-muted small" style={{ gap: '0.5rem' }}>
            <FaCalendarAlt size={12} />
            <span>{selectedDate} Oct 2025 • 8 AM - 6 PM</span>
          </div>
        </div>

        <div className="d-flex flex-column" style={{ gap: '0.75rem' }}>
          {slots.map((slot, index) => (
            <div
              key={index}
              className="d-flex justify-content-between align-items-center p-2 rounded"
              style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb'
              }}
            >
              <span className="fw-medium">{slot.time}</span>
              <Badge
                bg={
                  slot.status === 'booked'
                    ? 'danger'
                    : slot.status === 'in-service'
                    ? 'warning'
                    : 'success'
                }
                style={{
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem',
                  fontWeight: 'normal'
                }}
              >
                {slot.status === 'booked'
                  ? 'Booked'
                  : slot.status === 'in-service'
                  ? 'In Service'
                  : 'Available'}
              </Badge>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default DayView;
