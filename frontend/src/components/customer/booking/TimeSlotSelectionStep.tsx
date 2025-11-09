/**
 * Time Slot Selection Step
 * 
 * Allows customers to select an available time slot for their appointment
 */

import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Clock, AlertCircle, Loader2 } from 'lucide-react';

interface TimeSlot {
  startTime: string;
  endTime: string;
  displayTime: string;
  displayEndTime: string;
  isAvailable: boolean;
  capacityUsed: number;
  capacityRemaining: number;
  totalCapacity: number;
}

interface Service {
  _id: string;
  name: string;
  estimatedDuration: number;
}

interface TimeSlotSelectionStepProps {
  date: Date;
  selectedServices: Service[];
  vehicleCount: number;
  selectedSlot: TimeSlot | null;
  onSlotChange: (slot: TimeSlot | null) => void;
}

export default function TimeSlotSelectionStep({
  date,
  selectedServices,
  vehicleCount,
  selectedSlot,
  onSlotChange
}: TimeSlotSelectionStepProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const serviceIds = selectedServices.map(s => s._id);
      const params = new URLSearchParams({
        date: date.toISOString(),
        vehicleCount: vehicleCount.toString()
      });

      // Add service IDs
      serviceIds.forEach(id => params.append('serviceIds', id));

      // Use fetch with credentials to include HTTP-only cookies
      const response = await fetch(
        `http://localhost:5000/api/appointments/available-slots?${params.toString()}`,
        {
          credentials: 'include', // Include HTTP-only cookies
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      console.log('📅 Available slots FULL response:', JSON.stringify(data, null, 2));

      if (data.success) {
        setSlots(data.slots || []);
        
        if (!data.slots || data.slots.length === 0) {
          console.warn('⚠️ No slots available. Message:', data.message);
          setError(data.message || 'No available time slots for the selected date');
        }
      } else {
        setError(data.message || 'Failed to load time slots');
      }
    } catch (err) {
      console.error('❌ Error fetching time slots:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, selectedServices, vehicleCount]);

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;
    
    // Toggle selection
    if (selectedSlot?.startTime === slot.startTime) {
      onSlotChange(null);
    } else {
      onSlotChange(slot);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 0',
        textAlign: 'center'
      }}>
        <Loader2 style={{
          width: '48px',
          height: '48px',
          color: '#2F8BFF',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <p style={{
          color: '#64748b',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Loading available time slots...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '1.5rem',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <AlertCircle style={{
            width: '24px',
            height: '24px',
            color: '#ef4444',
            flexShrink: 0
          }} />
          <div>
            <h4 style={{
              fontWeight: '600',
              color: '#991b1b',
              marginBottom: '0.25rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Error Loading Time Slots
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#dc2626',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {error}
            </p>
            <Button 
              onClick={fetchAvailableSlots}
              variant="outline"
              style={{
                marginTop: '0.75rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div style={{
        padding: '1.5rem',
        background: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <AlertCircle style={{
            width: '24px',
            height: '24px',
            color: '#fbbf24',
            flexShrink: 0
          }} />
          <div>
            <h4 style={{
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '0.25rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              No Slots Available
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: '#d97706',
              fontFamily: 'Poppins, sans-serif'
            }}>
              There are no available time slots for {date.toLocaleDateString()}. 
              Please select a different date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h3 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#0A2C5E',
          marginBottom: '0.5rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Select Time Slot
        </h3>
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Choose your preferred appointment time for {date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Time Slots Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {slots.map((slot) => {
          const isSelected = selectedSlot?.startTime === slot.startTime;
          
          return (
            <div
              key={slot.startTime}
              onClick={() => handleSlotSelect(slot)}
              style={{
                background: !slot.isAvailable 
                  ? '#f1f5f9'
                  : isSelected 
                    ? 'linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)'
                    : slot.capacityRemaining === 1
                      ? 'rgba(251, 191, 36, 0.1)'
                      : '#042A5C',
                border: !slot.isAvailable 
                  ? '1px solid #cbd5e1'
                  : isSelected 
                    ? '2px solid #2F8BFF'
                    : slot.capacityRemaining === 1
                      ? '1px solid rgba(251, 191, 36, 0.5)'
                      : '1px solid rgba(47, 139, 255, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                opacity: slot.isAvailable ? 1 : 0.6,
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (slot.isAvailable && !isSelected) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(47, 139, 255, 0.2)';
                  if (slot.capacityRemaining === 1) {
                    e.currentTarget.style.border = '1px solid #fbbf24';
                  } else {
                    e.currentTarget.style.border = '1px solid #2F8BFF';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (slot.isAvailable && !isSelected) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  if (slot.capacityRemaining === 1) {
                    e.currentTarget.style.border = '1px solid rgba(251, 191, 36, 0.5)';
                  } else {
                    e.currentTarget.style.border = '1px solid rgba(47, 139, 255, 0.3)';
                  }
                }
              }}
            >
              {/* Selection Check */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Clock 
                  color={!slot.isAvailable ? '#94a3b8' : isSelected ? '#2F8BFF' : slot.capacityRemaining === 1 ? '#fbbf24' : '#2F8BFF'} 
                  size={24} 
                />
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: !slot.isAvailable ? '#94a3b8' : isSelected ? 'white' : slot.capacityRemaining === 1 ? '#d97706' : 'white',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {slot.displayTime}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: !slot.isAvailable ? '#cbd5e1' : isSelected ? '#93c5fd' : slot.capacityRemaining === 1 ? '#fde68a' : '#93c5fd',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {slot.displayEndTime}
                  </p>
                </div>
              </div>

              <div style={{
                paddingTop: '0.75rem',
                borderTop: `1px solid ${!slot.isAvailable ? '#e2e8f0' : isSelected ? 'rgba(147, 197, 253, 0.3)' : slot.capacityRemaining === 1 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(147, 197, 253, 0.2)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: !slot.isAvailable ? '#94a3b8' : isSelected ? '#93c5fd' : slot.capacityRemaining === 1 ? '#d97706' : '#93c5fd',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {!slot.isAvailable ? 'Fully Booked' : slot.capacityRemaining === 1 ? 'Last Slot!' : `${slot.capacityRemaining} spots left`}
                </span>
                {slot.isAvailable && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isSelected ? '#10b981' : slot.capacityRemaining === 1 ? '#fbbf24' : '#2F8BFF'
                  }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Slot Summary */}
      {selectedSlot && (
        <div style={{
          background: 'linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #2F8BFF',
          boxShadow: '0 4px 12px rgba(10, 44, 94, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Clock color="#10b981" size={24} />
            <div>
              <p style={{
                fontSize: '0.875rem',
                color: '#93c5fd',
                marginBottom: '0.25rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Selected Time
              </p>
              <p style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'white',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {selectedSlot.displayTime} - {selectedSlot.displayEndTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        background: '#042A5C',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid rgba(47, 139, 255, 0.3)'
      }}>
        <h4 style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'white',
          marginBottom: '1rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Slot Status Legend
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#042A5C',
              border: '1px solid rgba(47, 139, 255, 0.5)',
              flexShrink: 0
            }} />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#93c5fd',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Available
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.5)',
              flexShrink: 0
            }} />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#93c5fd',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Limited
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)',
              border: '2px solid #2F8BFF',
              flexShrink: 0
            }} />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#93c5fd',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Selected
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              flexShrink: 0
            }} />
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#93c5fd',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Booked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
