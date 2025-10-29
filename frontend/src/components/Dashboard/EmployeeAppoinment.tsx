import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import EmpAppoinmentAll from './EmpAppoinmentAll.tsx';
import './EmployeeAppoinment.css';

const EmployeeAppoinment: React.FC = () => {
  return (
    <div className="employee-appointment">

      {/* Main Content */}
      <Container fluid className="appointment-content">
        {/* Appointments List Section */}
        <Row className="mb-4">
          <Col xs={12}>
            <EmpAppoinmentAll />
          </Col>
        </Row>
        
      </Container>
    </div>
  );
};

export default EmployeeAppoinment;
