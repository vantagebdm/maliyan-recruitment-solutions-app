import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Clock, ChevronDown, ChevronRight, Pencil, RotateCcw, CheckCheck } from 'lucide-react';
import TrialFilters from '@/components/timesheet-trial/TrialFilters';
import EditTimeDialog from '@/components/timesheet-trial/EditTimeDialog';

// ---- Trial helpers (self-contained, no backend) ----
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
  const [editDay, setEditDay] = useState(null); // { employeeId, day, dayIndex }
  const [auditLog, setAuditLog] = useState([]);
  const [viewedEmployees, setViewedEmployees] = useState(new Set());

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

  const toggle = (id) => {
    setExpanded(p => ({ ...p, [id]: !p[id] }));
    setViewedEmployees(s => new Set(s).add(id));
  };

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
      const updated = { ...e, days, status: recomputeStatus({ ...e, days }) };
      return updated;
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

  const correctMissing = (id, dayIndex) => {
    setEditDay({ employeeId: id, day: employees.find(e => e.id === id).days[dayIndex], dayIndex });
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

      {Object.keys(groupedByPeriod).length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
          No timesheets match the selected filters.
        </div>
      ) : (
        Object.entries(groupedByPeriod).map(([period, emps]) => (
          <div key={period} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Clock className="w-4 h-4" /> {period}
            </div>
            <div className="space-y-3">
              {emps.map(emp => {
                const totals = employeeTotals(emp);
                const open = expanded[emp.id];
                const issues = emp.days.some(d => dayIssues(d).length > 0);
                const canApprove = !issues && emp.status !== 'Approved for Pay';
                return (
                  <div key={emp.id} className="rounded-xl border bg-card overflow-hidden">
                    {/* Summary row */}
                    <button
                      onClick={() => toggle(emp.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 ${issues ? 'bg-amber-50/40' : ''}`}
                    >
                      {open ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 flex-1 items-center text-sm">
                        <div className="font-medium truncate">{emp.name}</div>
                        <div className="text-muted-foreground truncate">{emp.position}</div>
                        <div className="text-muted-foreground truncate">{emp.hostClient}</div>
                        <div className="text-muted-foreground truncate hidden md:block">{emp.worksite}</div>
                        <div className="text-muted-foreground hidden md:block">{totals.days} shifts</div>
                        <div className="font-medium hidden md:block">{totals.totalHours} hrs</div>
                        <div className={STATUS_STYLES[emp.status]}>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium">
                            {issues && <AlertTriangle className="w-3 h-3" />}
                            {emp.status}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Expanded daily view */}
                    {open && (
                      <div className="border-t bg-muted/20 px-4 py-4 space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-muted-foreground border-b">
                                <th className="py-2 pr-4 font-medium">Date</th>
                                <th className="py-2 pr-4 font-medium">Clock-in</th>
                                <th className="py-2 pr-4 font-medium">Lunch start</th>
                                <th className="py-2 pr-4 font-medium">Lunch finish</th>
                                <th className="py-2 pr-4 font-medium">Clock-out</th>
                                <th className="py-2 pr-4 font-medium">Unpaid break</th>
                                <th className="py-2 pr-4 font-medium">Paid hours</th>
                                <th className="py-2 pr-4 font-medium">Issues</th>
                                <th className="py-2 pr-4 font-medium">Status</th>
                                <th className="py-2 pr-4 font-medium"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {emp.days.map((d, i) => {
                                const di = dayIssues(d);
                                const breakMin = (d.lunchStart && d.lunchFinish) ? toMin(d.lunchFinish) - toMin(d.lunchStart) : 0;
                                const shiftStatus = di.length ? 'Missing data' : 'Complete';
                                return (
                                  <tr key={i} className={`border-b last:border-0 ${di.length ? 'bg-amber-50/60' : ''}`}>
                                    <td className="py-2 pr-4">{d.date}</td>
                                    <td className="py-2 pr-4">{d.clockIn || <span className="text-amber-600 font-medium">—missing—</span>}</td>
                                    <td className="py-2 pr-4">{d.lunchStart || <span className="text-amber-600 font-medium">—</span>}</td>
                                    <td className="py-2 pr-4">{d.lunchFinish || <span className="text-amber-600 font-medium">—</span>}</td>
                                    <td className="py-2 pr-4">{d.clockOut || <span className="text-amber-600 font-medium">—missing—</span>}</td>
                                    <td className="py-2 pr-4">{breakMin ? `${breakMin} min` : '—'}</td>
                                    <td className="py-2 pr-4 font-medium">{fmtHours(paidMinutes(d))}</td>
                                    <td className="py-2 pr-4">
                                      {di.length ? (
                                        <span className="text-xs text-amber-700 flex flex-col gap-0.5">
                                          {di.map((x, j) => <span key={j} className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{x}</span>)}
                                        </span>
                                      ) : <span className="text-xs text-muted-foreground">None</span>}
                                    </td>
                                    <td className="py-2 pr-4">
                                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SHIFT_STYLES[shiftStatus]}`}>{shiftStatus}</span>
                                    </td>
                                    <td className="py-2 pr-4">
                                      <Button size="sm" variant="ghost" onClick={() => setEditDay({ employeeId: emp.id, day: d, dayIndex: i })}>
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Audit history */}
                        {auditLog.filter(a => a.employeeId === emp.id).length > 0 && (
                          <div className="rounded-lg border bg-card p-3">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Audit history</h4>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {auditLog.filter(a => a.employeeId === emp.id).map(a => (
                                <div key={a.id} className="text-xs flex flex-wrap gap-x-2 gap-y-0.5">
                                  <span className="font-medium">{a.fieldLabel}:</span>
                                  <span className="text-muted-foreground line-through">{a.oldTime || '—'}</span>
                                  <span>→</span>
                                  <span className="font-medium">{a.newTime || '—'}</span>
                                  <span className="text-muted-foreground">({a.by}, {a.timestamp})</span>
                                  <span className="italic text-muted-foreground">Reason: {a.reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button size="sm" variant="outline" onClick={() => requestCorrection(emp.id)}>
                            <RotateCcw className="w-3.5 h-3.5" /> Request Correction
                          </Button>
                          {emp.days.some((d, i) => dayIssues(d).length > 0) && (
                            <Button size="sm" variant="outline" onClick={() => correctMissing(emp.id, emp.days.findIndex(d => dayIssues(d).length > 0))}>
                              <AlertTriangle className="w-3.5 h-3.5" /> Correct Missing Time
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => approveEmployee(emp.id)}
                            disabled={!canApprove}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Timesheet
                          </Button>
                          {issues && (
                            <p className="text-xs text-amber-700 self-center ml-1">
                              Cannot approve until missing clock-in/out or lunch times are corrected.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <p className="text-xs text-muted-foreground pt-2 border-t">
        Trial environment only — uses test employees and test clocking records. Not connected to Xero, payroll, billing or live timesheet data.
      </p>
    </div>
  );
}