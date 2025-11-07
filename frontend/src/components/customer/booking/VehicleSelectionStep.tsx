/**
 * Vehicle Selection Step
 * 
 * Display customer's registered vehicles and allow selection
 * Includes inline "Add Vehicle" functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Car, Plus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Vehicle } from './BookingWizard';

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
      const token = sessionStorage.getItem('authToken');
      
      // Must have token - user should be authenticated
      if (!token) {
        console.error('No auth token found');
        setVehicles([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      const vehiclesList = Array.isArray(data) ? data : (data.vehicles || data.data || []);
      setVehicles(vehiclesList);
      
      // Auto-select if only one vehicle
      if (vehiclesList.length === 1 && selectedVehicles.length === 0) {
        onVehiclesChange([vehiclesList[0]]);
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
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Please login to add vehicles');
        return;
      }

      const response = await fetch('http://localhost:5000/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          licensePlate: newVehicle.licensePlate.toUpperCase(),
          make: newVehicle.make,
          model: newVehicle.model,
          year: parseInt(newVehicle.year.toString()),
          type: newVehicle.type,
          mileage: newVehicle.mileage ? parseInt(newVehicle.mileage) : undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add vehicle');
      }

      const result = await response.json();
      const addedVehicle = result.vehicle || result.data || result;
      
      toast.success('Vehicle added successfully!');
      
      // Refresh vehicle list
      await fetchVehicles();
      
      // Auto-select the new vehicle
      onVehiclesChange([...selectedVehicles, addedVehicle]);
      
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
      
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add vehicle');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0077b6]" />
      </div>
    );
  }

  // Empty state - no vehicles
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No Vehicles Found
        </h3>
        <p className="text-slate-600 mb-6">
          You haven't added any vehicles yet. Add your first vehicle to continue booking.
        </p>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-[#0077b6] hover:bg-[#03045e]"
        >
          <Plus className="w-4 h-4 mr-2" />
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
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#03045e] mb-2">
          Select Vehicle(s)
        </h3>
        <p className="text-slate-600">
          Choose one or more vehicles for this appointment
        </p>
      </div>

      {/* Vehicles Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {vehicles.map((vehicle) => (
          <Card
            key={vehicle._id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              isSelected(vehicle._id)
                ? 'border-2 border-[#0077b6] bg-blue-50'
                : 'border-slate-200'
            }`}
            onClick={() => handleToggleVehicle(vehicle)}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected(vehicle._id)}
                onCheckedChange={() => handleToggleVehicle(vehicle)}
                className="mt-1"
              />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-5 h-5 text-[#0077b6]" />
                  <h4 className="font-semibold text-slate-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">License Plate:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {vehicle.licensePlate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="text-slate-900">{vehicle.type}</span>
                  </div>
                  {vehicle.mileage && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Mileage:</span>
                      <span className="text-slate-900">{vehicle.mileage.toLocaleString()} mi</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* Add New Vehicle Card */}
        <Card
          className="p-4 cursor-pointer border-2 border-dashed border-slate-300 hover:border-[#0077b6] transition-colors flex items-center justify-center min-h-[140px]"
          onClick={() => setShowAddDialog(true)}
        >
          <div className="text-center">
            <Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Add New Vehicle</p>
          </div>
        </Card>
      </div>

      {/* Multi-vehicle warning */}
      {selectedVehicles.length > 1 && (
        <Card className="p-4 bg-blue-50 border-blue-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              Multiple Vehicles Selected
            </p>
            <p className="text-sm text-blue-700">
              Appointments will be scheduled sequentially for {selectedVehicles.length} vehicles.
              Total duration will be approximately {selectedVehicles.length}x longer.
            </p>
          </div>
        </Card>
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
