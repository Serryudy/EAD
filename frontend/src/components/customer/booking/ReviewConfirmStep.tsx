/**
 * Review & Confirm Step
 * 
 * Final review of booking details before submission
 */

import { useState } from 'react';
import { Button } from '../../ui/button';
import { 
  CheckSquare, 
  Wrench, 
  Car, 
  Calendar, 
  Clock, 
  Edit2, 
  Loader2,
  DollarSign,
  FileText,
  Wind,
  Battery,
  Droplet,
  CircleDot,
  Cog
} from 'lucide-react';
import { Textarea } from '../../ui/textarea';
import type { BookingData } from './BookingWizard';
import type { User } from '../../../contexts/AuthContext';

interface ReviewConfirmStepProps {
  bookingData: BookingData;
  user: User;
  onSpecialInstructionsChange: (instructions: string) => void;
  onConfirm: () => void;
  onEditStep: (step: 'services' | 'vehicles' | 'date' | 'time') => void;
  isSubmitting?: boolean;
}

export default function ReviewConfirmStep({
  bookingData,
  user,
  onSpecialInstructionsChange,
  onConfirm,
  onEditStep,
  isSubmitting = false
}: ReviewConfirmStepProps) {
  const [localInstructions, setLocalInstructions] = useState(bookingData.specialInstructions);

  // Calculate total cost
  const totalCost = bookingData.services.reduce((sum, service) => {
    return sum + (service.basePrice * bookingData.vehicles.length);
  }, 0);

  // Calculate total duration
  const totalDuration = bookingData.services.reduce((sum, service) => {
    return sum + service.estimatedDuration;
  }, 0);

  const handleInstructionsChange = (value: string) => {
    setLocalInstructions(value);
    onSpecialInstructionsChange(value);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h3 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#0A2C5E',
          marginBottom: '0.5rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Review & Confirm Booking
        </h3>
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Please review your appointment details before confirming
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Services Summary */}
        <div style={{
          background: '#042A5C',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(47, 139, 255, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(47, 139, 255, 0.3)'
              }}>
                <Wrench color="white" size={28} />
              </div>
              <div>
                <h4 style={{
                  fontWeight: '700',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Selected Services
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#93c5fd',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {bookingData.services.length} service(s) selected
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep('services')}
              style={{
                color: '#2F8BFF',
                borderColor: '#2F8BFF',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              <Edit2 style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} />
              Edit
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookingData.services.map((service) => {
              return (
              <div
                key={service._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(10, 44, 94, 0.5) 0%, rgba(27, 76, 140, 0.5) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(47, 139, 255, 0.3)'
                }}
              >
                {/* Service Icon */}
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  flexShrink: 0
                }}>
                  {service.name.toLowerCase().includes('ac') && <Wind color="white" size={28} />}
                  {service.name.toLowerCase().includes('battery') && <Battery color="white" size={28} />}
                  {service.name.toLowerCase().includes('oil') && <Droplet color="white" size={28} />}
                  {service.name.toLowerCase().includes('brake') && <CircleDot color="white" size={28} />}
                  {service.name.toLowerCase().includes('coolant') && <Droplet color="white" size={28} />}
                  {service.name.toLowerCase().includes('engine') && <Cog color="white" size={28} />}
                  {!service.name.toLowerCase().includes('ac') && 
                   !service.name.toLowerCase().includes('battery') && 
                   !service.name.toLowerCase().includes('oil') && 
                   !service.name.toLowerCase().includes('brake') &&
                   !service.name.toLowerCase().includes('coolant') &&
                   !service.name.toLowerCase().includes('engine') && 
                   <Wrench color="white" size={28} />}
                </div>
                
                {/* Service Details */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: '600',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {service.name}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#93c5fd',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {service.category}
                  </p>
                </div>
                
                {/* Price & Duration */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontWeight: '700',
                    fontSize: '1.125rem',
                    color: '#10b981',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    ${service.basePrice.toFixed(2)}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#93c5fd',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    ~{service.estimatedDuration}h
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Vehicles Summary */}
        <div style={{
          background: '#042A5C',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(47, 139, 255, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <Car color="white" size={28} />
              </div>
              <div>
                <h4 style={{
                  fontWeight: '700',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Selected Vehicles
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#93c5fd',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {bookingData.vehicles.length} vehicle(s) selected
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep('vehicles')}
              style={{
                color: '#10b981',
                borderColor: '#10b981',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              <Edit2 style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} />
              Edit
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookingData.vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(10, 44, 94, 0.5) 0%, rgba(27, 76, 140, 0.5) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(47, 139, 255, 0.3)'
                }}
              >
                <Car color="#10b981" size={24} />
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: '600',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#93c5fd',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {vehicle.licensePlate}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '0.375rem 0.875rem',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid #10b981',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {vehicle.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time Summary */}
        <div style={{
          background: '#042A5C',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(47, 139, 255, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
              }}>
                <Calendar color="white" size={28} />
              </div>
              <div>
                <h4 style={{
                  fontWeight: '700',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Date & Time
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#93c5fd',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Appointment schedule
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep('time')}
              style={{
                color: '#a855f7',
                borderColor: '#a855f7',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              <Edit2 style={{ width: '16px', height: '16px', marginRight: '0.25rem' }} />
              Edit
            </Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Calendar color="#a855f7" size={20} />
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#e0e7ff',
                  fontFamily: 'Poppins, sans-serif'
                }}>Date</span>
              </div>
              <p style={{
                fontWeight: '700',
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {bookingData.date?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(37, 99, 235, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock color="#2563eb" size={20} />
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#e0e7ff',
                  fontFamily: 'Poppins, sans-serif'
                }}>Time Slot</span>
              </div>
              <p style={{
                fontWeight: '700',
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {bookingData.timeSlot?.displayTime} - {bookingData.timeSlot?.displayEndTime}
              </p>
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div style={{
          background: '#042A5C',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(37, 99, 235, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <DollarSign color="white" size={28} />
            </div>
            <div>
              <h4 style={{
                fontWeight: '700',
                color: 'white',
                fontSize: '1.125rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Cost Summary
              </h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#93c5fd',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Estimated total cost
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px'
            }}>
              <span style={{
                fontWeight: '500',
                color: '#e0e7ff',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>Services ({bookingData.services.length})</span>
              <span style={{
                fontWeight: '600',
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>
                ${bookingData.services.reduce((sum, s) => sum + s.basePrice, 0).toFixed(2)}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px'
            }}>
              <span style={{
                fontWeight: '500',
                color: '#e0e7ff',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>Vehicles ({bookingData.vehicles.length})</span>
              <span style={{
                fontWeight: '600',
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>× {bookingData.vehicles.length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px'
            }}>
              <span style={{
                fontWeight: '500',
                color: '#e0e7ff',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>Estimated Duration</span>
              <span style={{
                fontWeight: '600',
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>~{totalDuration}h</span>
            </div>
            <div style={{ paddingTop: '0.75rem', borderTop: '2px solid rgba(37, 99, 235, 0.5)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
              }}>
                <span style={{
                  fontWeight: '700',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>Total Estimate</span>
                <span style={{
                  fontWeight: '700',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <div style={{
          background: '#042A5C',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(47, 139, 255, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <FileText color="white" size={24} />
            </div>
            <div>
              <h4 style={{
                fontWeight: '600',
                color: 'white',
                fontSize: '1rem',
                fontFamily: 'Poppins, sans-serif'
              }}>Special Instructions</h4>
              <p style={{
                fontSize: '0.875rem',
                color: '#93c5fd',
                fontFamily: 'Poppins, sans-serif'
              }}>Optional notes for the service team</p>
            </div>
          </div>
          <Textarea
            placeholder="Any specific concerns or requests? (optional)"
            value={localInstructions}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            style={{
              minHeight: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(47, 139, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              padding: '0.75rem',
              fontFamily: 'Poppins, sans-serif',
              resize: 'vertical'
            }}
            maxLength={500}
          />
          <p style={{
            fontSize: '0.75rem',
            color: '#93c5fd',
            marginTop: '0.5rem',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {localInstructions.length}/500 characters
          </p>
        </div>

        {/* Customer Info */}
        <div style={{
          background: '#042A5C',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(47, 139, 255, 0.3)'
        }}>
          <h4 style={{
            fontWeight: '600',
            color: 'white',
            fontSize: '1rem',
            marginBottom: '1rem',
            fontFamily: 'Poppins, sans-serif'
          }}>Customer Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{
                color: '#93c5fd',
                fontFamily: 'Poppins, sans-serif'
              }}>Name:</span>
              <p style={{
                fontWeight: '500',
                color: 'white',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <span style={{
                color: '#93c5fd',
                fontFamily: 'Poppins, sans-serif'
              }}>Phone:</span>
              <p style={{
                fontWeight: '500',
                color: 'white',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {user.phone || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              flex: 1,
              background: isSubmitting 
                ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)' 
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
              color: 'white',
              padding: '1.75rem 1.5rem',
              fontSize: '1.25rem',
              fontWeight: '700',
              boxShadow: isSubmitting ? 'none' : '0 8px 16px rgba(37, 99, 235, 0.4)',
              borderRadius: '12px',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.3s ease'
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <Loader2 color="white" size={24} style={{ animation: 'spin 1s linear infinite' }} />
                Creating Your Appointment...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <CheckSquare color="white" size={24} />
                Confirm & Book Appointment
              </span>
            )}
          </Button>
        </div>

        {/* Terms */}
        <p className="text-xs text-center text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
          🔒 By confirming, you agree to our service terms and cancellation policy.
          You will receive a confirmation email and SMS shortly.
        </p>
      </div>
    </div>
  );
}
