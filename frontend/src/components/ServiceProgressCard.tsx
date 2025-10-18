import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';

interface ServiceStep {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'queued';
  statusText: string;
  time: string;
  color: 'success' | 'primary' | 'secondary';
}

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
  const getStatusDotColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      success: '#28a745',
      primary: '#9b59b6',
      secondary: '#6c757d'
    };
    return colorMap[color] || '#6c757d';
  };

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
            <div 
              key={step.id}
              className="d-flex align-items-start"
              style={{ gap: '0.75rem' }}
            >
              {/* Status Dot */}
              <div
                className="rounded-circle flex-shrink-0"
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: getStatusDotColor(step.color),
                  marginTop: '6px'
                }}
              />

              {/* Step Content */}
              <div className="flex-grow-1 d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-0 fw-medium" style={{ fontSize: '0.9375rem' }}>
                    {step.title}
                  </p>
                  <p 
                    className="mb-0 text-muted" 
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {step.statusText}
                  </p>
                </div>
                
                {/* Time */}
                <span 
                  className="text-muted flex-shrink-0" 
                  style={{ 
                    fontSize: '0.8125rem',
                    marginLeft: '1rem'
                  }}
                >
                  {step.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ServiceProgressCard;