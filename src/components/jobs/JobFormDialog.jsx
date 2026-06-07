import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const states = ['QLD', 'NSW', 'VIC', 'WA', 'SA', 'TAS', 'NT', 'ACT'];
const jobTypes = ['FIFO', 'DIDO', 'Local', 'Residential', 'Shutdown'];
const industries = ['Mining', 'Transport', 'Heavy Diesel', 'Shutdown', 'Mechanical', 'Civil', 'Electrical', 'Construction', 'Oil & Gas', 'Other'];
const statuses = ['draft', 'open', 'filled', 'on_hold', 'closed', 'cancelled'];

export default function JobFormDialog({ open, onOpenChange, job, onSave, isLoading }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (job) {
      setForm({ ...job });
    } else {
      setForm({ status: 'draft', positions_available: 1, positions_filled: 0 });
    }
  }, [job, open]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job' : 'Post New Job'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Job Title *</Label>
              <Input value={form.title || ''} onChange={e => update('title', e.target.value)} required />
            </div>
            <div>
              <Label>Client Name</Label>
              <Input value={form.client_name || ''} onChange={e => update('client_name', e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status || 'draft'} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location || ''} onChange={e => update('location', e.target.value)} />
            </div>
            <div>
              <Label>State</Label>
              <Select value={form.state || ''} onValueChange={v => update('state', v)}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job Type</Label>
              <Select value={form.job_type || ''} onValueChange={v => update('job_type', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {jobTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Industry</Label>
              <Select value={form.industry || ''} onValueChange={v => update('industry', v)}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Roster</Label>
              <Input value={form.roster || ''} onChange={e => update('roster', e.target.value)} placeholder="e.g. 2/1 FIFO" />
            </div>
            <div>
              <Label>Shift Hours</Label>
              <Input value={form.shift_hours || ''} onChange={e => update('shift_hours', e.target.value)} placeholder="e.g. 12 hours" />
            </div>
            <div>
              <Label>Pay Rate ($/hr)</Label>
              <Input type="number" value={form.pay_rate || ''} onChange={e => update('pay_rate', parseFloat(e.target.value))} />
            </div>
            <div>
              <Label>Charge Rate ($/hr)</Label>
              <Input type="number" value={form.charge_rate || ''} onChange={e => update('charge_rate', parseFloat(e.target.value))} />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date || ''} onChange={e => update('start_date', e.target.value)} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={form.end_date || ''} onChange={e => update('end_date', e.target.value)} />
            </div>
            <div>
              <Label>Positions Available</Label>
              <Input type="number" value={form.positions_available || 1} onChange={e => update('positions_available', parseInt(e.target.value))} />
            </div>
            <div>
              <Label>Purchase Order</Label>
              <Input value={form.purchase_order || ''} onChange={e => update('purchase_order', e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Job Description</Label>
            <Textarea value={form.description || ''} onChange={e => update('description', e.target.value)} className="h-24" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{job ? 'Update Job' : 'Create Job'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}