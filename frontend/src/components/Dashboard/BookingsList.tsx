import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaWrench, FaCar, FaUser, FaArrowRight } from 'react-icons/fa';

export interface Booking {
  id: string;
  service: string;
  date: string;
  time: string;
  vehicle: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed';
}

interface BookingsListProps {
  bookings: Booking[];
  onViewDetails?: (bookingId: string) => void;
}

const BookingsList: React.FC<BookingsListProps> = ({ bookings, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'secondary';
      default:
        return 'light';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  return (
    <Card
      className="shadow-sm border-0"
      style={{
        borderRadius: '16px',
        background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
      }}
    >
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="mb-1 fw-semibold">Upcoming Bookings</h5>
            <p className="text-muted small mb-0">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <Badge
            bg="primary"
            style={{
              fontSize: '0.85rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#38bdf8'
            }}
          >
            {bookings.filter(b => b.status === 'confirmed').length} Confirmed
          </Badge>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-5">
            <FaCalendarAlt size={48} className="text-muted mb-3" />
            <p className="text-muted">No bookings found</p>
          </div>
        ) : (
          <div className="d-flex flex-column" style={{ gap: '1rem' }}>
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="border"
                style={{
                  borderRadius: '12px',
                  borderColor: '#e5e7eb',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 189, 248, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: '#f0f9ff',
                          color: '#38bdf8'
                        }}
                      >
                        <FaWrench size={20} />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-semibold">{booking.service}</h6>
                        <div className="d-flex align-items-center text-muted small" style={{ gap: '0.5rem' }}>
                          <FaUser size={12} />
                          <span>{booking.customerName}</span>
                        </div>
                      </div>
                    </div>
                    <Badge bg={getStatusColor(booking.status)} style={{ borderRadius: '6px' }}>
                      {getStatusText(booking.status)}
                    </Badge>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex" style={{ gap: '1.5rem' }}>
                      <div className="d-flex align-items-center text-muted small" style={{ gap: '0.5rem' }}>
                        <FaCalendarAlt size={12} />
                        <span>{booking.date}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted small" style={{ gap: '0.5rem' }}>
                        <FaClock size={12} />
                        <span>{booking.time}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted small" style={{ gap: '0.5rem' }}>
                        <FaCar size={12} />
                        <span>{booking.vehicle}</span>
                      </div>
                    </div>
                    {onViewDetails && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-decoration-none p-0"
                        onClick={() => onViewDetails(booking.id)}
                        style={{ color: '#38bdf8' }}
                      >
                        View <FaArrowRight size={12} className="ms-1" />
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default BookingsList;
