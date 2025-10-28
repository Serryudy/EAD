import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { FiCheckCircle, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import './EmpRecentActivity.css';

interface ActivityItem {
  id: string;
  type: 'completed' | 'warning' | 'booking';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

const activityData: ActivityItem[] = [
  {
    id: '1',
    type: 'completed',
    title: 'Order #A-1423 completed',
    description: 'Honda Civic',
    time: 'Today',
    icon: <FiCheckCircle />
  },
  {
    id: '2',
    type: 'warning',
    title: 'Brake parts low in stock',
    description: '',
    time: '1h ago',
    icon: <FiAlertTriangle />
  },
  {
    id: '3',
    type: 'booking',
    title: 'New booking requested',
    description: 'Ford Focus',
    time: '2h ago',
    icon: <FiCalendar />
  }
];

const getIconClass = (type: string) => {
  switch (type) {
    case 'completed':
      return 'activity-icon-completed';
    case 'warning':
      return 'activity-icon-warning';
    case 'booking':
      return 'activity-icon-booking';
    default:
      return '';
  }
};

const EmpRecentActivity: React.FC = () => {
  return (
    <Card className="recent-activity-card">
      <Card.Body>
        <h5 className="recent-activity-title">Recent Activity</h5>
        <ListGroup variant="flush">
          {activityData.map((item) => (
            <ListGroup.Item key={item.id} className="activity-item">
              <div className={`activity-icon ${getIconClass(item.type)}`}>
                {item.icon}
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  <span className="activity-title">{item.title}</span>
                  {item.description && (
                    <>
                      <span className="activity-separator">•</span>
                      <span className="activity-description">{item.description}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge bg="light" text="muted" className="activity-time">
                {item.time}
              </Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default EmpRecentActivity;
