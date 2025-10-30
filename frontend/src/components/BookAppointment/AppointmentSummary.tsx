import React from 'react';
import { Card } from 'react-bootstrap';
import { FaUser, FaCar, FaWrench, FaCalendarAlt, FaMapMarkerAlt, FaHourglass, FaPhone } from 'react-icons/fa';

interface AppointmentSummaryProps {
  employee: string;
  vehicleSummary: string;
  serviceType: string;
  estimatedDuration: string;
  serviceBayAllocation: string;
  customerName: string;
  customerPhone: string;
}

const AppointmentSummary: React.FC<AppointmentSummaryProps> = ({
  employee,
  vehicleSummary,
  serviceType,
  estimatedDuration,
  serviceBayAllocation,
  customerName,
  customerPhone
}) => {
  return (
    <Card 
      className="shadow-sm border-0"
      style={{ 
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #d1fae5 0%, #dbeafe 100%)'
      }}
    >
      <Card.Body className="p-4">
        <h5 className="mb-4 fw-semibold" style={{ fontSize: '1.25rem' }}>
          Summary
        </h5>

        <div className="d-flex flex-column" style={{ gap: '1rem' }}>
          {/* Employee */}
          <div 
            className="p-3 rounded"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-1">
              <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                <FaUser size={14} className="text-muted" />
                <span className="small fw-medium">Employee: {employee}</span>
              </div>
              <span 
                className="badge" 
                style={{ 
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem'
                }}
              >
                Authenticated
              </span>
            </div>
          </div>

          {/* Vehicle */}
          <div 
            className="p-3 rounded"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
              <FaCar size={14} className="text-muted" />
              <span className="small fw-medium">{vehicleSummary}</span>
            </div>
          </div>

          {/* Service */}
          <div 
            className="p-3 rounded"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
              <FaWrench size={14} className="text-muted" />
              <span className="small fw-medium">{serviceType}</span>
            </div>
          </div>

          {/* Date & Time */}
          <div 
            className="p-3 rounded"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
              <FaCalendarAlt size={14} className="text-muted" />
              <span className="small fw-medium">
                Tue, Oct 22 • 9-11 AM
              </span>
            </div>
          </div>

          {/* Service Bay Allocation */}
          <div 
            className="p-3 rounded"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
              <FaMapMarkerAlt size={14} className="text-muted" />
              <span className="small fw-medium">
                Service Bay Allocation: {serviceBayAllocation}
              </span>
            </div>
          </div>

          {/* Estimated Duration Section */}
          <div className="mt-3">
            <p className="text-muted small fw-medium mb-2">Estimated Duration</p>
            <div 
              className="p-3 rounded"
              style={{ 
                backgroundColor: 'rgba(219, 234, 254, 0.6)',
                border: '1px solid rgba(219, 234, 254, 0.5)'
              }}
            >
              <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                <FaHourglass size={14} className="text-muted" />
                <span className="small fw-medium">{estimatedDuration}</span>
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="mt-3">
            <p className="text-muted small fw-medium mb-2">Customer</p>
            <div 
              className="p-3 rounded"
              style={{ 
                backgroundColor: 'rgba(219, 234, 254, 0.6)',
                border: '1px solid rgba(219, 234, 254, 0.5)'
              }}
            >
              <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                <FaPhone size={14} className="text-muted" />
                <span className="small fw-medium">
                  {customerName} • {customerPhone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AppointmentSummary;
