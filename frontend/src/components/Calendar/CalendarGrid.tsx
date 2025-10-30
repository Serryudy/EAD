import React from 'react';
import { FaCheckCircle, FaClock } from 'react-icons/fa';

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  endTime: string;
  title: string;
  vehicle?: string;
  status: 'confirmed' | 'pending' | 'service';
  type: 'service' | 'inspection' | 'maintenance';
}

interface CalendarGridProps {
  daysInMonth: { day: number; date: string }[];
  events: CalendarEvent[];
  selectedDate: string | null;
  onDateSelect: (day: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  daysInMonth,
  events,
  selectedDate,
  onDateSelect
}) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getEventsForDay = (day: number) => {
    return events.filter(event => event.date === day.toString());
  };

  return (
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
              onClick={() => onDateSelect(day.toString())}
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
  );
};

export default CalendarGrid;
