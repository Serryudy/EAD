import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: 'pending' | 'in-progress' | 'quality-check' | 'completed' | 'cancelled';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    'pending': {
      label: 'Pending',
      className: 'bg-amber-100 text-amber-700 border-amber-200'
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

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
