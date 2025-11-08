import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'in-progress' | 'quality-check' | 'completed' | 'cancelled' | 'received' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    'received': {
      label: 'Received',
      className: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    'pending': {
      label: 'Pending',
      className: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    'confirmed': {
      label: 'Confirmed',
      className: 'bg-cyan-100 text-cyan-700 border-cyan-200'
    },
    'in-progress': {
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    'quality-check': {
      label: 'Quality Check',
      className: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    'completed': {
      label: 'Completed',
      className: 'bg-green-100 text-green-700 border-green-200'
    },
    'cancelled': {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-700 border-red-200'
    }
  };

  const config = statusConfig[status] || {
    label: status || 'Unknown',
    className: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
