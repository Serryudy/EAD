import { Wrench } from 'lucide-react';
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

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
  count: number;
}

interface EditServiceDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: Service) => void;
}

export function EditServiceDialog({ 
  service, 
  open, 
  onOpenChange,
  onSave 
}: EditServiceDialogProps) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDuration(service.duration);
      setPrice(service.price);
    }
  }, [service]);

  if (!service) return null;

  const handleSave = () => {
    if (!name || !duration || !price) {
      toast.error('Please fill in all fields');
      return;
    }

    const updatedService: Service = {
      ...service,
      name,
      duration,
      price
    };

    onSave(updatedService);
    toast.success('Service updated successfully!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#03045e] flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            Edit Service
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service Name *</Label>
            <Input
              id="serviceName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Oil Change"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 1 hour"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., $49.99"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Statistics</Label>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                Completed this month: <span className="font-semibold text-slate-900">{service.count}</span>
              </p>
            </div>
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
