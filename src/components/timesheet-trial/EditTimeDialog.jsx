import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

const FIELDS = [
  { key: 'clockIn', label: 'Clock-in' },
  { key: 'lunchStart', label: 'Lunch start' },
  { key: 'lunchFinish', label: 'Lunch finish' },
  { key: 'clockOut', label: 'Clock-out' },
];

export default function EditTimeDialog({ open, onOpenChange, day, employeeName, onSave }) {
  const [draft, setDraft] = useState(null);
  const [reason, setReason] = useState('');

  React.useEffect(() => {
    if (day) {
      setDraft({
        clockIn: day.clockIn || '',
        lunchStart: day.lunchStart || '',
        lunchFinish: day.lunchFinish || '',
        clockOut: day.clockOut || '',
      });
      setReason('');
    }
  }, [day]);

  if (!day || !draft) return null;

  const changed = FIELDS.some(f => (draft[f.key] || '') !== (day[f.key] || ''));
  const reasonMissing = changed && !reason.trim();

  const handleSave = () => {
    if (reasonMissing) return;
    const changes = FIELDS
      .filter(f => (draft[f.key] || '') !== (day[f.key] || ''))
      .map(f => ({ field: f.key, fieldLabel: f.label, oldTime: day[f.key] || '', newTime: draft[f.key] || '' }));
    onSave({ updatedDay: { ...draft }, changes, reason: reason.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit clocking — {employeeName}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1">Date: {day.date}</p>
        <div className="grid grid-cols-2 gap-3 py-2">
          {FIELDS.map(f => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-xs">{f.label}</Label>
              <Input
                type="time"
                value={draft[f.key]}
                onChange={e => setDraft({ ...draft, [f.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Reason for change <span className="text-destructive">*</span></Label>
          <Textarea
            placeholder="Reason is required when any recorded time is changed"
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
          />
        </div>
        {reasonMissing && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertTriangle className="w-3.5 h-3.5" />
            A reason is required because a recorded time has changed.
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={reasonMissing}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}