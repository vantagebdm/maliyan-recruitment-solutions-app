import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TrialFilters({ hostClient, setHostClient, payPeriod, setPayPeriod, status, setStatus, payPeriods }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Host client</label>
        <Select value={hostClient} onValueChange={setHostClient}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="All clients" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            <SelectItem value="STS">STS</SelectItem>
            <SelectItem value="APP">APP</SelectItem>
            <SelectItem value="NHM">NHM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Pay period</label>
        <Select value={payPeriod} onValueChange={setPayPeriod}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="All periods" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All periods</SelectItem>
            {payPeriods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Timesheet status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-card"><SelectValue placeholder="All status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="ready">Ready to approve</SelectItem>
            <SelectItem value="attention">Attention required</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}