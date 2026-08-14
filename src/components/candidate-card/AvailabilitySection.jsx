import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Pencil, Check, X, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SUSPENSION_STATUSES = ['suspended_host_only', 'suspended_stood_down', 'stood_down_investigation'];

export default function AvailabilitySection({ candidate, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const startEdit = () => { setForm({ ...candidate }); setEditing(true); };
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
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Availability</h3>
          {(candidate.not_attending_site || SUSPENSION_STATUSES.includes(candidate.status)) && (
            <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30 text-xs">Not currently available</Badge>
          )}
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
          <Field label="Availability Start Date" value={candidate.availability_date} />
          <Field label="Notice Period" value={candidate.notice_period} />
          <Field label="Preferred Roster" value={candidate.roster_preference} />
          <Field label="Preferred Location" value={candidate.location} />
          <Field label="Willing to Relocate" value={candidate.willing_to_relocate ? 'Yes' : 'No'} />
          <Field label="Home Airport" value={candidate.home_airport} />
          <Field label="FIFO Available" value={candidate.fifo_available ? 'Yes' : 'No'} />
          <Field label="Pay Rate Expectation" value={candidate.pay_rate_expectation ? `$${candidate.pay_rate_expectation}/hr` : null} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Availability Start Date</Label><Input type="date" value={form.availability_date || ''} onChange={e => update('availability_date', e.target.value)} /></div>
          <div><Label className="text-xs">Notice Period</Label><Input value={form.notice_period || ''} onChange={e => update('notice_period', e.target.value)} placeholder="e.g. 2 weeks" /></div>
          <div><Label className="text-xs">Preferred Roster</Label><Input value={form.roster_preference || ''} onChange={e => update('roster_preference', e.target.value)} placeholder="e.g. 2/1 FIFO" /></div>
          <div><Label className="text-xs">Preferred Location</Label><Input value={form.location || ''} onChange={e => update('location', e.target.value)} /></div>
          <div className="flex items-center gap-2 pt-5">
            <Switch checked={form.willing_to_relocate || false} onCheckedChange={v => update('willing_to_relocate', v)} />
            <Label className="text-xs">Willing to Relocate</Label>
          </div>
          <div><Label className="text-xs">Home Airport</Label><Input value={form.home_airport || ''} onChange={e => update('home_airport', e.target.value)} /></div>
          <div className="flex items-center gap-2 pt-5">
            <Switch checked={form.fifo_available || false} onCheckedChange={v => update('fifo_available', v)} />
            <Label className="text-xs">FIFO Available</Label>
          </div>
          <div><Label className="text-xs">Pay Rate Expectation ($/hr)</Label><Input type="number" value={form.pay_rate_expectation || ''} onChange={e => update('pay_rate_expectation', parseFloat(e.target.value))} /></div>
        </div>
      )}
    </div>
  );
}