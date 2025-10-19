import React from 'react';
import { Card, Badge, Row, Col, ProgressBar } from 'react-bootstrap';
import { FaUser, FaCar, FaClock, FaCheckCircle } from 'react-icons/fa';
import WorkLogItem from './WorkLogItem';
import type { WorkLogEntry } from './WorkLogItem';

interface ServiceDetailViewProps {
  orderNumber: string;
  customerName: string;
  customerAvatar?: string;
  vehicleInfo: string;
  workLogs: WorkLogEntry[];
  currentStatus?: number;
  estimatedCompletion?: string;
  totalHours?: string;
}

const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  orderNumber,
  customerName,
  vehicleInfo,
  workLogs,
  currentStatus = 1,
  estimatedCompletion = '3:00 PM',
  totalHours = '3.5h'
}) => {
  const statusSteps = ['Received', 'Diagnostics', 'Repair', 'Quality Check', 'Ready for Pickup'];
  const progressPercentage = ((currentStatus + 1) / statusSteps.length) * 100;

  return (
    <Card
      className="shadow-sm border-0"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
      }}
    >
      <Card.Body className="p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h5 className="mb-1 fw-semibold">Service Details</h5>
            <p className="text-muted small mb-0">Order #{orderNumber}</p>
          </div>
          <Badge
            bg="primary"
            style={{
              fontSize: '0.85rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#38bdf8'
            }}
          >
            {statusSteps[currentStatus]}
          </Badge>
        </div>

        {/* Customer & Vehicle Info */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="border" style={{ borderRadius: '12px', borderColor: '#e5e7eb' }}>
              <Card.Body className="p-3">
                <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
                  <div
                    className="d-flex align-items-center justify-content-center fw-semibold"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#f0f9ff',
                      color: '#38bdf8',
                      fontSize: '1.1rem'
                    }}
                  >
                    <FaUser size={20} />
                  </div>
                  <div>
                    <div className="text-muted small mb-1">Customer</div>
                    <div className="fw-semibold">{customerName}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="border" style={{ borderRadius: '12px', borderColor: '#e5e7eb' }}>
              <Card.Body className="p-3">
                <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#f0fdf4',
                      color: '#22c55e',
                      fontSize: '1.1rem'
                    }}
                  >
                    <FaCar size={20} />
                  </div>
                  <div>
                    <div className="text-muted small mb-1">Vehicle</div>
                    <div className="fw-semibold">{vehicleInfo}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Service Progress */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small fw-medium">Service Progress</span>
            <span className="small text-muted">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <ProgressBar
            now={progressPercentage}
            style={{ height: '8px', borderRadius: '4px' }}
            variant="primary"
          />
          <div className="d-flex justify-content-between mt-2">
            {statusSteps.map((step, index) => (
              <div
                key={index}
                className="d-flex align-items-center"
                style={{ gap: '0.25rem' }}
              >
                {index <= currentStatus ? (
                  <FaCheckCircle size={12} className="text-success" />
                ) : (
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: '2px solid #d1d5db'
                    }}
                  />
                )}
                <span
                  className="small"
                  style={{
                    color: index <= currentStatus ? '#22c55e' : '#9ca3af',
                    fontWeight: index === currentStatus ? '600' : '400',
                    fontSize: '0.7rem'
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <Row className="mb-4">
          <Col>
            <div className="text-center p-3" style={{ backgroundColor: '#f0f9ff', borderRadius: '12px' }}>
              <FaClock size={20} className="text-primary mb-2" style={{ color: '#38bdf8' }} />
              <div className="small text-muted mb-1">Total Hours</div>
              <div className="fw-semibold">{totalHours}</div>
            </div>
          </Col>
          <Col>
            <div className="text-center p-3" style={{ backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
              <FaCheckCircle size={20} className="text-success mb-2" />
              <div className="small text-muted mb-1">Est. Completion</div>
              <div className="fw-semibold">{estimatedCompletion}</div>
            </div>
          </Col>
        </Row>

        {/* Work Logs */}
        <div>
          <h6 className="mb-3 fw-semibold">Work Log History</h6>
          {workLogs.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <FaClock size={32} className="mb-2 opacity-50" />
              <p className="small mb-0">No work logs recorded yet</p>
            </div>
          ) : (
            <div className="d-flex flex-column" style={{ gap: '0.75rem' }}>
              {workLogs.map((log) => (
                <WorkLogItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ServiceDetailView;
