import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaClock, FaWrench, FaCalendar } from 'react-icons/fa';

export interface TimeEntry {
  startTime: string;
  endTime: string;
  task: string;
}

interface TimeEntryFormProps {
  startTime: string;
  endTime: string;
  selectedTask: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onTaskChange: (task: string) => void;
  onSubmit: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({
  startTime,
  endTime,
  selectedTask,
  onStartTimeChange,
  onEndTimeChange,
  onTaskChange,
  onSubmit
}) => {
  const isFormValid = startTime && endTime && selectedTask;

  return (
    <div>
      <label className="form-label text-muted small fw-medium mb-3">
        Add Time Entry
      </label>
      
      {/* Time Inputs */}
      <div className="row mb-3">
        <div className="col-6">
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
                onChange={(e) => onStartTimeChange(e.target.value)}
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
        </div>

        <div className="col-6">
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
                onChange={(e) => onEndTimeChange(e.target.value)}
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
        </div>
      </div>

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
            onChange={(e) => onTaskChange(e.target.value)}
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
        onClick={onSubmit}
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
        disabled={!isFormValid}
      >
        <FaCalendar size={16} />
        Log Time
      </Button>
    </div>
  );
};

export default TimeEntryForm;
