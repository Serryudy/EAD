import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import PageLayout from '../shared/PageLayout';
import AppointmentFormHeader from './AppointmentFormHeader';
import AppointmentFormFields from './AppointmentFormFields';
import AppointmentSummary from './AppointmentSummary';
import PaymentForm from './PaymentForm';
import type { PaymentData } from './PaymentForm';

interface BookAppointmentFormProps {
  onSaveDraft?: (appointmentData: AppointmentData) => void;
  onContinue?: (appointmentData: AppointmentData) => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export interface AppointmentData {
  vehicleNo: string;
  vehicleType: string;
  serviceType: string;
  preferredDate: string;
  timeWindow: string;
  additionalNotes: string;
  employee: string;
  customerName: string;
  customerPhone: string;
  estimatedDuration: string;
  serviceBayAllocation: string;
  paymentData?: PaymentData;
}

const BookAppointmentForm: React.FC<BookAppointmentFormProps> = ({
  onSaveDraft,
  onContinue,
  onBack,
  currentStep = 2,
  totalSteps = 3
}) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Summary data
  const employee = 'EMP-000123';
  const vehicleSummary = vehicleNo && vehicleType ? `${vehicleType} • ${vehicleNo}` : 'Not specified';
  const customerName = 'John Smith';
  const customerPhone = '+1 202 555 0142';
  const estimatedDuration = '~ 2 hours';
  const serviceBayAllocation = 'Auto';

  const getAppointmentData = (): AppointmentData => ({
    vehicleNo,
    vehicleType,
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

  const handleContinueToPayment = () => {
    setStep('payment');
  };

  const handleBackToDetails = () => {
    setStep('details');
  };

  const handlePaymentSubmit = (paymentData: PaymentData) => {
    const appointmentData = {
      ...getAppointmentData(),
      paymentData
    };
    
    if (onContinue) {
      onContinue(appointmentData);
    }
    
    // In a real app, this would process the payment and create the appointment
    console.log('Appointment booked:', appointmentData);
    alert('Appointment booked successfully!');
  };

  return (
    <PageLayout>
      <div>
        {/* Header */}
        <div className="mb-4">
          <AppointmentFormHeader
            onBack={step === 'details' ? onBack : undefined}
            currentStep={step === 'details' ? currentStep : currentStep + 1}
            totalSteps={totalSteps + 1}
          />
        </div>

        {/* Main Content */}
        <Row className="g-4">
          {/* Left Side - Form */}
          <Col lg={8}>
            {step === 'details' ? (
              <AppointmentFormFields
                formData={{
                  vehicleNo,
                  vehicleType,
                  serviceType,
                  preferredDate,
                  timeWindow,
                  additionalNotes
                }}
                onVehicleNoChange={setVehicleNo}
                onVehicleTypeChange={setVehicleType}
                onServiceTypeChange={setServiceType}
                onDateChange={setPreferredDate}
                onTimeWindowChange={setTimeWindow}
                onNotesChange={setAdditionalNotes}
                onSaveDraft={handleSaveDraft}
                onContinue={handleContinueToPayment}
              />
            ) : (
              <PaymentForm
                onBack={handleBackToDetails}
                onSubmit={handlePaymentSubmit}
                appointmentFee={5.00}
              />
            )}
          </Col>

          {/* Right Side - Summary */}
          <Col lg={4}>
            <AppointmentSummary
              employee={employee}
              vehicleSummary={vehicleSummary}
              serviceType={serviceType || 'Not selected'}
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
