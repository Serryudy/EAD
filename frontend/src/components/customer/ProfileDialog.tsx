import { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, Car, Plus, X, Save, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { userApi, vehicleApi, type UserUpdateDto } from '../../services/api';
import type { User as UserType } from '../../contexts/AuthContext';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface ProfileDialogProps {
  user: UserType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ user, open, onOpenChange }: ProfileDialogProps) {
  const { refreshUser } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email || '',
    nic: user.nic || '',
  });
  
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: ''
  });

  const [editingVehicle, setEditingVehicle] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: ''
  });

  // Load user data from sessionStorage and vehicles when dialog opens
  useEffect(() => {
    if (open) {
      loadUserData();
      loadVehicles();
    }
  }, [open]);

  const loadUserData = () => {
    // Fetch fresh user data from sessionStorage
    const userData = sessionStorage.getItem('user');
    console.log('📋 Loading user data from sessionStorage:', userData);
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Parsed user:', parsedUser);
        setUserProfile({
          firstName: parsedUser.firstName || user.firstName,
          lastName: parsedUser.lastName || user.lastName,
          email: parsedUser.email || user.email || '',
          nic: parsedUser.nic || user.nic || '',
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        setUserProfile({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email || '',
          nic: user.nic || '',
        });
      }
    }
  };

  const loadVehicles = async () => {
    try {
      setLoading(true);
      console.log('🚗 Loading vehicles...');
      const token = sessionStorage.getItem('authToken');
      console.log('Token available:', !!token, 'Token value:', token?.substring(0, 20) + '...');
      
      const response = await vehicleApi.getUserVehicles();
      console.log('✅ Vehicles loaded:', response);
      if (response.success) {
        setVehicles(response.data);
      }
    } catch (error) {
      console.error('❌ Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updateData: UserUpdateDto = {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        nic: userProfile.nic || undefined,
      };

      const response = await userApi.updateProfile(updateData);
      if (response.success) {
        // Update sessionStorage with new user data
        const currentUser = sessionStorage.getItem('user');
        if (currentUser) {
          const parsedUser = JSON.parse(currentUser);
          const updatedUser = {
            ...parsedUser,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
            nic: userProfile.nic,
          };
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        setEditMode(false);
        await refreshUser(); // Refresh user data in context
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + response.message);
      }
    } catch (error: any) {
      alert('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setEditingVehicle({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      licensePlate: vehicle.licensePlate
    });
  };

  const handleUpdateVehicle = async (id: number) => {
    try {
      setLoading(true);
      const vehicleData = {
        make: editingVehicle.make,
        model: editingVehicle.model,
        year: parseInt(editingVehicle.year),
        licensePlate: editingVehicle.licensePlate
      };

      const response = await vehicleApi.updateVehicle(id.toString(), vehicleData);
      if (response.success) {
        setVehicles(vehicles.map(v => v.id === id ? { ...v, ...vehicleData } : v));
        setEditingVehicleId(null);
        alert('Vehicle updated successfully!');
      } else {
        alert('Failed to update vehicle: ' + response.message);
      }
    } catch (error: any) {
      alert('Failed to update vehicle: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditVehicle = () => {
    setEditingVehicleId(null);
    setEditingVehicle({
      make: '',
      model: '',
      year: '',
      licensePlate: ''
    });
  };

  const handleAddVehicle = async () => {
    if (newVehicle.make && newVehicle.model && newVehicle.year && newVehicle.licensePlate) {
      try {
        setLoading(true);
        const vehicleData = {
          make: newVehicle.make,
          model: newVehicle.model,
          year: parseInt(newVehicle.year),
          licensePlate: newVehicle.licensePlate
        };

        const response = await vehicleApi.addVehicle(vehicleData);
        if (response.success) {
          setVehicles([...vehicles, response.data]);
          setNewVehicle({ make: '', model: '', year: '', licensePlate: '' });
          setShowAddVehicle(false);
        } else {
          alert('Failed to add vehicle: ' + response.message);
        }
      } catch (error: any) {
        alert('Failed to add vehicle: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveVehicle = async (id: number) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await vehicleApi.deleteVehicle(id.toString());
      if (response.success) {
        setVehicles(vehicles.filter(v => v.id !== id));
        alert('Vehicle removed successfully!');
      } else {
        alert('Failed to remove vehicle: ' + response.message);
      }
    } catch (error: any) {
      alert('Failed to remove vehicle: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#03045e]">Profile Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#03045e] flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                disabled={loading}
                className="text-[#0077b6] border-[#0077b6] hover:bg-[#0077b6] hover:text-white"
              >
                {editMode ? (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input 
                  value={editMode ? userProfile.firstName : user.firstName} 
                  onChange={(e) => editMode && setUserProfile({...userProfile, firstName: e.target.value})}
                  disabled={!editMode || loading} 
                  className={editMode ? "border-[#0077b6] focus:border-[#03045e]" : "bg-slate-50"} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input 
                  value={editMode ? userProfile.lastName : user.lastName} 
                  onChange={(e) => editMode && setUserProfile({...userProfile, lastName: e.target.value})}
                  disabled={!editMode || loading} 
                  className={editMode ? "border-[#0077b6] focus:border-[#03045e]" : "bg-slate-50"} 
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input 
                  value={editMode ? userProfile.email : user.email || ''} 
                  onChange={(e) => editMode && setUserProfile({...userProfile, email: e.target.value})}
                  disabled={!editMode || loading} 
                  className={editMode ? "border-[#0077b6] focus:border-[#03045e]" : "bg-slate-50"} 
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input value={user.phone} disabled className="bg-slate-50" />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  NIC Number
                </Label>
                <Input 
                  value={editMode ? userProfile.nic : user.nic || 'Not provided'} 
                  onChange={(e) => editMode && setUserProfile({...userProfile, nic: e.target.value})}
                  disabled={!editMode || loading} 
                  className={editMode ? "border-[#0077b6] focus:border-[#03045e]" : "bg-slate-50"} 
                />
              </div>

              {editMode && (
                <div className="md:col-span-2 flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-[#0077b6] hover:bg-[#03045e]"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setUserProfile({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email || '',
                        nic: user.nic || '',
                      });
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Vehicles Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#03045e] flex items-center gap-2">
                <Car className="h-5 w-5" />
                My Vehicles
              </h3>
              <Button
                onClick={() => setShowAddVehicle(!showAddVehicle)}
                size="sm"
                className="bg-[#0077b6] hover:bg-[#03045e]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Vehicle
              </Button>
            </div>

            {/* Add Vehicle Form */}
            {showAddVehicle && (
              <Card className="p-4 bg-slate-50 border-2 border-dashed border-slate-300">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-700">Add New Vehicle</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        placeholder="e.g., Toyota"
                        value={newVehicle.make}
                        onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        placeholder="e.g., Camry"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        placeholder="e.g., 2020"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate">License Plate</Label>
                      <Input
                        id="licensePlate"
                        placeholder="e.g., ABC-1234"
                        value={newVehicle.licensePlate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddVehicle} 
                      disabled={loading}
                      className="bg-[#0077b6] hover:bg-[#03045e]"
                    >
                      {loading ? 'Saving...' : 'Save Vehicle'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddVehicle(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Vehicles List */}
            <div className="space-y-3">
              {loading && vehicles.length === 0 ? (
                <Card className="p-6 text-center text-slate-500">
                  <p>Loading vehicles...</p>
                </Card>
              ) : vehicles.length === 0 ? (
                <Card className="p-6 text-center text-slate-500">
                  <Car className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No vehicles added yet</p>
                  <p className="text-sm">Click "Add Vehicle" to add your first vehicle</p>
                </Card>
              ) : (
                vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="p-4 hover:shadow-md transition-shadow">
                    {editingVehicleId === vehicle.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <h4 className="font-medium text-slate-700">Edit Vehicle</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`edit-make-${vehicle.id}`}>Make</Label>
                            <Input
                              id={`edit-make-${vehicle.id}`}
                              value={editingVehicle.make}
                              onChange={(e) => setEditingVehicle({ ...editingVehicle, make: e.target.value })}
                              placeholder="e.g., Toyota"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-model-${vehicle.id}`}>Model</Label>
                            <Input
                              id={`edit-model-${vehicle.id}`}
                              value={editingVehicle.model}
                              onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                              placeholder="e.g., Camry"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-year-${vehicle.id}`}>Year</Label>
                            <Input
                              id={`edit-year-${vehicle.id}`}
                              value={editingVehicle.year}
                              onChange={(e) => setEditingVehicle({ ...editingVehicle, year: e.target.value })}
                              placeholder="e.g., 2020"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`edit-plate-${vehicle.id}`}>License Plate</Label>
                            <Input
                              id={`edit-plate-${vehicle.id}`}
                              value={editingVehicle.licensePlate}
                              onChange={(e) => setEditingVehicle({ ...editingVehicle, licensePlate: e.target.value })}
                              placeholder="e.g., ABC-1234"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleUpdateVehicle(vehicle.id)}
                            disabled={loading}
                            size="sm"
                            className="bg-[#0077b6] hover:bg-[#03045e]"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEditVehicle}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="h-12 w-12 rounded-lg bg-[#90e0ef]/20 flex items-center justify-center flex-shrink-0">
                            <Car className="h-6 w-6 text-[#0077b6]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h4>
                            <p className="text-sm text-slate-500">
                              License Plate: <span className="font-medium text-slate-700">{vehicle.licensePlate}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVehicle(vehicle)}
                            disabled={loading}
                            className="text-[#0077b6] hover:text-[#03045e] hover:bg-[#90e0ef]/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveVehicle(vehicle.id)}
                            disabled={loading}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
