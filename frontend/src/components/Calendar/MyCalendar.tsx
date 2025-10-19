import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import PageLayout from '../shared/PageLayout';
import CalendarHeader from './CalendarHeader';
import CalendarFilters from './CalendarFilters';
import CalendarGrid, { type CalendarEvent } from './CalendarGrid';
import QuickFilters from './QuickFilters';
import AppointmentDetails from './AppointmentDetails';
import DayView from './DayView';

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
  const [currentWeekStart, setCurrentWeekStart] = useState(20); // Week starts from day 20

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

  // All days in the month
  const allDaysInMonth = [
    { day: 1, date: 'Sun' },
    { day: 2, date: 'Mon' },
    { day: 3, date: 'Tue' },
    { day: 4, date: 'Wed' },
    { day: 5, date: 'Thu' },
    { day: 6, date: 'Fri' },
    { day: 7, date: 'Sat' },
    { day: 8, date: 'Sun' },
    { day: 9, date: 'Mon' },
    { day: 10, date: 'Tue' },
    { day: 11, date: 'Wed' },
    { day: 12, date: 'Thu' },
    { day: 13, date: 'Fri' },
    { day: 14, date: 'Sat' },
    { day: 15, date: 'Sun' },
    { day: 16, date: 'Mon' },
    { day: 17, date: 'Tue' },
    { day: 18, date: 'Wed' },
    { day: 19, date: 'Thu' },
    { day: 20, date: 'Fri' },
    { day: 21, date: 'Sat' },
    { day: 22, date: 'Sun' },
    { day: 23, date: 'Mon' },
    { day: 24, date: 'Tue' },
    { day: 25, date: 'Wed' },
    { day: 26, date: 'Thu' },
    { day: 27, date: 'Fri' },
    { day: 28, date: 'Sat' },
    { day: 29, date: 'Sun' },
    { day: 30, date: 'Mon' },
    { day: 31, date: 'Tue' }
  ];

  // Get current week (7 days starting from currentWeekStart)
  const daysInMonth = allDaysInMonth.slice(currentWeekStart - 1, currentWeekStart + 6);

  const handlePreviousWeek = () => {
    if (currentWeekStart > 1) {
      setCurrentWeekStart(Math.max(1, currentWeekStart - 7));
    }
  };

  const handleNextWeek = () => {
    if (currentWeekStart + 6 < allDaysInMonth.length) {
      setCurrentWeekStart(Math.min(allDaysInMonth.length - 6, currentWeekStart + 7));
    }
  };

  const canGoPrevious = currentWeekStart > 1;
  const canGoNext = currentWeekStart + 6 < allDaysInMonth.length;

  const dayViewSlots = [
    { time: '09:00', status: 'booked' as const },
    { time: '10:00', status: 'in-service' as const },
    { time: '11:00', status: 'available' as const }
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

  return (
    <PageLayout>
      {/* Header */}
      <CalendarHeader
        onBack={onBack}
        onNewAppointment={onNewAppointment}
      />

      {/* Main Content */}
      <div className="d-flex" style={{ gap: '1.5rem' }}>
        {/* Calendar Section */}
        <div style={{ flex: '1 1 65%' }}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4">
              {/* Month Header & Filters */}
              <CalendarFilters monthYear="October 2025" />

              {/* Week Navigation */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                  onClick={handlePreviousWeek}
                  disabled={!canGoPrevious}
                  className="btn btn-outline-secondary btn-sm"
                  style={{
                    borderRadius: '8px',
                    opacity: canGoPrevious ? 1 : 0.5,
                    cursor: canGoPrevious ? 'pointer' : 'not-allowed'
                  }}
                >
                  ← Previous Week
                </button>
                <span className="text-muted small">
                  Week of Oct {daysInMonth[0]?.day} - {daysInMonth[daysInMonth.length - 1]?.day}
                </span>
                <button
                  onClick={handleNextWeek}
                  disabled={!canGoNext}
                  className="btn btn-outline-secondary btn-sm"
                  style={{
                    borderRadius: '8px',
                    opacity: canGoNext ? 1 : 0.5,
                    cursor: canGoNext ? 'pointer' : 'not-allowed'
                  }}
                >
                  Next Week →
                </button>
              </div>

              {/* Calendar Grid */}
              <CalendarGrid
                daysInMonth={daysInMonth}
                events={events}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </Card.Body>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div style={{ flex: '1 1 35%' }}>
          {/* Quick Filters */}
          <QuickFilters
            activeFilters={activeFilters}
            onToggleFilter={toggleFilter}
          />

          {/* Selected Appointment Details */}
          {selectedDate && selectedDateEvents.length > 0 && (
            <AppointmentDetails
              event={selectedDateEvents[0]}
              onReschedule={onReschedule}
              onConfirm={onConfirm}
            />
          )}

          {/* Day View */}
          <DayView
            selectedDate={selectedDate || '22'}
            slots={dayViewSlots}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default MyCalendar;
