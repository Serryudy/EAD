import React from 'react';
import StatusDot from './StatusDot';

export interface ServiceStep {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'queued';
  statusText: string;
  time: string;
  color: 'success' | 'primary' | 'secondary';
}

interface ServiceStepItemProps {
  step: ServiceStep;
}

const ServiceStepItem: React.FC<ServiceStepItemProps> = ({ step }) => {
  return (
    <div 
      className="d-flex align-items-start"
      style={{ gap: '0.75rem' }}
    >
      <StatusDot color={step.color} />
      
      {/* Step Details */}
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h6 className="mb-0 fw-medium" style={{ fontSize: '0.9375rem' }}>
            {step.title}
          </h6>
          <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
            {step.time}
          </span>
        </div>
        <p className="text-muted mb-0" style={{ fontSize: '0.8125rem' }}>
          {step.statusText}
        </p>
      </div>
    </div>
  );
};

export default ServiceStepItem;
