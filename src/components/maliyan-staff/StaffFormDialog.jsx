import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const DEPARTMENTS = ['Operations', 'Recruitment', 'Finance', 'Compliance', 'IT', 'Administration', 'Management', 'Other'];
const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'casual', label: 'Casual' },
  { value: 'contract', label: 'Contract' },
];

export default function StaffFormDialog({ open, onOpenChange, staff, onSave }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (staff) setFormData(staff);
    else setFormData({ employment_type: 'full_time', department: 'Operations', status: 'active' });
  }, [staff, open]);

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) return;
    setSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          <DialogDescription>Maliyan permanent staff record</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2"><Label>First Name *</Label><Input value={formData.first_name || ''} onChange={e => update('first_name', e.target.value)} /></div>
          <div className="space-y-2"><Label>Last Name *</Label><Input value={formData.last_name || ''} onChange={e => update('last_name', e.target.value)} /></div>
          <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.email || ''} onChange={e => update('email', e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone || ''} onChange={e => update('phone', e.target.value)} /></div>
          <div className="space-y-2"><Label>Position</Label><Input value={formData.position || ''} onChange={e => update('position', e.target.value)} /></div>
          <div className="space-y-2"><Label>Department</Label><Select value={formData.department} onValueChange={v => update('department', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Employment Type</Label><Select value={formData.employment_type} onValueChange={v => update('employment_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EMPLOYMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={formData.start_date || ''} onChange={e => update('start_date', e.target.value)} /></div>
          <div className="space-y-2"><Label>Location</Label><Input value={formData.location || ''} onChange={e => update('location', e.target.value)} /></div>
          <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={v => update('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="on_leave">On Leave</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="terminated">Terminated</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>LinkedIn</Label><Input value={formData.linked_in || ''} onChange={e => update('linked_in', e.target.value)} /></div>
          <div className="space-y-2"><Label>Emergency Contact</Label><Input placeholder="Name" value={formData.emergency_contact_name || ''} onChange={e => update('emergency_contact_name', e.target.value)} /></div>
          <div className="space-y-2"><Label>Emergency Phone</Label><Input value={formData.emergency_contact_phone || ''} onChange={e => update('emergency_contact_phone', e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea rows={2} value={formData.notes || ''} onChange={e => update('notes', e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!formData.first_name || !formData.last_name || !formData.email || saving}>{staff ? 'Save Changes' : 'Add Staff'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}