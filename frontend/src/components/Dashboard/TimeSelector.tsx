import React from 'react';
import { Button } from 'react-bootstrap';
import { FaClock } from 'react-icons/fa';

interface TimeSelectorProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTime,
  onTimeChange
}) => {
  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM'
  ];

  return (
    <div>
      <label className="form-label text-muted small fw-medium mb-3">
        Available Times
      </label>
      <div className="d-flex flex-column" style={{ gap: '0.5rem' }}>
        {timeSlots.map((time) => (
          <Button
            key={time}
            variant={selectedTime === time ? 'primary' : 'outline-secondary'}
            className="text-start d-flex align-items-center"
            style={{
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              border: selectedTime === time ? 'none' : '1px solid #dee2e6',
              backgroundColor: selectedTime === time ? '#0d6efd' : 'white',
              color: selectedTime === time ? 'white' : '#212529',
              fontSize: '0.9375rem',
              fontWeight: 400,
              transition: 'all 0.2s ease'
            }}
            onClick={() => onTimeChange(time)}
          >
            <FaClock />
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TimeSelector;
