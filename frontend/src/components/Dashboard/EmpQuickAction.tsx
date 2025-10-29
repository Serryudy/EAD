import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { BsCalendar3 } from 'react-icons/bs';
import './EmpQuickAction.css';

const EmpQuickAction: React.FC = () => {
  return (
    <Card className="quick-action-card">
      <Card.Body>
        <h5 className="quick-action-title">Quick Actions</h5>
        <div className="quick-action-buttons">
          <Button variant="primary" className="quick-action-btn mb-2">
            <BsCalendar3 className="me-2" />
            Book Slot
          </Button>
          <Button variant="outline-primary" className="quick-action-btn mb-2">
            <FiCalendar className="me-2" />
            My Calendar
          </Button>
          <Button variant="outline-secondary" className="quick-action-btn">
            <FiUser className="me-2" />
            Customers
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EmpQuickAction;
