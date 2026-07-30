import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Check, X, Settings } from 'lucide-react';

export default function OperationalDetailsCard({ client, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => { setForm({ ...client }); setEditing(true); };
  const cancel = () => setEditing(false);
  const save = () => { onUpdate(form); setEditing(false); };
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Operational Details</h3>
        </div>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={startEdit} className="gap-1 text-xs">
            <Pencil className="w-3 h-3" /> Edit
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={cancel}><X className="w-3 h-3" /></Button>
            <Button variant="ghost" size="sm" onClick={save}><Check className="w-3 h-3" /></Button>
          </div>
        )}
      </div>

      {!editing ? (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary Worksite" value={client.primary_worksite} />
          <Field label="Standard Roster" value={client.standard_roster} />
          <Field label="Standard Shift Hours" value={client.standard_shift_hours} />
          <Field label="Employment Types Supplied" value={client.employment_types_supplied} />
          <Field label="Timesheet Frequency" value={client.timesheet_frequency} />
          <Field label="Timesheet Approver" value={client.timesheet_approver} />
          <Field label="Invoice Frequency" value={client.invoice_frequency} />
          <Field label="Payment Terms" value={client.payment_terms} />
          <Field label="Purchase Order Required" value={client.po_required ? 'Yes' : 'No'} />
          <div className="col-span-2"><Field label="Site Induction Requirements" value={client.site_induction_requirements} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Primary Worksite</Label><Input value={form.primary_worksite || ''} onChange={e => update('primary_worksite', e.target.value)} /></div>
          <div><Label className="text-xs">Standard Roster</Label><Input value={form.standard_roster || ''} onChange={e => update('standard_roster', e.target.value)} placeholder="e.g. 2/1 FIFO" /></div>
          <div><Label className="text-xs">Standard Shift Hours</Label><Input value={form.standard_shift_hours || ''} onChange={e => update('standard_shift_hours', e.target.value)} placeholder="e.g. 12h" /></div>
          <div><Label className="text-xs">Employment Types Supplied</Label><Input value={form.employment_types_supplied || ''} onChange={e => update('employment_types_supplied', e.target.value)} placeholder="e.g. Casual, Temp, Fixed" /></div>
          <div><Label className="text-xs">Timesheet Frequency</Label><Input value={form.timesheet_frequency || ''} onChange={e => update('timesheet_frequency', e.target.value)} placeholder="e.g. Weekly" /></div>
          <div><Label className="text-xs">Timesheet Approver</Label><Input value={form.timesheet_approver || ''} onChange={e => update('timesheet_approver', e.target.value)} /></div>
          <div><Label className="text-xs">Invoice Frequency</Label><Input value={form.invoice_frequency || ''} onChange={e => update('invoice_frequency', e.target.value)} placeholder="e.g. Weekly" /></div>
          <div><Label className="text-xs">Payment Terms</Label><Input value={form.payment_terms || ''} onChange={e => update('payment_terms', e.target.value)} placeholder="e.g. Net 14" /></div>
          <div className="col-span-2 flex items-center gap-2 pt-1">
            <input type="checkbox" id="po_req" checked={!!form.po_required} onChange={e => update('po_required', e.target.checked)} className="w-4 h-4 rounded border-border" />
            <Label htmlFor="po_req" className="text-xs">Purchase order required</Label>
          </div>
          <div className="col-span-2"><Label className="text-xs">Site Induction Requirements</Label><Input value={form.site_induction_requirements || ''} onChange={e => update('site_induction_requirements', e.target.value)} /></div>
        </div>
      )}
    </div>
  );
}