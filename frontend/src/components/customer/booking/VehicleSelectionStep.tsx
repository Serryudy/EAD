/**
 * Vehicle Selection Step
 * 
 * Display customer's registered vehicles and allow selection
 * Includes inline "Add Vehicle" functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Car, Plus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Vehicle } from './BookingWizard';
import { vehicleApi } from '../../../services/api';

interface VehicleSelectionStepProps {
  selectedVehicles: Vehicle[];
  onVehiclesChange: (vehicles: Vehicle[]) => void;
}

interface NewVehicleForm {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  type: string;
  mileage: string;
}

export default function VehicleSelectionStep({
  selectedVehicles,
  onVehiclesChange
}: VehicleSelectionStepProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [adding, setAdding] = useState(false);

  // Add vehicle form state
  const [newVehicle, setNewVehicle] = useState<NewVehicleForm>({
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'Sedan',
    mileage: ''
  });

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vehicleApi.getUserVehicles();
      
      if (response.success && response.data) {
        const vehiclesList = response.data;
        setVehicles(vehiclesList);
        
        // Auto-select if only one vehicle
        if (vehiclesList.length === 1 && selectedVehicles.length === 0) {
          onVehiclesChange([vehiclesList[0]]);
        }
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles. Please try again.');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedVehicles.length, onVehiclesChange]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleToggleVehicle = (vehicle: Vehicle) => {
    const isSelected = selectedVehicles.some(v => v._id === vehicle._id);
    
    if (isSelected) {
      onVehiclesChange(selectedVehicles.filter(v => v._id !== vehicle._id));
    } else {
      onVehiclesChange([...selectedVehicles, vehicle]);
    }
  };

  const isSelected = (vehicleId: string) => {
    return selectedVehicles.some(v => v._id === vehicleId);
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setAdding(true);

      const response = await vehicleApi.addVehicle({
        licensePlate: newVehicle.licensePlate.toUpperCase(),
        make: newVehicle.make,
        model: newVehicle.model,
        year: parseInt(newVehicle.year.toString()),
        type: newVehicle.type,
        mileage: newVehicle.mileage ? parseInt(newVehicle.mileage) : undefined
      });

      if (response.success && response.data) {
        toast.success('Vehicle added successfully!');
        
        // Refresh vehicle list
        await fetchVehicles();
        
        // Auto-select the new vehicle
        onVehiclesChange([...selectedVehicles, response.data]);
        
        // Reset form and close dialog
        setNewVehicle({
          licensePlate: '',
          make: '',
          model: '',
          year: new Date().getFullYear(),
          type: 'Sedan',
          mileage: ''
        });
        setShowAddDialog(false);
      } else {
        throw new Error(response.message || 'Failed to add vehicle');
      }
      
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add vehicle');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 0',
        textAlign: 'center'
      }}>
        <div>
          <Loader2 style={{
            width: '48px',
            height: '48px',
            color: '#2F8BFF',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{
            color: '#64748b',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Loading vehicles...
          </p>
        </div>
      </div>
    );
  }

  // Empty state - no vehicles
  if (vehicles.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        background: '#042A5C',
        borderRadius: '12px',
        border: '1px solid #2F8BFF'
      }}>
        <Car style={{
          width: '64px',
          height: '64px',
          color: '#2F8BFF',
          margin: '0 auto 1rem'
        }} />
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'white',
          marginBottom: '0.5rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          No Vehicles Found
        </h3>
        <p style={{
          color: '#93c5fd',
          marginBottom: '1.5rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          You haven't added any vehicles yet. Add your first vehicle to continue booking.
        </p>
        <Button
          onClick={() => setShowAddDialog(true)}
          style={{
            background: 'linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '600',
            fontFamily: 'Poppins, sans-serif',
            border: 'none'
          }}
        >
          <Plus style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} />
          Add Vehicle Now
        </Button>

        {/* Add Vehicle Dialog */}
        <AddVehicleDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          newVehicle={newVehicle}
          setNewVehicle={setNewVehicle}
          onSubmit={handleAddVehicle}
          loading={adding}
        />
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
          Select Vehicle(s)
        </h3>
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Choose one or more vehicles for this appointment
        </p>
      </div>

      {/* Vehicles Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {vehicles.map((vehicle) => {
          const selected = isSelected(vehicle._id);
          
          return (
            <div
              key={vehicle._id}
              onClick={() => handleToggleVehicle(vehicle)}
              style={{
                background: selected ? 'linear-gradient(135deg, #0A2C5E 0%, #1B4C8C 100%)' : '#042A5C',
                border: selected ? '2px solid #2F8BFF' : '1px solid rgba(47, 139, 255, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.border = '1px solid #2F8BFF';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(47, 139, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.border = '1px solid rgba(47, 139, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Selection Check */}
              {selected && (
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

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: selected 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <Car color="white" size={28} />
                </div>

                <div style={{ flex: 1 }}>
                  {/* Vehicle Name */}
                  <h4 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '0.75rem',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>

                  {/* Details */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#93c5fd',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        License Plate:
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'white',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}>
                        {vehicle.licensePlate}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#93c5fd',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        Type:
                      </span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#e0e7ff',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {vehicle.type}
                      </span>
                    </div>
                    {vehicle.mileage && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          color: '#93c5fd',
                          fontFamily: 'Poppins, sans-serif'
                        }}>
                          Mileage:
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: '#e0e7ff',
                          fontFamily: 'Poppins, sans-serif'
                        }}>
                          {vehicle.mileage.toLocaleString()} mi
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Vehicle Card */}
        <div
          onClick={() => setShowAddDialog(true)}
          style={{
            background: '#042A5C',
            border: '2px dashed rgba(47, 139, 255, 0.5)',
            borderRadius: '12px',
            padding: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '180px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = '2px dashed #2F8BFF';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(47, 139, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '2px dashed rgba(47, 139, 255, 0.5)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Plus style={{
              width: '32px',
              height: '32px',
              color: '#2F8BFF',
              margin: '0 auto 0.5rem'
            }} />
            <p style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#93c5fd',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Add New Vehicle
            </p>
          </div>
        </div>
      </div>

      {/* Multi-vehicle warning */}
      {selectedVehicles.length > 1 && (
        <div style={{
          padding: '1rem',
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle style={{
            width: '20px',
            height: '20px',
            color: '#fbbf24',
            flexShrink: 0,
            marginTop: '0.125rem'
          }} />
          <div>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#fbbf24',
              marginBottom: '0.25rem',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Multiple Vehicles Selected
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#fde68a',
              fontFamily: 'Poppins, sans-serif'
            }}>
              Appointments will be scheduled sequentially for {selectedVehicles.length} vehicles.
              Total duration will be approximately {selectedVehicles.length}x longer.
            </p>
          </div>
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <AddVehicleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        newVehicle={newVehicle}
        setNewVehicle={setNewVehicle}
        onSubmit={handleAddVehicle}
        loading={adding}
      />
    </div>
  );
}

// Add Vehicle Dialog Component
interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newVehicle: NewVehicleForm;
  setNewVehicle: (vehicle: NewVehicleForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

function AddVehicleDialog({
  open,
  onOpenChange,
  newVehicle,
  setNewVehicle,
  onSubmit,
  loading
}: AddVehicleDialogProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="licensePlate">License Plate *</Label>
            <Input
              id="licensePlate"
              placeholder="ABC-1234"
              value={newVehicle.licensePlate}
              onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
              required
              className="uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                placeholder="Toyota"
                value={newVehicle.make}
                onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                placeholder="Camry"
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year *</Label>
              <Select
                value={newVehicle.year.toString()}
                onValueChange={(value) => setNewVehicle({ ...newVehicle, year: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={newVehicle.type}
                onValueChange={(value) => setNewVehicle({ ...newVehicle, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Coupe">Coupe</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                  <SelectItem value="Convertible">Convertible</SelectItem>
                  <SelectItem value="Wagon">Wagon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="mileage">Mileage (optional)</Label>
            <Input
              id="mileage"
              type="number"
              placeholder="50000"
              value={newVehicle.mileage}
              onChange={(e) => setNewVehicle({ ...newVehicle, mileage: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0077b6] hover:bg-[#03045e]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
