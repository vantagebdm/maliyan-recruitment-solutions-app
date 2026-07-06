import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function PayRunFolderDialog({ open, onOpenChange, onConfirm, selectedCount }) {
  const [clients, setClients] = useState([]);
  const [clientName, setClientName] = useState('');
  const [weekEnding, setWeekEnding] = useState('');
  const [payCycle, setPayCycle] = useState('weekly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      Promise.all([
        base44.entities.Client.list().catch(() => []),
        base44.entities.PartnerHub.list().catch(() => [])
      ]).then(([clientData, partnerData]) => {
        const partnerClients = partnerData.map(p => ({
          id: p.id,
          company_name: p.partner_id,
          is_partner: true
        }));
        setClients([...clientData, ...partnerClients]);
      });
      setClientName('');
      setWeekEnding('');
      setPayCycle('weekly');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!clientName || !weekEnding || !payCycle) return;
    setLoading(true);
    const selected = clients.find(c => c.company_name === clientName);
    onConfirm({
      client_name: clientName,
      client_id: selected?.id,
      week_ending: weekEnding,
      pay_cycle: payCycle
    });
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Pay Run Folder</DialogTitle>
          <DialogDescription>
            Enter folder details for the {selectedCount} approved timesheet{selectedCount !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Select value={clientName} onValueChange={setClientName}>
              <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.company_name}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Week Ending</Label>
            <Input type="date" value={weekEnding} onChange={e => setWeekEnding(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Pay Cycle</Label>
            <Select value={payCycle} onValueChange={setPayCycle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="fortnightly">Fortnightly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!clientName || !weekEnding || loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Folder &amp; Approve ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}