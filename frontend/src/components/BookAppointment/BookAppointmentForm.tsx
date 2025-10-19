import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import PageLayout from '../shared/PageLayout';
import AppointmentFormHeader from './AppointmentFormHeader';
import AppointmentFormFields from './AppointmentFormFields';
import AppointmentSummary from './AppointmentSummary';

interface BookAppointmentFormProps {
  onSaveDraft?: (appointmentData: AppointmentData) => void;
  onContinue?: (appointmentData: AppointmentData) => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export interface AppointmentData {
  vehicle: string;
  serviceType: string;
  preferredDate: string;
  timeWindow: string;
  additionalNotes: string;
  employee: string;
  customerName: string;
  customerPhone: string;
  estimatedDuration: string;
  serviceBayAllocation: string;
}

const BookAppointmentForm: React.FC<BookAppointmentFormProps> = ({
  onSaveDraft,
  onContinue,
  onBack,
  currentStep = 2,
  totalSteps = 3
}) => {
  const [vehicle, setVehicle] = useState('Toyota Corolla • AB12 XYZ');
  const [serviceType, setServiceType] = useState('Periodic Maintenance');
  const [preferredDate, setPreferredDate] = useState('2025-10-22');
  const [timeWindow, setTimeWindow] = useState('09:00 AM - 11:00 AM');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Summary data
  const employee = 'EMP-000123';
  const vehicleSummary = 'Toyota Corolla (2019)';
  const customerName = 'John Smith';
  const customerPhone = '+1 202 555 0142';
  const estimatedDuration = '~ 2 hours';
  const serviceBayAllocation = 'Auto';

  const getAppointmentData = (): AppointmentData => ({
    vehicle,
    serviceType,
    preferredDate,
    timeWindow,
    additionalNotes,
    employee,
    customerName,
    customerPhone,
    estimatedDuration,
    serviceBayAllocation
  });

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(getAppointmentData());
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue(getAppointmentData());
    }
  };

  return (
    <PageLayout>
      <div>
        {/* Header */}
        <div className="mb-4">
          <AppointmentFormHeader
            onBack={onBack}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </div>

        {/* Main Content */}
        <Row className="g-4">
          {/* Left Side - Form */}
          <Col lg={8}>
            <AppointmentFormFields
              formData={{
                vehicle,
                serviceType,
                preferredDate,
                timeWindow,
                additionalNotes
              }}
              onVehicleChange={setVehicle}
              onServiceTypeChange={setServiceType}
              onDateChange={setPreferredDate}
              onTimeWindowChange={setTimeWindow}
              onNotesChange={setAdditionalNotes}
              onSaveDraft={handleSaveDraft}
              onContinue={handleContinue}
            />
          </Col>

          {/* Right Side - Summary */}
          <Col lg={4}>
            <AppointmentSummary
              employee={employee}
              vehicleSummary={vehicleSummary}
              serviceType={serviceType}
              estimatedDuration={estimatedDuration}
              serviceBayAllocation={serviceBayAllocation}
              customerName={customerName}
              customerPhone={customerPhone}
            />
          </Col>
        </Row>
      </div>
    </PageLayout>
  );
};

export default BookAppointmentForm;
