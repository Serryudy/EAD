import React from 'react';
import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap';
import BookAppointmentForm from '../BookAppointment/BookAppointmentForm';
import AppointmentsListContainer from './AppointmentsListContainer';

const AppointmentsPage: React.FC = () => {
  const handleViewDetails = (appointmentId: string) => {
    console.log('View appointment details:', appointmentId);
    alert(`Viewing appointment: ${appointmentId}`);
    // Navigate to appointment details page or open modal
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Appointments Management</h2>
          <p className="text-muted">Book new appointments or view existing ones</p>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="view"
        id="appointments-tabs"
        className="mb-4"
        fill
      >
        <Tab eventKey="view" title="📋 View Appointments">
          <AppointmentsListContainer onViewDetails={handleViewDetails} />
        </Tab>
        
        <Tab eventKey="book" title="➕ Book New Appointment">
          <BookAppointmentForm 
            onSaveDraft={(data) => {
              console.log('Draft saved:', data);
              alert('Draft saved!');
            }}
            onContinue={(data) => {
              console.log('Appointment completed:', data);
            }}
          />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AppointmentsPage;
