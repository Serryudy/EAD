import React from 'react';
import { Card, Badge, ListGroup } from 'react-bootstrap';
import { FiClock } from 'react-icons/fi';
import './EmpSchedule.css';

interface ScheduleItem {
  id: string;
  time: string;
  service: string;
  vehicle: string;
  status: 'confirmed' | 'pending' | 'in-service';
}

const scheduleData: ScheduleItem[] = [
  {
    id: '1',
    time: '09:00-11:00',
    service: 'Toyota Corolla',
    vehicle: 'Toyota Corolla',
    status: 'confirmed'
  },
  {
    id: '2',
    time: '11:30-12:30',
    service: 'Brake Check',
    vehicle: 'Brake Check',
    status: 'pending'
  },
  {
    id: '3',
    time: '14:00-15:30',
    service: 'Oil Change',
    vehicle: 'Oil Change',
    status: 'in-service'
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge bg="primary" className="status-badge">Confirmed</Badge>;
    case 'pending':
      return <Badge bg="warning" className="status-badge">Pending</Badge>;
    case 'in-service':
      return <Badge bg="info" className="status-badge">In Service</Badge>;
    default:
      return null;
  }
};

const EmpSchedule: React.FC = () => {
  return (
    <Card className="schedule-card">
      <Card.Body>
        <h5 className="schedule-title">Today's Schedule</h5>
        <ListGroup variant="flush">
          {scheduleData.map((item) => (
            <ListGroup.Item key={item.id} className="schedule-item">
              <div className="schedule-item-content">
                <div className="schedule-time">
                  <FiClock className="me-2" />
                  <span>{item.time}</span>
                </div>
                <div className="schedule-details">
                  <span className="schedule-service">• {item.service}</span>
                </div>
              </div>
              <div className="schedule-status">
                {getStatusBadge(item.status)}
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default EmpSchedule;
