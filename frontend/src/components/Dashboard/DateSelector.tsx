import React from 'react';
import { Form } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange
}) => {
  return (
    <div>
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
          onChange={(e) => onDateChange(e.target.value)}
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
    </div>
  );
};

export default DateSelector;
