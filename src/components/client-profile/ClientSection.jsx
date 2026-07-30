import React from 'react';

export default function ClientSection({ icon: Icon, title, action, children, className }) {
  return (
    <div className={`bg-card rounded-xl border border-border p-5 h-full ${className || ''}`}>
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <h3 className="font-bold text-sm">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}