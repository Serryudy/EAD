import React, { useState } from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import WorkLogItem from './WorkLogItem';
import TimeEntryForm from './TimeEntryForm';
import type { WorkLogEntry } from './WorkLogItem';
import type { TimeEntry } from './TimeEntryForm';

interface ServiceDetailProps {
  orderNumber: string;
  customerName: string;
  customerAvatar?: string;
  vehicleInfo: string;
  workLogs: WorkLogEntry[];
  onLogTime?: (timeEntry: TimeEntry) => void;
}

const ServiceDetailTimeLog: React.FC<ServiceDetailProps> = ({
  orderNumber,
  customerName,
  customerAvatar,
  vehicleInfo,
  workLogs,
  onLogTime
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedTask, setSelectedTask] = useState('');

  const statusSteps = ['Received', 'Diagnostics', 'Repair', 'Quality Check', 'Ready for Pickup'];
  const [currentStatus] = useState(1); // Currently at Diagnostics

  const handleLogTime = () => {
    if (onLogTime && startTime && endTime && selectedTask) {
      onLogTime({
        startTime,
        endTime,
        task: selectedTask
      });
      // Reset form
      setStartTime('');
      setEndTime('');
      setSelectedTask('');
    }
  };

  return (
    <Card 
      className="shadow-sm border"
      style={{
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      <Card.Body className="p-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h5 className="mb-1 fw-semibold" style={{ fontSize: '1.125rem' }}>
              Service Detail & Time Logging
            </h5>
          </div>
          <Badge 
            bg="light" 
            text="muted"
            style={{ 
              fontSize: '0.8125rem',
              fontWeight: 500,
              padding: '0.375rem 0.75rem'
            }}
          >
            {orderNumber}
          </Badge>
        </div>

        {/* Customer Info & Status */}
        <Row className="mb-4">
          <Col md={6}>
            <label className="form-label text-muted small fw-medium mb-2">
              Customer
            </label>
            <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
              <div
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-semibold"
                style={{
                  width: '40px',
                  height: '40px',
                  fontSize: '0.875rem'
                }}
              >
                {customerAvatar || customerName.charAt(0)}
              </div>
              <div>
                <p className="mb-0 fw-medium" style={{ fontSize: '0.9375rem' }}>
                  {customerName}
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: '0.8125rem' }}>
                  {vehicleInfo}
                </p>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <label className="form-label text-muted small fw-medium mb-2">
              Status
            </label>
            <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
              {statusSteps.map((step, index) => (
                <Badge
                  key={step}
                  bg={index <= currentStatus ? 'light' : 'light'}
                  text={index <= currentStatus ? 'dark' : 'muted'}
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    padding: '0.375rem 0.75rem',
                    border: index <= currentStatus ? '1px solid #dee2e6' : '1px solid #e9ecef'
                  }}
                >
                  {step}
                </Badge>
              ))}
            </div>
          </Col>
        </Row>

        {/* Work Log & Add Time Entry */}
        <Row>
          <Col md={6}>
            <label className="form-label text-muted small fw-medium mb-3">
              Work Log
            </label>
            <div className="d-flex flex-column" style={{ gap: '0.75rem' }}>
              {workLogs.map((log) => (
                <WorkLogItem key={log.id} log={log} />
              ))}
            </div>
          </Col>

          <Col md={6}>
            <TimeEntryForm
              startTime={startTime}
              endTime={endTime}
              selectedTask={selectedTask}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              onTaskChange={setSelectedTask}
              onSubmit={handleLogTime}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ServiceDetailTimeLog;
