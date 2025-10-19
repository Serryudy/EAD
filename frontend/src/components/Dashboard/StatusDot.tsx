import React from 'react';

interface StatusDotProps {
  color: 'success' | 'primary' | 'secondary';
}

const StatusDot: React.FC<StatusDotProps> = ({ color }) => {
  const getStatusDotColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      success: '#28a745',
      primary: '#9b59b6',
      secondary: '#6c757d'
    };
    return colorMap[color] || '#6c757d';
  };

  return (
    <div
      className="rounded-circle flex-shrink-0"
      style={{
        width: '10px',
        height: '10px',
        backgroundColor: getStatusDotColor(color),
        marginTop: '5px'
      }}
    />
  );
};

export default StatusDot;
