import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Check, X, ClipboardList } from 'lucide-react';

const FIELDS = [
  { key: 'common_positions_recruited', label: 'Common Positions Recruited', long: true },
  { key: 'required_qualifications_licences', label: 'Required Qualifications & Licences', long: true },
  { key: 'required_experience', label: 'Required Experience', long: true },
  { key: 'medical_requirements', label: 'Medical Requirements', long: true },
  { key: 'drug_alcohol_requirements', label: 'Drug & Alcohol Testing Requirements', long: true },
  { key: 'site_induction_requirements', label: 'Site Induction Requirements', long: true },
  { key: 'ppe_uniform_requirements', label: 'PPE & Uniform Requirements', long: true },
  { key: 'standard_work_location', label: 'Standard Work Location', long: false },
  { key: 'standard_roster_shift_hours', label: 'Standard Roster & Shift Hours', long: false },
  { key: 'travel_accommodation_arrangements', label: 'Travel, Flights & Accommodation Arrangements', long: true },
  { key: 'point_of_hire_requirements', label: 'Point-of-Hire Requirements', long: true },
  { key: 'recruitment_authoriser', label: 'Who Can Authorise Recruitment / Job Orders', long: false },
  { key: 'preferred_candidate_requirements', label: 'Preferred Candidate Requirements', long: true },
  { key: 'special_onboarding_instructions', label: 'Special Site / Onboarding Instructions', long: true },
];

export default function ClientRequirementsSection({ client, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const req = client.client_requirements || {};

  const startEdit = () => { setForm({ ...req }); setEditing(true); };
  const cancel = () => setEditing(false);
  const save = () => { onUpdate({ client_requirements: form }); setEditing(false); };
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Client Requirements</h3>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          {FIELDS.map(f => (
            <div key={f.key} className={f.long ? 'sm:col-span-2' : ''}>
              <p className="text-xs text-muted-foreground mb-0.5">{f.label}</p>
              <p className="text-sm font-medium whitespace-pre-wrap">{req[f.key] || '—'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.map(f => (
            <div key={f.key} className={f.long ? 'sm:col-span-2' : ''}>
              <Label className="text-xs">{f.label}</Label>
              {f.long ? (
                <Textarea value={form[f.key] || ''} onChange={e => update(f.key, e.target.value)} className="h-16" />
              ) : (
                <Input value={form[f.key] || ''} onChange={e => update(f.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}