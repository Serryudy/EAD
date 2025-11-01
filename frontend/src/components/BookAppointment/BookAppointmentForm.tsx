import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import PageLayout from '../shared/PageLayout';
import AppointmentFormHeader from './AppointmentFormHeader';
import AppointmentFormFields from './AppointmentFormFields';
import AppointmentSummary from './AppointmentSummary';
import PaymentForm from './PaymentForm';
import type { PaymentData } from './PaymentForm';
import ApiService from '../../services/api';
import type { CreateAppointmentData, Vehicle } from '../../services/api';

interface BookAppointmentFormProps {
  onSaveDraft?: (appointmentData: AppointmentData) => void;
  onContinue?: (appointmentData: AppointmentData) => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export interface AppointmentData {
  vehicleId: string;
  vehicleNo: string;
  vehicleType: string;
  serviceType: string;
  preferredDate: string;
  timeWindow: string;
  additionalNotes: string;
  employee: string;
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // Fetch user's vehicles on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoadingVehicles(true);
      try {
        const response = await ApiService.getVehicles();
        if (response.success && response.data) {
          setVehicles(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, []);

  // Get selected vehicle details
  const selectedVehicle = vehicles.find(v => v._id === selectedVehicleId);
  const vehicleNo = selectedVehicle?.vehicleNumber || '';
  const vehicleType = selectedVehicle?.type || '';

  // Summary data
  const employee = 'EMP-000123';
  const vehicleSummary = vehicleNo && vehicleType ? `${vehicleType} • ${vehicleNo}` : 'Not specified';
  const estimatedDuration = '~ 2 hours';
  const serviceBayAllocation = 'Auto';

  const getAppointmentData = (): AppointmentData => ({
    vehicleId: selectedVehicleId,
    vehicleNo,
    vehicleType,
    serviceType,
    preferredDate,
    timeWindow,
    additionalNotes,
    employee,
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

  const handlePaymentSubmit = async (paymentData: PaymentData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare appointment data for API
      const appointmentData: CreateAppointmentData = {
        vehicleId: selectedVehicleId,
        serviceType,
        preferredDate,
        timeWindow,
        additionalNotes,
        estimatedDuration,
        paymentData: {
          cardHolderName: paymentData.cardholderName,
          cardNumber: paymentData.cardNumber,
          expiryDate: paymentData.expirationDate,
          cvv: paymentData.securityCode
        }
      };

      console.log('Creating appointment:', appointmentData);

      // Call API to create appointment
      const response = await ApiService.createAppointment(appointmentData);

      if (response.success) {
        console.log('Appointment created successfully:', response.data);
        
        // Show different messages based on auto-assignment
        const assignmentInfo = response.autoAssigned 
          ? `\n\n✅ Confirmed & Assigned to: ${response.assignedTo?.name}\nStatus: Confirmed`
          : `\n\n⏳ Status: Pending\nWe'll assign an employee and confirm your appointment soon.`;
        
        alert(`🎉 Appointment booked successfully!\n\nAppointment ID: ${response.data?._id}${assignmentInfo}`);
        
        // Call onContinue callback if provided
        if (onContinue) {
          onContinue({
            ...getAppointmentData(),
            paymentData
          });
        }

        // Reset form
        setSelectedVehicleId('');
        setServiceType('');
        setPreferredDate('');
        setTimeWindow('');
        setAdditionalNotes('');
        setStep('details');
      } else {
        setSubmitError(response.message || 'Failed to create appointment');
        alert(`❌ Error: ${response.message || 'Failed to create appointment'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(errorMessage);
      console.error('Error creating appointment:', error);
      alert(`❌ Error creating appointment: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
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
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onVehicleChange={setSelectedVehicleId}
                onVehicleNoChange={() => {}} // Deprecated, keep for compatibility
                onVehicleTypeChange={() => {}} // Deprecated, keep for compatibility
                onServiceTypeChange={setServiceType}
                onDateChange={setPreferredDate}
                onTimeWindowChange={setTimeWindow}
                onNotesChange={setAdditionalNotes}
                onSaveDraft={handleSaveDraft}
                onContinue={handleContinueToPayment}
                isLoadingVehicles={isLoadingVehicles}
              />
            ) : (
              <>
                <PaymentForm
                  onBack={handleBackToDetails}
                  onSubmit={handlePaymentSubmit}
                  appointmentFee={5.00}
                />
                {submitError && (
                  <div className="alert alert-danger mt-3" role="alert">
                    <strong>Error:</strong> {submitError}
                  </div>
                )}
                {isSubmitting && (
                  <div className="alert alert-info mt-3" role="alert">
                    <div className="d-flex align-items-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Creating your appointment...
                    </div>
                  </div>
                )}
              </>
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
              customerName="Customer" // Will be fetched from auth on backend
              customerPhone="" // Will be fetched from auth on backend
            />
          </Col>
        </Row>
      </div>
    </PageLayout>
  );
};

export default BookAppointmentForm;
