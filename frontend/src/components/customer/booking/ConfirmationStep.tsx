/**
 * Confirmation Step
 * 
 * Displays successful booking confirmation with appointment details
 */

import { Card } from '../../ui/card';
import { CheckCircle2, Calendar, Clock, Car, Wrench, FileText, Home, CalendarPlus } from 'lucide-react';
import { Button } from '../../ui/button';
import type { BookingData } from './BookingWizard';

interface AppointmentResponse {
  _id?: string;
  appointmentNumber?: string;
  status?: string;
  [key: string]: unknown;
}

interface ConfirmationStepProps {
  appointment: AppointmentResponse | null;
  bookingData: BookingData;
  onComplete: () => void;
  onBookAnother: () => void;
}

export default function ConfirmationStep({
  appointment,
  bookingData,
  onComplete,
  onBookAnother
}: ConfirmationStepProps) {
  const referenceNumber = appointment?.appointmentNumber || appointment?._id?.slice(-8).toUpperCase() || 'PENDING';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div 
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
          }}
        >
          <CheckCircle2 style={{ width: '48px', height: '48px', color: 'white' }} />
        </div>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#0A2C5E',
          marginBottom: '0.5rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Booking Confirmed!
        </h2>
        <p style={{
          color: '#64748b',
          fontSize: '1.125rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Your appointment has been successfully scheduled
        </p>
      </div>

      {/* Reference Number */}
      <div style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 12px rgba(10, 44, 94, 0.15)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#93c5fd',
            marginBottom: '0.5rem',
            fontWeight: '500',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Reference Number
          </p>
          <p style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'white',
            letterSpacing: '0.1em',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {referenceNumber}
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#bfdbfe',
            marginTop: '0.5rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Please save this reference number for your records
          </p>
        </div>
      </div>

      {/* Appointment Details */}
      <div style={{
        background: '#042A5C',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #2F8BFF',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'white',
          marginBottom: '1rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Appointment Details
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Date & Time */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(47, 139, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(47, 139, 255, 0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Calendar color="white" size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#93c5fd',
                marginBottom: '0.25rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Date & Time
              </p>
              <p style={{
                fontWeight: '600',
                color: 'white',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {bookingData.date?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              {bookingData.timeSlot && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <Clock color="#a855f7" size={16} />
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#e0e7ff',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {bookingData.timeSlot.displayTime} - {bookingData.timeSlot.displayEndTime}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(47, 139, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(47, 139, 255, 0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Wrench color="white" size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#93c5fd',
                marginBottom: '0.5rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Services ({bookingData.services.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {bookingData.services.map((service) => (
                  <div key={service._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'white',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      • {service.name}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#93c5fd',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      ${service.basePrice.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicles */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(47, 139, 255, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(47, 139, 255, 0.2)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Car color="white" size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#93c5fd',
                marginBottom: '0.5rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Vehicles ({bookingData.vehicles.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {bookingData.vehicles.map((vehicle) => (
                  <p key={vehicle._id} style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    • {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {bookingData.specialInstructions && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '1rem',
              background: 'rgba(47, 139, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(47, 139, 255, 0.2)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText color="white" size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#93c5fd',
                  marginBottom: '0.25rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Special Instructions
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#e0e7ff',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {bookingData.specialInstructions}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        borderRadius: '12px',
        border: '1px solid #6ee7b7',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <CheckCircle2 style={{ width: '24px', height: '24px', color: '#059669', flexShrink: 0 }} />
          <div>
            <h4 style={{
              fontWeight: '600',
              color: '#065f46',
              marginBottom: '0.5rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              What's Next?
            </h4>
            <ul style={{
              fontSize: '0.875rem',
              color: '#047857',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              <li>✓ You will receive a confirmation email shortly</li>
              <li>✓ A service team member will be assigned to your appointment</li>
              <li>✓ You can track your appointment status in your dashboard</li>
              <li>✓ You will receive a reminder 24 hours before your appointment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <Button
          onClick={onComplete}
          variant="outline"
          style={{
            padding: '1.5rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            border: '2px solid #2F8BFF',
            color: '#0A2C5E',
            background: 'white',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <Home style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
          Go to Dashboard
        </Button>
        <Button
          onClick={onBookAnother}
          style={{
            padding: '1.5rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)',
            color: 'white',
            border: 'none',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <CalendarPlus style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
          Book Another Appointment
        </Button>
      </div>

      {/* Footer Note */}
      <p style={{
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#64748b',
        marginTop: '1.5rem',
        fontFamily: 'Poppins, sans-serif'
      }}>
        Need to make changes? Contact us at (555) 123-4567 or visit your dashboard to manage your appointments.
      </p>
    </div>
  );
}
