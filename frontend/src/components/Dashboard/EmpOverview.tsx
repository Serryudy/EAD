import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import './EmpOverview.css';

interface OverviewCardProps {
  title: string;
  value: number;
  subtitle: string;
  variant: 'primary' | 'warning' | 'info' | 'success';
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, subtitle, variant }) => {
  return (
    <Card className={`overview-card overview-card-${variant}`}>
      <Card.Body>
        <div className="overview-card-title">{title}</div>
        <div className="overview-card-value">{value}</div>
        <div className="overview-card-subtitle">{subtitle}</div>
      </Card.Body>
    </Card>
  );
};

const EmpOverview: React.FC = () => {
  return (
    <div className="emp-overview">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="overview-title">Overview</h5>
        <div className="overview-filters">
          <Badge bg="light" text="dark" className="me-2 filter-badge">
            <i className="bi bi-calendar"></i> This Week
          </Badge>
          <Badge bg="light" text="dark" className="filter-badge">
            <i className="bi bi-calendar-month"></i> This Month
          </Badge>
        </div>
      </div>
      
      <Row className="g-3">
        <Col xs={12} sm={6} lg={3}>
          <OverviewCard
            title="Appointments"
            value={24}
            subtitle="+8% WoW"
            variant="primary"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <OverviewCard
            title="Pending"
            value={6}
            subtitle="Needs Action"
            variant="warning"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <OverviewCard
            title="In Service"
            value={3}
            subtitle="2 Bays"
            variant="info"
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <OverviewCard
            title="Completed"
            value={15}
            subtitle="96% On-time"
            variant="success"
          />
        </Col>
      </Row>
    </div>
  );
};

export default EmpOverview;
