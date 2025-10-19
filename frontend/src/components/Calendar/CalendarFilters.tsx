import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaWrench, FaClock, FaCheckCircle } from 'react-icons/fa';

interface CalendarFiltersProps {
  monthYear: string;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({ monthYear }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h5 className="mb-0 text-muted fw-medium" style={{ fontSize: '1rem' }}>
        {monthYear}
      </h5>
      <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
        <Badge
          bg="light"
          text="dark"
          className="d-flex align-items-center"
          style={{
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            fontWeight: 'normal'
          }}
        >
          <FaWrench size={12} />
          Service
        </Badge>
        <Badge
          bg="light"
          text="dark"
          className="d-flex align-items-center"
          style={{
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            fontWeight: 'normal'
          }}
        >
          <FaClock size={12} />
          Pending
        </Badge>
        <Badge
          bg="light"
          text="dark"
          className="d-flex align-items-center"
          style={{
            gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            fontWeight: 'normal'
          }}
        >
          <FaCheckCircle size={12} />
          Confirmed
        </Badge>
      </div>
    </div>
  );
};

export default CalendarFilters;
