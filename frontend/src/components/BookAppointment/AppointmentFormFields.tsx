import React from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { FaCar, FaWrench, FaCalendarAlt, FaClock, FaStickyNote, FaSave, FaArrowRight } from 'react-icons/fa';

interface AppointmentFormData {
  vehicle: string;
  serviceType: string;
  preferredDate: string;
  timeWindow: string;
  additionalNotes: string;
}

interface AppointmentFormFieldsProps {
  formData: AppointmentFormData;
  onVehicleChange: (value: string) => void;
  onServiceTypeChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeWindowChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const AppointmentFormFields: React.FC<AppointmentFormFieldsProps> = ({
  formData,
  onVehicleChange,
  onServiceTypeChange,
  onDateChange,
  onTimeWindowChange,
  onNotesChange,
  onSaveDraft,
  onContinue
}) => {
  return (
    <Card 
      className="shadow-sm border-0"
      style={{ 
        borderRadius: '16px',
        background: 'linear-gradient(to bottom, #f3f4f6, #ffffff)'
      }}
    >
      <Card.Body className="p-4">
        <h5 className="mb-4 fw-semibold" style={{ fontSize: '1.25rem' }}>
          Select Vehicle & Service
        </h5>

        <Row className="g-4">
          {/* Vehicle */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted small fw-medium mb-2">
                Vehicle
              </Form.Label>
              <div className="position-relative">
                <FaCar
                  className="position-absolute text-muted"
                  style={{
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                />
                <Form.Control
                  type="text"
                  value={formData.vehicle}
                  onChange={(e) => onVehicleChange(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    height: '48px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white'
                  }}
                />
              </div>
            </Form.Group>
          </Col>

          {/* Service Type */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted small fw-medium mb-2">
                Service Type
              </Form.Label>
              <div className="position-relative">
                <FaWrench
                  className="position-absolute text-muted"
                  style={{
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                />
                <Form.Select
                  value={formData.serviceType}
                  onChange={(e) => onServiceTypeChange(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    height: '48px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="Periodic Maintenance">Periodic Maintenance</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tire Rotation">Tire Rotation</option>
                  <option value="Brake Inspection">Brake Inspection</option>
                  <option value="Full Service">Full Service</option>
                </Form.Select>
              </div>
            </Form.Group>
          </Col>

          {/* Preferred Date */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted small fw-medium mb-2">
                Preferred Date
              </Form.Label>
              <div className="position-relative">
                <FaCalendarAlt
                  className="position-absolute text-muted"
                  style={{
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                />
                <Form.Control
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    height: '48px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white'
                  }}
                />
              </div>
            </Form.Group>
          </Col>

          {/* Time Window */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-muted small fw-medium mb-2">
                Time Window
              </Form.Label>
              <div className="position-relative">
                <FaClock
                  className="position-absolute text-muted"
                  style={{
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none'
                  }}
                />
                <Form.Control
                  type="text"
                  value={formData.timeWindow}
                  onChange={(e) => onTimeWindowChange(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    height: '48px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white'
                  }}
                />
              </div>
            </Form.Group>
          </Col>

          {/* Additional Notes */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="text-muted small fw-medium mb-2">
                Additional Notes
              </Form.Label>
              <div className="position-relative">
                <FaStickyNote
                  className="position-absolute text-muted"
                  style={{
                    left: '1rem',
                    top: '1rem',
                    pointerEvents: 'none'
                  }}
                />
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Describe any issues or requests..."
                  style={{
                    paddingLeft: '2.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    resize: 'none'
                  }}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end mt-4" style={{ gap: '1rem' }}>
          <Button
            variant="outline-secondary"
            onClick={onSaveDraft}
            className="d-flex align-items-center"
            style={{
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}
          >
            <FaSave size={16} />
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={onContinue}
            className="d-flex align-items-center"
            style={{
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: '#38bdf8',
              border: 'none'
            }}
          >
            Continue
            <FaArrowRight size={16} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AppointmentFormFields;
