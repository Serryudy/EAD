import React from 'react';
import PageLayout from '../shared/PageLayout';
import ServiceProgressCard from './ServiceProgressCard';
import BookingsList, { type Booking } from './BookingsList';
import ServiceDetailView from './ServiceDetailView';

const Dashboard: React.FC = () => {
  const handleViewBookingDetails = (bookingId: string) => {
    console.log('View booking details:', bookingId);
    // Navigate to booking details page or open modal
  };

  // Sample bookings data
  const upcomingBookings: Booking[] = [
    {
      id: '1',
      service: 'Oil Change & Filter Replacement',
      date: 'Oct 22, 2025',
      time: '9:00 AM - 11:00 AM',
      vehicle: '2019 Honda Civic',
      customerName: 'John Smith',
      status: 'confirmed'
    },
    {
      id: '2',
      service: 'Brake Inspection',
      date: 'Oct 24, 2025',
      time: '2:00 PM - 3:30 PM',
      vehicle: '2021 Toyota Camry',
      customerName: 'Sarah Johnson',
      status: 'pending'
    },
    {
      id: '3',
      service: 'Full Service',
      date: 'Oct 25, 2025',
      time: '10:00 AM - 1:00 PM',
      vehicle: '2020 Ford F-150',
      customerName: 'Mike Davis',
      status: 'confirmed'
    }
  ];

  return (
    <PageLayout>
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

      <div className="mb-4">
        <BookingsList 
          bookings={upcomingBookings}
          onViewDetails={handleViewBookingDetails}
        />
      </div>

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
    </PageLayout>
  );
};

export default Dashboard;
