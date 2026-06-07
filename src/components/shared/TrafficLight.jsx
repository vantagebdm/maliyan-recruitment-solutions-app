import React from 'react';
import { cn } from '@/lib/utils';

const colors = {
  compliant: 'bg-emerald-500',
  expiring_soon: 'bg-amber-500',
  expired: 'bg-red-500',
  missing: 'bg-red-500',
  pending: 'bg-amber-500',
  verified: 'bg-emerald-500',
  rejected: 'bg-red-500',
};

export default function TrafficLight({ status, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className={cn("rounded-full flex-shrink-0", sizeClass, colors[status] || 'bg-gray-300')} />
  );
}