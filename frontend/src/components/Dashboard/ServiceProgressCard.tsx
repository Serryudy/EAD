import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import ServiceStepItem, { type ServiceStep } from './ServiceStepItem';

interface ServiceProgressCardProps {
  orderNumber: string;
  vehicleInfo: string;
  completionPercentage: number;
  steps: ServiceStep[];
}

const ServiceProgressCard: React.FC<ServiceProgressCardProps> = ({
  orderNumber,
  vehicleInfo,
  completionPercentage,
  steps
}) => {
  return (
    <Card 
      className="shadow-sm border"
      style={{
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <Card.Body className="p-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1 fw-semibold" style={{ fontSize: '1.125rem' }}>
              Service Progress
            </h5>
            <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
              Order #{orderNumber} • {vehicleInfo}
            </p>
          </div>
          <div className="text-end">
            <span 
              className="fw-medium" 
              style={{ 
                color: '#60a5fa',
                fontSize: '0.875rem'
              }}
            >
              {completionPercentage}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar 
          now={completionPercentage} 
          className="mb-4"
          style={{ 
            height: '8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px'
          }}
        >
          <ProgressBar 
            now={completionPercentage}
            style={{
              backgroundColor: '#28a745',
              borderRadius: '4px'
            }}
          />
        </ProgressBar>

        {/* Service Steps */}
        <div className="d-flex flex-column" style={{ gap: '1rem' }}>
          {steps.map((step) => (
            <ServiceStepItem key={step.id} step={step} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ServiceProgressCard;
