import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const states = ['QLD', 'NSW', 'VIC', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
const candidateStages = [
  { value: 'available', label: 'Available' },
  { value: 'applied', label: 'Applied' },
  { value: 'mobilising', label: 'Mobilising' },
  { value: 'demobbed', label: 'Demobbed' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

export default function CandidateFormDialog({ open, onOpenChange, candidate, onSave, isLoading }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (candidate) {
      setForm({ ...candidate });
    } else {
      setForm({ candidate_stage: 'available', pipeline_stage: 'new_applicant', compliance_status: 'pending', status: 'active', fifo_available: false });
    }
  }, [candidate, open]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{candidate ? 'Edit Candidate' : 'Add Candidate'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name *</Label>
              <Input value={form.first_name || ''} onChange={e => update('first_name', e.target.value)} required />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input value={form.last_name || ''} onChange={e => update('last_name', e.target.value)} required />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email || ''} onChange={e => update('email', e.target.value)} required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone || ''} onChange={e => update('phone', e.target.value)} />
            </div>
            <div>
              <Label>Trade / Role</Label>
              <Input value={form.trade || ''} onChange={e => update('trade', e.target.value)} placeholder="e.g. Heavy Diesel Fitter" />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location || ''} onChange={e => update('location', e.target.value)} />
            </div>
            <div>
              <Label>State</Label>
              <Select value={form.state || ''} onValueChange={v => update('state', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Candidate Stage</Label>
              <Select value={form.candidate_stage || 'available'} onValueChange={v => update('candidate_stage', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {candidateStages.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pay Rate Expectation ($/hr)</Label>
              <Input type="number" value={form.pay_rate_expectation || ''} onChange={e => update('pay_rate_expectation', parseFloat(e.target.value))} />
            </div>
            <div>
              <Label>Availability Date</Label>
              <Input type="date" value={form.availability_date || ''} onChange={e => update('availability_date', e.target.value)} />
            </div>
            <div>
              <Label>Roster Preference</Label>
              <Input value={form.roster_preference || ''} onChange={e => update('roster_preference', e.target.value)} placeholder="e.g. 2/1 FIFO" />
            </div>
            <div>
              <Label>Rating (1-5)</Label>
              <Input type="number" min="1" max="5" value={form.rating || ''} onChange={e => update('rating', parseInt(e.target.value))} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.fifo_available || false} onCheckedChange={v => update('fifo_available', v)} />
            <Label>FIFO Available</Label>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes || ''} onChange={e => update('notes', e.target.value)} className="h-20" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{candidate ? 'Update' : 'Add Candidate'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}