import React from 'react';
import ServiceProgressCard from '../components/ServiceProgressCard';

const ProgressPage: React.FC = () => {
  // Example data - this would typically come from an API
  const serviceSteps = [
    {
      id: '1',
      title: 'Vehicle Received',
      status: 'completed' as const,
      statusText: 'Assigned to Alex',
      time: '9:00 AM',
      color: 'success' as const
    },
    {
      id: '2',
      title: 'Diagnostics',
      status: 'in-progress' as const,
      statusText: 'In progress',
      time: '10:15 AM',
      color: 'primary' as const
    },
    {
      id: '3',
      title: 'Repair',
      status: 'queued' as const,
      statusText: 'Queued',
      time: 'ETA 1:30 PM',
      color: 'secondary' as const
    }
  ];

  return (
    <div className="container py-4">
      <h2 className="mb-4">Service Progress</h2>
      
      <div className="row">
        <div className="col-lg-6 col-md-8 col-12">
          <ServiceProgressCard
            orderNumber="AS-10293"
            vehicleInfo="2019 Honda Civic"
            completionPercentage={62}
            steps={serviceSteps}
          />
        </div>
      </div>

      {/* You can add multiple cards or other content here */}
    </div>
  );
};

export default ProgressPage;
