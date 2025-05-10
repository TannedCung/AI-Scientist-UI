import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { IdeaStatus, ExperimentStatus } from '../../types/models';

type StatusType = IdeaStatus | ExperimentStatus | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'generating' | 'generated' | 'draft';

interface StatusColors {
  [key: string]: {
    color: ChipProps['color'];
    background?: string;
    border?: string;
  };
}

const statusColors: StatusColors = {
  draft: {
    color: 'default',
    background: '#f5f5f5',
  },
  pending: {
    color: 'default',
    background: '#f5f5f5',
  },
  generating: {
    color: 'warning',
    background: '#fff7e6',
    border: '1px solid #FFB74D',
  },
  running: {
    color: 'warning', 
    background: '#fff7e6',
    border: '1px solid #FFB74D',
  },
  generated: {
    color: 'success',
    background: '#e6f7ee',
    border: '1px solid #66BB6A',
  },
  completed: {
    color: 'success',
    background: '#e6f7ee',
    border: '1px solid #66BB6A',
  },
  failed: {
    color: 'error',
    background: '#fdecea',
    border: '1px solid #EF5350',
  },
  cancelled: {
    color: 'default',
    background: '#f5f5f5',
    border: '1px solid #9e9e9e',
  },
};

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'small' }) => {
  const statusColor = statusColors[status] || statusColors.draft;
  
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size={size}
      color={statusColor.color}
      sx={{
        background: statusColor.background,
        border: statusColor.border,
        fontWeight: 500,
        textTransform: 'capitalize',
      }}
    />
  );
};

export default StatusBadge; 