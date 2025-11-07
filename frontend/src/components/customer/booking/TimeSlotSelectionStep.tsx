/**
 * Time Slot Selection Step
 * 
 * Allows customers to select an available time slot for their appointment
 */

import { useEffect, useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Clock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

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

interface SlotSummary {
  fullyAvailable: number;
  limitedAvailable: number;
  fullyBooked: number;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SlotSummary | null>(null);

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

      // Use native fetch with auth token
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:5000/api/appointments/available-slots?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setSlots(data.slots || []);
        setSummary(data.summary);
      } else {
        setError(data.message || 'Failed to load time slots');
      }
    } catch (err) {
      console.error('Error fetching time slots:', err);
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

  const getSlotStyle = (slot: TimeSlot) => {
    const isSelected = selectedSlot?.startTime === slot.startTime;
    
    if (!slot.isAvailable) {
      return 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
    }
    
    if (isSelected) {
      return 'bg-gradient-to-br from-[#0077b6] to-[#023e8a] border-[#03045e] text-white shadow-xl scale-105 ring-4 ring-blue-200';
    }
    
    if (slot.capacityRemaining === 1) {
      return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 text-amber-900 hover:shadow-lg hover:scale-102 hover:border-amber-400 transition-all';
    }
    
    return 'bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200 text-sky-900 hover:shadow-lg hover:scale-102 hover:border-sky-300 transition-all';
  };

  const getCapacityBadge = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      return <span className="text-xs text-slate-500">Fully Booked</span>;
    }
    
    if (slot.capacityRemaining === 1) {
      return <span className="text-xs text-amber-600 font-semibold">Last Slot!</span>;
    }
    
    return <span className="text-xs text-sky-600">{slot.capacityRemaining} spots left</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600">Loading available time slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-900 mb-1">Error Loading Time Slots</h4>
            <p className="text-sm text-red-700">{error}</p>
            <Button 
              onClick={fetchAvailableSlots}
              variant="outline"
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-1">No Slots Available</h4>
            <p className="text-sm text-amber-700">
              There are no available time slots for {date.toLocaleDateString()}. 
              Please select a different date.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#03045e] mb-2">
          Select Time Slot
        </h3>
        <p className="text-slate-600">
          Choose your preferred appointment time for {date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 border-sky-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-br from-sky-600 to-blue-700 bg-clip-text text-transparent">
                {summary.fullyAvailable}
              </div>
              <div className="text-xs text-sky-700 font-semibold mt-1">Plenty Available</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-amber-300 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-transparent">
                {summary.limitedAvailable}
              </div>
              <div className="text-xs text-amber-700 font-semibold mt-1">Limited Slots</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-slate-100 via-slate-150 to-slate-200 border-slate-300 shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-600">
                {summary.fullyBooked}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1">Fully Booked</div>
            </div>
          </Card>
        </div>
      )}

      {/* Time Slots Grid */}
      <Card className="p-6 shadow-md">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {slots.map((slot) => (
            <button
              key={slot.startTime}
              onClick={() => handleSlotSelect(slot)}
              disabled={!slot.isAvailable}
              className={`
                relative p-5 rounded-xl border-2 transition-all duration-300
                ${getSlotStyle(slot)}
                ${!slot.isAvailable ? '' : 'cursor-pointer active:scale-95'}
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <Clock className={`w-6 h-6 ${selectedSlot?.startTime === slot.startTime ? 'text-white' : ''}`} />
                <div className="font-bold text-lg">{slot.displayTime}</div>
                <div className="text-sm opacity-80">{slot.displayEndTime}</div>
                <div className="mt-1">
                  {getCapacityBadge(slot)}
                </div>
                
                {selectedSlot?.startTime === slot.startTime && (
                  <CheckCircle2 className="w-6 h-6 absolute top-2 right-2 text-white animate-pulse" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">Slot Status Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 shadow-sm" />
              <span className="text-sm font-medium text-slate-700">Available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 shadow-sm" />
              <span className="text-sm font-medium text-slate-700">Limited</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0077b6] to-[#023e8a] border-2 border-[#03045e] shadow-lg" />
              <span className="text-sm font-medium text-slate-700">Selected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border-2 border-slate-200" />
              <span className="text-sm font-medium text-slate-500">Booked</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Selected Slot Info */}
      {selectedSlot && (
        <Card className="mt-6 p-5 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 border-blue-300 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0077b6] to-[#023e8a] flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2 text-lg">Selected Time Slot</h4>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                {selectedSlot.displayTime} - {selectedSlot.displayEndTime}
              </p>
              <p className="text-sm text-blue-700 mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {selectedSlot.capacityRemaining} {selectedSlot.capacityRemaining === 1 ? 'slot' : 'slots'} remaining
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
