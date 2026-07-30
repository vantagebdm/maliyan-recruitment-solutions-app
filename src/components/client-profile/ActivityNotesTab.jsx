import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Plus, Phone, Mail, RefreshCw, MessageSquare, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'change', label: 'Change', icon: RefreshCw },
  { value: 'note', label: 'Note', icon: MessageSquare },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
];

const typeIcon = (t) => TYPES.find(x => x.value === t)?.icon || MessageSquare;

export default function ActivityNotesTab({ client }) {
  const queryClient = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ type: 'call', description: '', by: '' });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.update(client.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', client.id] }),
  });

  const add = (e) => {
    e.preventDefault();
    const activities = [{ type: form.type, description: form.description, by: form.by, date: new Date().toISOString() }, ...(client.client_activities || [])];
    saveMutation.mutate({ client_activities: activities });
    setShow(false);
    setForm({ type: 'call', description: '', by: '' });
  };

  const remove = (idx) => {
    const activities = (client.client_activities || []).filter((_, i) => i !== idx);
    saveMutation.mutate({ client_activities: activities });
  };

  const activities = client.client_activities || [];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Activities</h3>
          {activities.length > 0 && <span className="text-xs text-muted-foreground">({activities.length})</span>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShow(true)} className="gap-1 text-xs">
          <Plus className="w-3 h-3" /> Add Activity
        </Button>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No activities recorded.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activities.map((a, idx) => {
            const Icon = typeIcon(a.type);
            return (
              <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="uppercase font-medium">{a.type}</span>
                    {a.by && <span>· {a.by}</span>}
                    {a.date && <span>· {format(new Date(a.date), 'dd MMM yyyy HH:mm')}</span>}
                  </div>
                </div>
                <button onClick={() => remove(idx)} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Activity</DialogTitle></DialogHeader>
          <form onSubmit={add} className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Description *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="h-24" required /></div>
            <div><Label>Recorded By</Label><Input value={form.by} onChange={e => setForm({ ...form, by: e.target.value })} placeholder="Name" /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShow(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending || !form.description}>Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}