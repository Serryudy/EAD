import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import BookingsList from './BookingsList';
import type { Booking } from './BookingsList';
import ApiService from '../../services/api';
import type { Appointment } from '../../services/api';

interface AppointmentsListContainerProps {
  onViewDetails?: (appointmentId: string) => void;
}

const AppointmentsListContainer: React.FC<AppointmentsListContainerProps> = ({ onViewDetails }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page,
        limit: 10,
        sortBy: 'preferredDate',
        sortOrder: 'desc' as const
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await ApiService.getAllAppointments(params);

      if (response.success) {
        const appointmentsData = response.data?.data || response.data?.appointments || [];
        setAppointments(appointmentsData);
        
        if (response.data?.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      } else {
        setError(response.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, statusFilter]);

  // Convert API appointments to Booking format
  const convertToBookings = (appointments: Appointment[]): Booking[] => {
    return appointments.map((apt) => {
      // Handle populated vehicleId (can be object or string)
      const vehicle = typeof apt.vehicleId === 'object' && apt.vehicleId 
        ? `${apt.vehicleId.type || 'Vehicle'} - ${apt.vehicleId.vehicleNumber}`
        : 'Vehicle Info Unavailable';
      
      // Handle populated customerId (can be object or string)
      const customerName = typeof apt.customerId === 'object' && apt.customerId
        ? apt.customerId.name
        : 'Customer';

      return {
        id: apt._id,
        service: apt.serviceType,
        date: new Date(apt.preferredDate).toLocaleDateString(),
        time: apt.timeWindow || apt.scheduledTime || 'TBD',
        vehicle,
        customerName,
        status: apt.status as 'pending' | 'confirmed' | 'in-progress' | 'completed'
      };
    });
  };

  const handleRefresh = () => {
    fetchAppointments();
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div>
      {/* Filter Controls */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small mb-2">Filter by Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1); // Reset to first page
                  }}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="all">All Appointments</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-service">In Service</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="outline-primary"
                onClick={handleRefresh}
                disabled={loading}
                style={{ borderRadius: '8px' }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Refreshing...
                  </>
                ) : (
                  '🔄 Refresh'
                )}
              </Button>
            </Col>
            <Col md={4} className="text-end">
              <div className="text-muted small">
                Page {page} of {totalPages} • {appointments.length} appointments
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && appointments.length === 0 ? (
        <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
          <Card.Body className="p-5 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading appointments...</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Appointments List */}
          <BookingsList 
            bookings={convertToBookings(appointments)} 
            onViewDetails={onViewDetails}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-4" style={{ gap: '1rem' }}>
              <Button
                variant="outline-primary"
                onClick={handlePrevPage}
                disabled={page === 1 || loading}
                style={{ borderRadius: '8px' }}
              >
                ← Previous
              </Button>
              <span className="text-muted">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline-primary"
                onClick={handleNextPage}
                disabled={page === totalPages || loading}
                style={{ borderRadius: '8px' }}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentsListContainer;
