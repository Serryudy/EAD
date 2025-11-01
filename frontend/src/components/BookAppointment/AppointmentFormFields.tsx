import React from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  type?: string;
  make?: string;
  model?: string;
  year?: number;
}

interface AppointmentFormFieldsProps {
  formData: {
    vehicleNo: string;
    vehicleType: string;
    serviceType: string;
    preferredDate: string;
    timeWindow: string;
    additionalNotes: string;
  };
  vehicles?: Vehicle[];
  selectedVehicleId?: string;
  onVehicleChange?: (vehicleId: string) => void;
  onVehicleNoChange: (value: string) => void;
  onVehicleTypeChange: (value: string) => void;
  onServiceTypeChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeWindowChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSaveDraft: () => void;
  onContinue: () => void;
  isLoadingVehicles?: boolean;
}

const AppointmentFormFields: React.FC<AppointmentFormFieldsProps> = ({
  formData,
  vehicles = [],
  selectedVehicleId = '',
  onVehicleChange,
  onVehicleNoChange,
  onVehicleTypeChange,
  onServiceTypeChange,
  onDateChange,
  onTimeWindowChange,
  onNotesChange,
  onContinue,
  isLoadingVehicles = false
}) => {
  // Check if all required fields are filled
  const isFormValid = 
    (selectedVehicleId || (formData.vehicleNo.trim() !== '' && formData.vehicleType.trim() !== '')) &&
    formData.serviceType.trim() !== '' &&
    formData.preferredDate.trim() !== '' &&
    formData.timeWindow.trim() !== '';

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <h5 className="mb-4 fw-semibold">Appointment Details</h5>
        
        <Form>
          {/* Vehicle Information */}
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>
                  Select Vehicle <span className="text-danger">*</span>
                </Form.Label>
                {isLoadingVehicles ? (
                  <Form.Control as="select" disabled>
                    <option>Loading your vehicles...</option>
                  </Form.Control>
                ) : vehicles.length > 0 ? (
                  <Form.Control
                    as="select"
                    value={selectedVehicleId}
                    onChange={(e) => onVehicleChange?.(e.target.value)}
                    required
                  >
                    <option value="">-- Select a vehicle --</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.vehicleNumber} - {vehicle.type || 'Vehicle'} 
                        {vehicle.make && vehicle.model ? ` (${vehicle.make} ${vehicle.model})` : ''}
                      </option>
                    ))}
                  </Form.Control>
                ) : (
                  <div>
                    <Form.Control as="select" disabled>
                      <option>No vehicles found</option>
                    </Form.Control>
                    <Form.Text className="text-muted">
                      Please add a vehicle to your account before booking an appointment.
                    </Form.Text>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Legacy fields - hidden but kept for backward compatibility */}
          <input type="hidden" value={formData.vehicleNo} onChange={(e) => onVehicleNoChange(e.target.value)} />
          <input type="hidden" value={formData.vehicleType} onChange={(e) => onVehicleTypeChange(e.target.value)} />

          {/* Service Type */}
          <Form.Group className="mb-3">
            <Form.Label>
              Service Type <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={formData.serviceType}
              onChange={(e) => onServiceTypeChange(e.target.value)}
              required
            >
              <option value="">Select service type</option>
              <option value="Periodic Maintenance">Periodic Maintenance</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Brake Service">Brake Service</option>
              <option value="Tire Rotation">Tire Rotation</option>
              <option value="Engine Diagnostics">Engine Diagnostics</option>
            </Form.Select>
          </Form.Group>

          {/* Preferred Date */}
          <Form.Group className="mb-3">
            <Form.Label>
              Preferred Date <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              value={formData.preferredDate}
              onChange={(e) => onDateChange(e.target.value)}
              required
            />
          </Form.Group>

          {/* Time Window */}
          <Form.Group className="mb-3">
            <Form.Label>
              Time Window <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={formData.timeWindow}
              onChange={(e) => onTimeWindowChange(e.target.value)}
              required
            >
              <option value="">Select time window</option>
              <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
              <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
              <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM</option>
              <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
            </Form.Select>
          </Form.Group>

          {/* Additional Notes */}
          <Form.Group className="mb-4">
            <Form.Label>Additional Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Any special requirements or notes..."
              value={formData.additionalNotes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </Form.Group>

          {/* Action Buttons */}
          <div className="d-flex gap-3">
            <Button
              variant="primary"
              onClick={onContinue}
              disabled={!isFormValid}
              className="d-flex align-items-center gap-2 ms-auto"
            >
              Continue to Payment
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AppointmentFormFields;
