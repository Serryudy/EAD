import React, { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import PageLayout from '../shared/PageLayout';
import ServiceProgressCard from './ServiceProgressCard';
import BookingsList, { type Booking } from './BookingsList';
import ServiceDetailView from './ServiceDetailView';
import ApiService from '../../services/api';
import type { Appointment } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch appointments for the logged-in customer
        const response = await ApiService.getAllAppointments({
          customerId: user.id,
          status: 'confirmed', // Only show confirmed bookings
          sortBy: 'preferredDate',
          sortOrder: 'asc' as const,
          limit: 10
        });

        if (response.success) {
          const appointmentsData = response.data?.data || response.data?.appointments || [];
          setAppointments(appointmentsData);
        } else {
          setError(response.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load appointments';
        setError(errorMessage);
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Convert API appointments to Booking format
  const convertToBookings = (appointments: Appointment[]): Booking[] => {
    return appointments.map((apt) => {
      // Handle populated vehicleId (can be object or string)
      const vehicle = typeof apt.vehicleId === 'object' && apt.vehicleId
        ? `${apt.vehicleId.year || ''} ${apt.vehicleId.make || ''} ${apt.vehicleId.model || ''}`.trim() || 
          `${apt.vehicleId.type || 'Vehicle'} - ${apt.vehicleId.vehicleNumber}`
        : 'Vehicle Info Unavailable';
      
      // Handle populated customerId (can be object or string)
      const customerName = typeof apt.customerId === 'object' && apt.customerId
        ? apt.customerId.name
        : 'Customer';

      return {
        id: apt._id,
        service: apt.serviceType,
        date: new Date(apt.preferredDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        time: apt.timeWindow || apt.scheduledTime || 'TBD',
        vehicle,
        customerName,
        status: apt.status === 'in-service' ? 'in-progress' : apt.status as any
      };
    });
  };

  const handleViewBookingDetails = (bookingId: string) => {
    console.log('View booking details:', bookingId);
    // Navigate to booking details page or open modal
  };

  return (
    <PageLayout>
      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading your bookings...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Dashboard Content */}
      {!loading && (
        <>
          {/* Only show ServiceProgressCard if there's an in-progress appointment */}
          {appointments.some(apt => apt.status === 'in-service') && (
            <div className="mb-4">
              <ServiceProgressCard
                orderNumber="AS-10293"
                vehicleInfo="2019 Honda Civic"
                completionPercentage={62}
                steps={[
                  {
                    id: '1',
                    title: 'Vehicle Received',
                    statusText: 'Assigned to Alex',
                    time: '9:00 AM',
                    color: 'success',
                    status: 'completed'
                  },
                  {
                    id: '2',
                    title: 'Diagnostics',
                    statusText: 'In progress',
                    time: '10:15 AM',
                    color: 'primary',
                    status: 'in-progress'
                  },
                  {
                    id: '3',
                    title: 'Repair',
                    statusText: 'Queued',
                    time: 'ETA 1:30 PM',
                    color: 'secondary',
                    status: 'queued'
                  }
                ]}
              />
            </div>
          )}

          {/* Upcoming Bookings */}
          <div className="mb-4">
            {user ? (
              <BookingsList 
                bookings={convertToBookings(appointments)}
                onViewDetails={handleViewBookingDetails}
              />
            ) : (
              <Alert variant="info">
                <strong>Welcome!</strong> Please log in to view your bookings.
              </Alert>
            )}
          </div>

          {/* Service Detail View - Only show if there's an in-service appointment */}
          {appointments.some(apt => apt.status === 'in-service') && (
            <div className="mb-4">
              <ServiceDetailView
                orderNumber="AS-10293"
                customerName="Chris Roberts"
                customerAvatar="CR"
                vehicleInfo="2019 Honda Civic"
                currentStatus={1}
                estimatedCompletion="3:00 PM"
                totalHours="3.5h"
                workLogs={[
                  {
                    id: '1',
                    technician: 'Alex',
                    duration: '2.0h',
                    task: 'Diagnostics',
                    timeRange: '9:00 - 11:00'
                  },
                  {
                    id: '2',
                    technician: 'Priya',
                    duration: '1.5h',
                    task: 'Repair Prep',
                    timeRange: '11:30 - 1:00'
                  }
                ]}
              />
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Dashboard;
