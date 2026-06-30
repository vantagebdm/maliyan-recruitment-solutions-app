import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Check, X, User } from 'lucide-react';

export default function PersonalDetails({ candidate, onUpdate }) {
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
          <User className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Personal Details</h3>
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
          <Field label="Full Name" value={`${candidate.first_name || ''} ${candidate.last_name || ''}`} />
          <Field label="Date of Birth" value={candidate.date_of_birth} />
          <Field label="Gender" value={candidate.gender} />
          <Field label="Address" value={candidate.address} />
          <Field label="Phone (Mobile)" value={candidate.phone} />
          <Field label="Phone (Home)" value={candidate.home_phone} />
          <Field label="Email" value={candidate.email} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">First Name</Label><Input value={form.first_name || ''} onChange={e => update('first_name', e.target.value)} /></div>
          <div><Label className="text-xs">Last Name</Label><Input value={form.last_name || ''} onChange={e => update('last_name', e.target.value)} /></div>
          <div><Label className="text-xs">Date of Birth</Label><Input type="date" value={form.date_of_birth || ''} onChange={e => update('date_of_birth', e.target.value)} /></div>
          <div><Label className="text-xs">Gender</Label>
            <Select value={form.gender || ''} onValueChange={v => update('gender', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer Not to Say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label className="text-xs">Address</Label><Input value={form.address || ''} onChange={e => update('address', e.target.value)} /></div>
          <div><Label className="text-xs">Phone (Mobile)</Label><Input value={form.phone || ''} onChange={e => update('phone', e.target.value)} /></div>
          <div><Label className="text-xs">Phone (Home)</Label><Input value={form.home_phone || ''} onChange={e => update('home_phone', e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">Email</Label><Input value={form.email || ''} onChange={e => update('email', e.target.value)} /></div>
          <div className="col-span-2 pt-2 border-t">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Emergency Contact</p>
          </div>
          <div><Label className="text-xs">Name</Label><Input value={form.emergency_contact_name || ''} onChange={e => update('emergency_contact_name', e.target.value)} /></div>
          <div><Label className="text-xs">Phone</Label><Input value={form.emergency_contact_phone || ''} onChange={e => update('emergency_contact_phone', e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs">Relationship</Label><Input value={form.emergency_contact_relationship || ''} onChange={e => update('emergency_contact_relationship', e.target.value)} /></div>
        </div>
      )}

      {!editing && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Emergency Contact</p>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Name" value={candidate.emergency_contact_name} />
            <Field label="Phone" value={candidate.emergency_contact_phone} />
            <Field label="Relationship" value={candidate.emergency_contact_relationship} />
          </div>
        </div>
      )}
    </div>
  );
}