import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import EmpOverview from './EmpOverview';
import EmpSchedule from './EmpSchedule';
import EmpQuickAction from './EmpQuickAction';
import EmpRecentActivity from './EmpRecentActivity';
import './EmployeeDashboard.css';

const EmployeeDashboard: React.FC = () => {
  return (
    <div className="employee-dashboard">
      {/* Main Content */}
      <Container fluid className="dashboard-content">
        {/* Overview Section */}
        <Row>
          <Col xs={12}>
            <EmpOverview />
          </Col>
        </Row>

        {/* Schedule and Sidebar Section */}
        <Row className="g-4">
          {/* Left Column - Today's Schedule */}
          <Col xs={12} lg={8}>
            <EmpSchedule />
          </Col>

          {/* Right Column - Quick Actions and Recent Activity */}
          <Col xs={12} lg={4}>
            <div className="sidebar-section">
              <EmpQuickAction />
              <div className="mt-4">
                <EmpRecentActivity />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EmployeeDashboard;
