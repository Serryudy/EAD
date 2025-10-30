import React from 'react';
import { Badge } from 'react-bootstrap';

export interface WorkLogEntry {
  id: string;
  technician: string;
  duration: string;
  task: string;
  timeRange: string;
}

interface WorkLogItemProps {
  log: WorkLogEntry;
}

const WorkLogItem: React.FC<WorkLogItemProps> = ({ log }) => {
  return (
    <div
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
  );
};

export default WorkLogItem;
