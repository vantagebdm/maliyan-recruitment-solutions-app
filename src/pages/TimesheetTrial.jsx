import React from 'react';

export default function TimesheetTrial() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timesheet Trial</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trial workspace for the new clock-in, lunch-break, clock-out and employer approval system.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 flex flex-col items-center justify-center text-center min-h-[50vh]">
        <p className="text-sm font-medium text-muted-foreground">Trial page under construction</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">
          This is a separate trial environment. Nothing here is connected to payroll or existing timesheet data.
        </p>
      </div>
    </div>
  );
}