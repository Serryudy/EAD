import React, { useState } from 'react';
import { Card, Badge, Button, Form, Row, Col } from 'react-bootstrap';
import { 
  FaClock, 
  FaWrench,
  FaCalendar
} from 'react-icons/fa';

interface WorkLogEntry {
  id: string;
  technician: string;
  duration: string;
  task: string;
  timeRange: string;
}

interface ServiceDetailProps {
  orderNumber: string;
  customerName: string;
  customerAvatar?: string;
  vehicleInfo: string;
  workLogs: WorkLogEntry[];
  onLogTime?: (timeEntry: TimeEntry) => void;
}

interface TimeEntry {
  startTime: string;
  endTime: string;
  task: string;
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
                <div
                  key={log.id}
                  className="p-3 rounded bg-light border"
                  style={{ borderRadius: '8px' }}
                >
                  <div className="d-flex align-items-start" style={{ gap: '0.75rem' }}>
                    <Badge
                      bg="white"
                      text="primary"
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        padding: '0.25rem 0.5rem',
                        border: '1px solid #cfe2ff'
                      }}
                    >
                      {log.technician}
                    </Badge>
                    <div className="flex-grow-1">
                      <p className="mb-1 fw-medium" style={{ fontSize: '0.9375rem' }}>
                        {log.duration} {log.task}
                      </p>
                      <p className="mb-0 text-muted" style={{ fontSize: '0.8125rem' }}>
                        {log.timeRange}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Col>

          <Col md={6}>
            <label className="form-label text-muted small fw-medium mb-3">
              Add Time Entry
            </label>
            
            {/* Time Inputs */}
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group>
                  <div className="position-relative">
                    <FaClock
                      className="position-absolute text-muted"
                      style={{
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '14px'
                      }}
                    />
                    <Form.Control
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={{
                        paddingLeft: '36px',
                        fontSize: '0.875rem',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                  <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Start • {startTime || '--:--'}
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={6}>
                <Form.Group>
                  <div className="position-relative">
                    <FaClock
                      className="position-absolute text-muted"
                      style={{
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '14px'
                      }}
                    />
                    <Form.Control
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{
                        paddingLeft: '36px',
                        fontSize: '0.875rem',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                  <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                    End • {endTime || '--:--'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Task Selection */}
            <Form.Group className="mb-3">
              <div className="position-relative">
                <FaWrench
                  className="position-absolute text-muted"
                  style={{
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '14px'
                  }}
                />
                <Form.Select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  style={{
                    paddingLeft: '36px',
                    fontSize: '0.875rem',
                    borderRadius: '8px'
                  }}
                >
                  <option value="">Select Task</option>
                  <option value="Repair">Task • Repair</option>
                  <option value="Diagnostics">Task • Diagnostics</option>
                  <option value="Quality Check">Task • Quality Check</option>
                  <option value="Maintenance">Task • Maintenance</option>
                </Form.Select>
              </div>
            </Form.Group>

            {/* Log Time Button */}
            <Button
              onClick={handleLogTime}
              variant="info"
              className="w-100 d-flex align-items-center justify-content-center"
              style={{
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#0dcaf0',
                border: 'none'
              }}
              disabled={!startTime || !endTime || !selectedTask}
            >
              <FaCalendar size={16} />
              Log Time
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ServiceDetailTimeLog;