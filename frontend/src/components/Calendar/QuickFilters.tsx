import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaClock, FaWrench } from 'react-icons/fa';

interface QuickFiltersProps {
  activeFilters: string[];
  onToggleFilter: (filter: string) => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({
  activeFilters,
  onToggleFilter
}) => {
  return (
    <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: '16px' }}>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-semibold">Quick Filters</h6>
        </div>
        <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
          <Badge
            bg={activeFilters.includes('confirmed') ? 'success' : 'light'}
            text={activeFilters.includes('confirmed') ? 'white' : 'dark'}
            className="d-flex align-items-center"
            style={{
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              fontWeight: 'normal'
            }}
            onClick={() => onToggleFilter('confirmed')}
          >
            <FaCheckCircle size={12} />
            Confirmed
          </Badge>
          <Badge
            bg={activeFilters.includes('pending') ? 'warning' : 'light'}
            text={activeFilters.includes('pending') ? 'white' : 'dark'}
            className="d-flex align-items-center"
            style={{
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              fontWeight: 'normal'
            }}
            onClick={() => onToggleFilter('pending')}
          >
            <FaClock size={12} />
            Pending
          </Badge>
          <Badge
            bg={activeFilters.includes('service') ? 'primary' : 'light'}
            text={activeFilters.includes('service') ? 'white' : 'dark'}
            className="d-flex align-items-center"
            style={{
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              border: '1px solid #e5e7eb',
              cursor: 'pointer',
              fontWeight: 'normal'
            }}
            onClick={() => onToggleFilter('service')}
          >
            <FaWrench size={12} />
            Service
          </Badge>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuickFilters;
