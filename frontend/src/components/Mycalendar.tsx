import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import PageLayout from './PageLayout';
import {
  FaCalendarAlt,
  FaArrowLeft,
  FaPlus,
  FaWrench,
  FaClock,
  FaCheckCircle,
  FaEdit,
  FaCheck,
  FaCar,
  FaMapMarkerAlt
} from 'react-icons/fa';

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  endTime: string;
  title: string;
  vehicle?: string;
  status: 'confirmed' | 'pending' | 'service';
  type: 'service' | 'inspection' | 'maintenance';
}

interface MyCalendarProps {
  onBack?: () => void;
  onNewAppointment?: () => void;
  onReschedule?: (eventId: string) => void;
  onConfirm?: (eventId: string) => void;
}

const MyCalendar: React.FC<MyCalendarProps> = ({
  onBack,
  onNewAppointment,
  onReschedule,
  onConfirm
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>('22');
  const [activeFilters, setActiveFilters] = useState<string[]>(['confirmed', 'pending', 'service']);

  const events: CalendarEvent[] = [
    {
      id: '1',
      date: '22',
      time: '9:00',
      endTime: '11:00',
      title: 'Toyota Corolla',
      status: 'confirmed',
      type: 'service'
    },
    {
      id: '2',
      date: '22',
      time: '13:00',
      endTime: '14:00',
      title: 'Inspection',
      status: 'pending',
      type: 'inspection'
    },
    {
      id: '3',
      date: '24',
      time: '10:30',
      endTime: '12:00',
      title: 'Oil Change',
      status: 'confirmed',
      type: 'service'
    },
    {
      id: '4',
      date: '30',
      time: '15:00',
      endTime: '16:00',
      title: 'Brake Check',
      status: 'pending',
      type: 'inspection'
    }
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysInMonth = [
    { day: 20, date: 'Mon' },
    { day: 21, date: 'Tue' },
    { day: 22, date: 'Wed' },
    { day: 23, date: 'Thu' },
    { day: 24, date: 'Fri' },
    { day: 25, date: 'Sat' },
    { day: 26, date: 'Sun' },
    { day: 27, date: 'Mon' },
    { day: 28, date: 'Tue' },
    { day: 29, date: 'Wed' },
    { day: 30, date: 'Thu' },
    { day: 31, date: 'Fri' }
  ];

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const getEventsForDay = (day: number) => {
    return events.filter(event => event.date === day.toString());
  };

  const selectedDateEvents = selectedDate ? getEventsForDay(parseInt(selectedDate)) : [];

  const dayViewSlots = [
    { time: '09:00', status: 'booked' as const },
    { time: '10:00', status: 'in-service' as const },
    { time: '11:00', status: 'available' as const }
  ];

  return (
    <PageLayout>
      {/* Header */}
      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '16px' }}>
        <Card.Body className="py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
              <FaCalendarAlt size={20} />
              <h4 className="mb-0 fw-semibold">My Calendar</h4>
            </div>
            <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
              {onBack && (
                <Button
                  variant="link"
                  onClick={onBack}
                  className="text-decoration-none text-dark d-flex align-items-center"
                  style={{ gap: '0.5rem' }}
                >
                  <FaArrowLeft size={14} />
                  Back
                </Button>
              )}
              <Button
                variant="primary"
                onClick={onNewAppointment}
                className="d-flex align-items-center"
                style={{
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#38bdf8',
                  border: 'none'
                }}
              >
                <FaPlus size={14} />
                New Appointment
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Main Content */}
      <div className="d-flex" style={{ gap: '1.5rem' }}>
        {/* Calendar Section */}
        <div style={{ flex: '1 1 65%' }}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              {/* Month Header & Filters */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 text-muted fw-medium" style={{ fontSize: '1rem' }}>
                  October 2025
                </h5>
                <div className="d-flex align-items-center" style={{ gap: '0.75rem' }}>
                  <Badge
                    bg="light"
                    text="dark"
                    className="d-flex align-items-center"
                    style={{
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      fontWeight: 'normal'
                    }}
                  >
                    <FaWrench size={12} />
                    Service
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="d-flex align-items-center"
                    style={{
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      fontWeight: 'normal'
                    }}
                  >
                    <FaClock size={12} />
                    Pending
                  </Badge>
                  <Badge
                    bg="light"
                    text="dark"
                    className="d-flex align-items-center"
                    style={{
                      gap: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      fontWeight: 'normal'
                    }}
                  >
                    <FaCheckCircle size={12} />
                    Confirmed
                  </Badge>
                </div>
              </div>

              {/* Calendar Grid */}
              <div>
                {/* Day Headers */}
                <div className="d-grid mb-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                  {daysOfWeek.map(day => (
                    <div key={day} className="text-center text-muted small fw-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                  {daysInMonth.map(({ day }) => {
                    const dayEvents = getEventsForDay(day);
                    const isSelected = selectedDate === day.toString();

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDate(day.toString())}
                        className={`p-3 rounded ${isSelected ? 'bg-light' : ''}`}
                        style={{
                          minHeight: '100px',
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #38bdf8' : '1px solid #f3f4f6',
                          backgroundColor: isSelected ? '#f0f9ff' : 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div className="text-muted small mb-2">{day}</div>
                        <div className="d-flex flex-column" style={{ gap: '0.375rem' }}>
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              className={`p-2 rounded small ${
                                event.status === 'confirmed' 
                                  ? 'bg-success bg-opacity-10 border border-success border-opacity-25'
                                  : 'bg-warning bg-opacity-10 border border-warning border-opacity-25'
                              }`}
                              style={{ fontSize: '0.75rem' }}
                            >
                              <div className="d-flex align-items-start mb-1" style={{ gap: '0.25rem' }}>
                                {event.status === 'confirmed' ? (
                                  <FaCheckCircle size={10} className="text-success mt-1" />
                                ) : (
                                  <FaClock size={10} className="text-warning mt-1" />
                                )}
                                <span className="fw-medium">
                                  {event.time}-{event.endTime}
                                </span>
                              </div>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                • {event.title}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div style={{ flex: '1 1 35%' }}>
          {/* Quick Filters */}
          <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-semibold">Quick Filters</h6>
              </div>
              <div className="d-flex flex-wrap" style={{ gap: '0.5rem' }}>
                <Badge
                  bg={activeFilters.includes('confirmed') ? 'success' : 'light'}
                  text={activeFilters.includes('confirmed') ? 'white' : 'dark'}
                  className="d-flex align-items-center"
                  style={{
                    gap: '0.375rem',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontWeight: 'normal'
                  }}
                  onClick={() => toggleFilter('confirmed')}
                >
                  <FaCheckCircle size={12} />
                  Confirmed
                </Badge>
                <Badge
                  bg={activeFilters.includes('pending') ? 'warning' : 'light'}
                  text={activeFilters.includes('pending') ? 'white' : 'dark'}
                  className="d-flex align-items-center"
                  style={{
                    gap: '0.375rem',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontWeight: 'normal'
                  }}
                  onClick={() => toggleFilter('pending')}
                >
                  <FaClock size={12} />
                  Pending
                </Badge>
                <Badge
                  bg={activeFilters.includes('service') ? 'primary' : 'light'}
                  text={activeFilters.includes('service') ? 'white' : 'dark'}
                  className="d-flex align-items-center"
                  style={{
                    gap: '0.375rem',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    fontWeight: 'normal'
                  }}
                  onClick={() => toggleFilter('service')}
                >
                  <FaWrench size={12} />
                  Service
                </Badge>
              </div>
            </Card.Body>
          </Card>

          {/* Selected Appointment Details */}
          {selectedDate && selectedDateEvents.length > 0 && (
            <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
                    <FaCalendarAlt size={14} className="text-muted" />
                    <span className="fw-semibold">Tue, Oct 22</span>
                  </div>
                  <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
                    <FaClock size={14} className="text-muted" />
                    <span className="text-muted">09:00-11:00</span>
                  </div>
                  <div className="d-flex align-items-center mb-2" style={{ gap: '0.5rem' }}>
                    <FaCar size={14} className="text-muted" />
                    <span className="text-muted">Toyota Corolla • Periodic Maintenance</span>
                  </div>
                  <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <FaMapMarkerAlt size={14} className="text-muted" />
                    <span className="text-muted">Service Bay: Auto</span>
                  </div>
                </div>

                <div className="d-flex" style={{ gap: '0.5rem' }}>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="flex-fill d-flex align-items-center justify-content-center"
                    style={{ gap: '0.375rem', borderRadius: '8px' }}
                    onClick={() => onReschedule && onReschedule('1')}
                  >
                    <FaEdit size={12} />
                    Reschedule
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-fill d-flex align-items-center justify-content-center"
                    style={{
                      gap: '0.375rem',
                      borderRadius: '8px',
                      backgroundColor: '#38bdf8',
                      border: 'none'
                    }}
                    onClick={() => onConfirm && onConfirm('1')}
                  >
                    <FaCheck size={12} />
                    Confirm
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Day View */}
          <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              <h6 className="mb-3 fw-semibold">Day View</h6>
              <div className="mb-3">
                <div className="d-flex align-items-center text-muted small" style={{ gap: '0.5rem' }}>
                  <FaCalendarAlt size={12} />
                  <span>22 Oct 2025 • 8 AM - 6 PM</span>
                </div>
              </div>

              <div className="d-flex flex-column" style={{ gap: '0.75rem' }}>
                {dayViewSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="d-flex justify-content-between align-items-center p-2 rounded"
                    style={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <span className="fw-medium">{slot.time}</span>
                    <Badge
                      bg={
                        slot.status === 'booked'
                          ? 'danger'
                          : slot.status === 'in-service'
                          ? 'warning'
                          : 'success'
                      }
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.5rem',
                        fontWeight: 'normal'
                      }}
                    >
                      {slot.status === 'booked'
                        ? 'Booked'
                        : slot.status === 'in-service'
                        ? 'In Service'
                        : 'Available'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default MyCalendar;