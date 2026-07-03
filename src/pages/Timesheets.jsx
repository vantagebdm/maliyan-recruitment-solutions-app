import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ShiftReportCard from '@/components/timesheets/ShiftReportCard';
import { Inbox, CheckCircle2 } from 'lucide-react';

export default function Timesheets() {
  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ['timesheets'],
    queryFn: () => base44.entities.Timesheet.list('-created_date'),
    initialData: [],
  });

  const submitted = timesheets.filter(t => t.status === 'submitted' || t.status === 'draft');
  const approved = timesheets.filter(t => ['client_approved', 'admin_approved', 'payroll_ready', 'paid'].includes(t.status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timesheets</h1>
        <p className="text-sm text-muted-foreground mt-1">Shift report intake and payroll approval</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left box: New submitted shift reports */}
        <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border min-h-[60vh] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Submitted Shift Reports</h2>
                <p className="text-xs text-muted-foreground">Newly submitted — awaiting review</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">{submitted.length}</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
              </div>
            ) : submitted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <Inbox className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-sm font-medium">No new shift reports</p>
                <p className="text-xs">Submitted reports from the STS Hub will appear here.</p>
              </div>
            ) : (
              submitted.map(ts => <ShiftReportCard key={ts.id} report={ts} />)
            )}
          </div>
        </div>

        {/* Right box: Approved for pay / past shift reports */}
        <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border min-h-[60vh] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Approved for Pay</h2>
                <p className="text-xs text-muted-foreground">Past and approved shift reports</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">{approved.length}</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
              </div>
            ) : approved.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 opacity-30 mb-2" />
                <p className="text-sm font-medium">No approved reports yet</p>
                <p className="text-xs">Approved and paid shift reports will appear here.</p>
              </div>
            ) : (
              approved.map(ts => <ShiftReportCard key={ts.id} report={ts} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}