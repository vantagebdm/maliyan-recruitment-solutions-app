import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StatusBadge from '../components/shared/StatusBadge';
import { DollarSign, CheckCircle } from 'lucide-react';

export default function PayrollPrep() {
  const { data: timesheets = [], isLoading } = useQuery({
    queryKey: ['timesheets'],
    queryFn: () => base44.entities.Timesheet.list('-created_date'),
    initialData: [],
  });

  const payrollReady = timesheets.filter(t => ['admin_approved', 'payroll_ready'].includes(t.status));

  const totalGross = payrollReady.reduce((sum, ts) => {
    const ordinary = (ts.total_ordinary_hours || 0) * (ts.pay_rate || 0);
    const overtime = (ts.total_overtime_hours || 0) * (ts.pay_rate || 0) * 1.5;
    return sum + ordinary + overtime + (ts.total_allowances || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payroll Preparation</h1>
        <p className="text-sm text-muted-foreground mt-1">Approved timesheets ready for payroll processing</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ready for Payroll</p>
          <p className="text-2xl font-bold mt-1">{payrollReady.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Gross Estimate</p>
          <p className="text-2xl font-bold mt-1">${totalGross.toLocaleString('en-AU', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Hours</p>
          <p className="text-2xl font-bold mt-1">
            {payrollReady.reduce((s, t) => s + (t.total_ordinary_hours || 0) + (t.total_overtime_hours || 0), 0)}h
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Employee</th>
                <th className="text-left p-3 font-medium">Client</th>
                <th className="text-right p-3 font-medium">Ordinary</th>
                <th className="text-right p-3 font-medium">Overtime</th>
                <th className="text-right p-3 font-medium">Rate</th>
                <th className="text-right p-3 font-medium">Allowances</th>
                <th className="text-right p-3 font-medium">Gross Est.</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payrollReady.map(ts => {
                const gross = ((ts.total_ordinary_hours || 0) * (ts.pay_rate || 0)) +
                  ((ts.total_overtime_hours || 0) * (ts.pay_rate || 0) * 1.5) +
                  (ts.total_allowances || 0);
                return (
                  <tr key={ts.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{ts.candidate_name || 'Unknown'}</td>
                    <td className="p-3">{ts.client_name || '—'}</td>
                    <td className="p-3 text-right">{ts.total_ordinary_hours || 0}h</td>
                    <td className="p-3 text-right">{ts.total_overtime_hours || 0}h</td>
                    <td className="p-3 text-right">${ts.pay_rate || 0}/hr</td>
                    <td className="p-3 text-right">${ts.total_allowances || 0}</td>
                    <td className="p-3 text-right font-semibold">${gross.toFixed(2)}</td>
                    <td className="p-3"><StatusBadge status={ts.status} /></td>
                  </tr>
                );
              })}
              {payrollReady.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">No approved timesheets ready for payroll</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}