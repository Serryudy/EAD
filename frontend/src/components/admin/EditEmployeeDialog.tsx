import { User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  role: string;
  active: number;
  completed: number;
  rating: number;
  status: string;
}

interface EditEmployeeDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (employee: Employee) => void;
}

export function EditEmployeeDialog({ 
  employee, 
  open, 
  onOpenChange,
  onSave 
}: EditEmployeeDialogProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setRole(employee.role);
      setStatus(employee.status);
    }
  }, [employee]);

  if (!employee) return null;

  const handleSave = () => {
    if (!name || !role || !status) {
      toast.error('Please fill in all fields');
      return;
    }

    const updatedEmployee: Employee = {
      ...employee,
      name,
      role,
      status
    };

    onSave(updatedEmployee);
    toast.success('Employee updated successfully!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#03045e] flex items-center gap-2">
            <User className="h-6 w-6" />
            Edit Employee
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employeeName">Employee Name *</Label>
            <Input
              id="employeeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John Smith"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Senior Technician"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Performance Statistics</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Active Services</p>
                <p className="text-xl font-semibold text-[#0077b6]">{employee.active}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-xl font-semibold text-green-600">{employee.completed}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Rating</p>
                <p className="text-xl font-semibold text-amber-600">{employee.rating} ⭐</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changes to employee status will affect their availability for new service assignments.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#0077b6] hover:bg-[#03045e]"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
