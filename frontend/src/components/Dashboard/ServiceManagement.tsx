import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Alert, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { FiPlay, FiCheck, FiClock, FiTool } from 'react-icons/fi';
import ApiService from '../../services/api';

interface ServiceManagementProps {
  appointmentId: string;
  appointmentStatus: string;
  onServiceStarted?: () => void;
}

interface ServiceRecord {
  _id: string;
  status: string;
  checkInTime: string;
  estimatedCompletionTime?: string;
  actualCompletionTime?: string;
  serviceProgress: {
    stage: string;
    status: string;
    startTime?: string;
    endTime?: string;
    completedBy?: string;
    notes?: string;
  }[];
  totalPartsCost: number;
  totalLaborCost: number;
  totalCost: number;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ 
  appointmentId, 
  appointmentStatus,
  onServiceStarted 
}) => {
  const [showStartModal, setShowStartModal] = useState(false);
  const [serviceRecord, setServiceRecord] = useState<ServiceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialNotes, setInitialNotes] = useState('');
  const [customerComplaints, setCustomerComplaints] = useState('');

  useEffect(() => {
    // If appointment is already in-service, fetch the service record
    if (appointmentStatus === 'in-service' || appointmentStatus === 'completed') {
      fetchServiceRecord();
    }
  }, [appointmentId, appointmentStatus]);

  const fetchServiceRecord = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getServiceRecordByAppointment(appointmentId);
      
      if (response.success && response.data) {
        setServiceRecord(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching service record:', err);
      setError(err.message || 'Failed to fetch service record');
    } finally {
      setLoading(false);
    }
  };

  const handleStartService = async () => {
    try {
      setLoading(true);
      setError(null);

      const complaints = customerComplaints
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const response = await ApiService.startService(appointmentId, {
        initialInspectionNotes: initialNotes,
        customerComplaints: complaints.length > 0 ? complaints : undefined
      });

      if (response.success) {
        setServiceRecord(response.data);
        setShowStartModal(false);
        setInitialNotes('');
        setCustomerComplaints('');
        
        if (onServiceStarted) {
          onServiceStarted();
        }
      } else {
        setError(response.message || 'Failed to start service');
      }
    } catch (err: any) {
      console.error('Error starting service:', err);
      setError(err.message || 'Failed to start service');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (): number => {
    if (!serviceRecord || !serviceRecord.serviceProgress) return 0;
    
    const completedStages = serviceRecord.serviceProgress.filter(
      stage => stage.status === 'completed'
    ).length;
    
    return (completedStages / serviceRecord.serviceProgress.length) * 100;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'checked-in':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'checked-out':
        return 'secondary';
      case 'on-hold':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (appointmentStatus === 'pending' || appointmentStatus === 'cancelled') {
    return null;
  }

  // Show "Start Service" button for confirmed appointments
  if (appointmentStatus === 'confirmed' && !serviceRecord) {
    return (
      <>
        <Card className="mt-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">
                  <FiTool className="me-2" />
                  Service Management
                </h5>
                <p className="text-muted mb-0">Ready to start service for this appointment</p>
              </div>
              <Button
                variant="success"
                size="lg"
                onClick={() => setShowStartModal(true)}
                disabled={loading}
              >
                <FiPlay className="me-2" />
                Start Service
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Modal show={showStartModal} onHide={() => setShowStartModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Start Service - Initial Inspection</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Initial Inspection Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Record initial vehicle condition, visible issues, mileage, etc."
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Customer Complaints</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter customer complaints, separated by commas"
                  value={customerComplaints}
                  onChange={(e) => setCustomerComplaints(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Separate multiple complaints with commas
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStartModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={handleStartService}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Starting...
                </>
              ) : (
                <>
                  <FiCheck className="me-2" />
                  Confirm & Start Service
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  // Show service progress for in-service or completed appointments
  if (serviceRecord) {
    const progress = calculateProgress();

    return (
      <Card className="mt-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <FiTool className="me-2" />
              Service Progress
            </h5>
            <Badge bg={getStatusColor(serviceRecord.status)} className="px-3 py-2">
              {serviceRecord.status.toUpperCase().replace('-', ' ')}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Overall Progress</span>
              <span className="fw-bold">{Math.round(progress)}%</span>
            </div>
            <ProgressBar now={progress} variant={progress === 100 ? 'success' : 'primary'} />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-2">
                <FiClock className="me-2 text-muted" />
                <div>
                  <small className="text-muted d-block">Check-in Time</small>
                  <strong>{formatDateTime(serviceRecord.checkInTime)}</strong>
                </div>
              </div>
            </div>
            {serviceRecord.estimatedCompletionTime && (
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <FiClock className="me-2 text-muted" />
                  <div>
                    <small className="text-muted d-block">Estimated Completion</small>
                    <strong>{formatDateTime(serviceRecord.estimatedCompletionTime)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-3">
            <h6 className="mb-3">Service Stages</h6>
            {serviceRecord.serviceProgress.map((stage, index) => (
              <div key={index} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                <div className="me-3">
                  {stage.status === 'completed' ? (
                    <FiCheck className="text-success" size={20} />
                  ) : stage.status === 'in-progress' ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #dee2e6' }} />
                  )}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">{stage.stage}</span>
                    <Badge bg={stage.status === 'completed' ? 'success' : stage.status === 'in-progress' ? 'warning' : 'secondary'}>
                      {stage.status}
                    </Badge>
                  </div>
                  {stage.notes && (
                    <small className="text-muted d-block">{stage.notes}</small>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            <div className="col-md-4">
              <Card className="bg-light">
                <Card.Body>
                  <small className="text-muted d-block">Parts Cost</small>
                  <h6 className="mb-0">${serviceRecord.totalPartsCost.toFixed(2)}</h6>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="bg-light">
                <Card.Body>
                  <small className="text-muted d-block">Labor Cost</small>
                  <h6 className="mb-0">${serviceRecord.totalLaborCost.toFixed(2)}</h6>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-4">
              <Card className="bg-success text-white">
                <Card.Body>
                  <small className="d-block">Total Cost</small>
                  <h6 className="mb-0">${serviceRecord.totalCost.toFixed(2)}</h6>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mt-4">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 mb-0">Loading service information...</p>
        </Card.Body>
      </Card>
    );
  }

  return null;
};

export default ServiceManagement;
