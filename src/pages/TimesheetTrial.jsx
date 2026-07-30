import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Clock, ChevronDown, ChevronRight, Pencil, RotateCcw, CheckCheck } from 'lucide-react';
import TrialFilters from '@/components/timesheet-trial/TrialFilters';
import EditTimeDialog from '@/components/timesheet-trial/EditTimeDialog';

const toMin = (t) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fmtHours = (mins) => (mins / 60).toFixed(2);
const dayIssues = (d) => {
  const issues = [];
  if (!d.clockIn) issues.push('Missing clock-in');
  if (!d.clockOut) issues.push('Missing clock-out');
  if (!d.lunchStart || !d.lunchFinish) issues.push('Missing lunch break');
  else if (toMin(d.lunchFinish) <= toMin(d.lunchStart)) issues.push('Lunch finish before start');
  return issues;
};
const paidMinutes = (d) => {
  const cin = toMin(d.clockIn), cout = toMin(d.clockOut);
  if (cin == null || cout == null || cout <= cin) return 0;
  let breakM = 0;
  if (d.lunchStart && d.lunchFinish) {
    const ls = toMin(d.lunchStart), lf = toMin(d.lunchFinish);
    if (lf > ls) breakM = lf - ls;
  }
  return cout - cin - breakM;
};

const STATUS_STYLES = {
  'Awaiting Review': 'bg-blue-50 text-blue-700 border-blue-200',
  'Attention Required': 'bg-amber-50 text-amber-700 border-amber-200',
  'Approved for Pay': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Returned for Correction': 'bg-rose-50 text-rose-700 border-rose-200',
};
const SHIFT_STYLES = {
  Complete: 'bg-emerald-50 text-emerald-700',
  'Missing data': 'bg-amber-50 text-amber-700',
};

const TEST_EMPLOYEES = [
  {
    id: 'e1', name: 'James Wilson', position: 'Diesel Mechanic', hostClient: 'STS', worksite: 'Mt Keith Mine',
    payPeriod: '14 Jul – 20 Jul 2026', status: 'Awaiting Review',
    days: [
      { date: '14 Jul 2026', clockIn: '06:00', lunchStart: '12:00', lunchFinish: '12:30', clockOut: '18:00' },
      { date: '15 Jul 2026', clockIn: '06:00', lunchStart: '12:00', lunchFinish: '12:30', clockOut: '18:00' },
      { date: '16 Jul 2026', clockIn: '06:00', lunchStart: '12:00', lunchFinish: '', clockOut: '18:00' },
      { date: '17 Jul 2026', clockIn: '06:00', lunchStart: '12:00', lunchFinish: '12:30', clockOut: '18:00' },
    ],
  },
  {
    id: 'e2', name: 'Sarah Patel', position: 'HD Fitter', hostClient: 'STS', worksite: 'Leinster Mine',
    payPeriod: '14 Jul – 20 Jul 2026', status: 'Approved for Pay',
    days: [
      { date: '14 Jul 2026', clockIn: '06:00', lunchStart: '11:30', lunchFinish: '12:00', clockOut: '17:30' },
      { date: '15 Jul 2026', clockIn: '06:00', lunchStart: '11:30', lunchFinish: '12:00', clockOut: '17:30' },
    ],
  },
  {
    id: 'e3', name: 'Mark Nguyen', position: 'Dump Truck Operator', hostClient: 'APP', worksite: 'Kalgoorlie Gold',
    payPeriod: '14 Jul – 20 Jul 2026', status: 'Attention Required',
    days: [
      { date: '14 Jul 2026', clockIn: '06:00', lunchStart: '12:00', lunchFinish: '12:30', clockOut: '' },
      { date: '15 Jul 2026', clockIn: '', lunchStart: '', lunchFinish: '', clockOut: '' },
    ],
  },
  {
    id: 'e4', name: 'Aisha Khan', position: 'Labourer', hostClient: 'NHM', worksite: 'Port Hedland',
    payPeriod: '21 Jul – 27 Jul 2026', status: 'Awaiting Review',
    days: [
      { date: '21 Jul 2026', clockIn: '06:00', lunchStart: '12:00', lunchFinish: '12:30', clockOut: '18:00' },
      { date: '22 Jul 2026', clockIn: '06:00', lunchStart: '12:00', lunchFinish: '12:30', clockOut: '18:00' },
      { date: '23 Jul 2026', clockIn: '06:00', lunchStart: '12:00', lunchFinish: '12:30', clockOut: '18:00' },
    ],
  },
  {
    id: 'e5', name: 'Liam OConnor', position: 'Boilermaker', hostClient: 'APP', worksite: 'Kalgoorlie Gold',
    payPeriod: '21 Jul – 27 Jul 2026', status: 'Returned for Correction',
    days: [
      { date: '21 Jul 2026', clockIn: '06:00', lunchStart: '', lunchFinish: '', clockOut: '18:00' },
    ],
  },
];

const STATUS_FILTER_MAP = {
  ready: ['Awaiting Review'],
  attention: ['Attention Required'],
  approved: ['Approved for Pay'],
};

export default function TimesheetTrial() {
  const [employees, setEmployees] = useState(TEST_EMPLOYEES);
  const [expanded, setExpanded] = useState({});
  const [hostClient, setHostClient] = useState('all');
  const [payPeriod, setPayPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  const [editDay, setEditDay] = useState(null);
  const [auditLog, setAuditLog] = useState([]);

  const payPeriods = useMemo(() => Array.from(new Set(employees.map(e => e.payPeriod))), [employees]);

  const employeeTotals = (emp) => {
    const days = emp.days.length;
    const totalMin = emp.days.reduce((s, d) => s + paidMinutes(d), 0);
    const hasMissing = emp.days.some(d => dayIssues(d).length > 0);
    return { days, totalHours: fmtHours(totalMin), hasMissing };
  };

  const filtered = useMemo(() => {
    return employees.filter(e => {
      if (hostClient !== 'all' && e.hostClient !== hostClient) return false;
      if (payPeriod !== 'all' && e.payPeriod !== payPeriod) return false;
      if (status !== 'all' && !STATUS_FILTER_MAP[status].includes(e.status)) return false;
      return true;
    });
  }, [employees, hostClient, payPeriod, status]);

  const groupedByPeriod = useMemo(() => {
    const map = {};
    filtered.forEach(e => { (map[e.payPeriod] ||= []).push(e); });
    return map;
  }, [filtered]);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const recomputeStatus = (emp) => {
    const hasMissing = emp.days.some(d => dayIssues(d).length > 0);
    if (emp.status === 'Approved for Pay') return 'Approved for Pay';
    if (hasMissing) return 'Attention Required';
    return 'Awaiting Review';
  };

  const handleSaveEdit = ({ employeeId, dayIndex, updatedDay, changes, reason }) => {
    setEmployees(prev => prev.map(e => {
      if (e.id !== employeeId) return e;
      const days = e.days.map((d, i) => i === dayIndex ? { ...d, ...updatedDay, edited: true } : d);
      return { ...e, days, status: recomputeStatus({ ...e, days }) };
    }));
    setAuditLog(prev => [
      ...changes.map(c => ({
        id: `${employeeId}-${dayIndex}-${c.field}-${Date.now()}`,
        employeeId, dayIndex, date: employees.find(e => e.id === employeeId)?.days[dayIndex]?.date,
        ...c, reason, by: 'Authorised Admin', timestamp: new Date().toLocaleString(),
      })),
      ...prev,
    ]);
  };

  const approveEmployee = (id) => {
    setEmployees(prev => prev.map(e => {
      if (e.id !== id) return e;
      if (e.days.some(d => dayIssues(d).length > 0)) return e;
      return { ...e, status: 'Approved for Pay' };
    }));
  };

  const approveAllReady = () => {
    setEmployees(prev => prev.map(e => {
      if (e.status === 'Awaiting Review' && !e.days.some(d => dayIssues(d).length > 0)) {
        return { ...e, status: 'Approved for Pay' };
      }
      return e;
    }));
  };

  const requestCorrection = (id) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'Returned for Correction' } : e));
  };

  const correctMissing = (id) => {
    const dayIndex = employees.find(e => e.id === id).days.findIndex(d => dayIssues(d).length > 0);
    if (dayIndex >= 0) setEditDay({ employeeId: id, day: employees.find(e => e.id === id).days[dayIndex], dayIndex });
  };

  const readyCount = employees.filter(e => e.status === 'Awaiting Review' && !e.days.some(d => dayIssues(d).length > 0)).length;

  return (
    <div className="space-y-6">
      <EditTimeDialog
        open={!!editDay}
        onOpenChange={(o) => !o && setEditDay(null)}
        day={editDay?.day}
        employeeName={editDay ? employees.find(e => e.id === editDay.employeeId)?.name : ''}
        onSave={({ updatedDay, changes, reason }) =>
          handleSaveEdit({ employeeId: editDay.employeeId, dayIndex: editDay.dayIndex, updatedDay, changes, reason })
        }
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timesheet Trial</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Employer approval dashboard — clock-in, lunch break, clock-out & approval (trial data only).
          </p>
        </div>
        <Button onClick={approveAllReady} disabled={readyCount === 0}>
          <CheckCheck className="w-4 h-4" />
          Approve All Ready ({readyCount})
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <TrialFilters
          hostClient={hostClient} setHostClient={setHostClient}
          payPeriod={payPeriod} setPayPeriod={setPayPeriod}
          status={status} setStatus={setStatus}
          payPeriods={payPeriods}
        />
      </div>

      <p className="text-xs text-muted-foreground pt-2 border-t">
        Trial environment only — uses test employees and test clocking records. Not connected to Xero, payroll, billing or live timesheet data.
      </p>
    </div>
  );
}