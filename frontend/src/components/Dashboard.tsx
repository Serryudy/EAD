import React from 'react';
import PageLayout from './PageLayout';
import ServiceProgressCard from './ServiceProgressCard';
import BookingWizard from './BookingWizard';
import ServiceDetailTimeLog from './ServiceDetailTimeLog';

interface BookingData {
  service: string;
  date: string;
  time: string;
}

interface TimeEntry {
  startTime: string;
  endTime: string;
  task: string;
}

const Dashboard: React.FC = () => {
  const handleBookingConfirm = (bookingData: BookingData) => {
    console.log('Booking confirmed:', bookingData);
    alert(`Booking confirmed!\nService: ${bookingData.service}\nDate: ${bookingData.date}\nTime: ${bookingData.time}`);
  };

  const handleTimeLog = (timeEntry: TimeEntry) => {
    console.log('Time logged:', timeEntry);
    alert(`Time logged!\nTask: ${timeEntry.task}\nStart: ${timeEntry.startTime}\nEnd: ${timeEntry.endTime}`);
  };

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
          <BookingWizard onConfirm={handleBookingConfirm} />
        </div>

        <div className="mb-4">
          <ServiceDetailTimeLog
            orderNumber="AS-10293"
            customerName="Chris Roberts"
            customerAvatar="CR"
            vehicleInfo="2019 Honda Civic"
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
            onLogTime={handleTimeLog}
          />
        </div>
    </PageLayout>
  );
};

export default Dashboard;
