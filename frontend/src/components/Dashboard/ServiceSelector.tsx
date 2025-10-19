import React from 'react';
import { Button } from 'react-bootstrap';
import { FaWrench } from 'react-icons/fa';

export interface Service {
  id: string;
  label: string;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedService: string;
  onServiceSelect: (serviceId: string) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedService,
  onServiceSelect
}) => {
  return (
    <div>
      <label className="form-label text-muted small fw-medium mb-3">
        Select Service
      </label>
      <div className="d-flex flex-column" style={{ gap: '0.5rem' }}>
        {services.map((service) => (
          <Button
            key={service.id}
            variant={selectedService === service.id ? 'primary' : 'outline-secondary'}
            className="text-start d-flex align-items-center"
            style={{
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              border: selectedService === service.id ? 'none' : '1px solid #dee2e6',
              backgroundColor: selectedService === service.id ? '#0d6efd' : 'white',
              color: selectedService === service.id ? 'white' : '#212529',
              fontSize: '0.9375rem',
              fontWeight: 400,
              transition: 'all 0.2s ease'
            }}
            onClick={() => onServiceSelect(service.id)}
          >
            <FaWrench />
            {service.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ServiceSelector;
