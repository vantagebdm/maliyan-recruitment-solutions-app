import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StaffFormDialog from '@/components/maliyan-staff/StaffFormDialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { Users, UserPlus, Search, Mail, Phone, Pencil, Trash2, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MaliyanStaffPortal() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['maliyanStaff'],
    queryFn: () => base44.entities.MaliyanStaff.list('-created_date'),
    initialData: [],
  });

  const filtered = staff.filter(s => {
    const matchesSearch = !search ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.position || '').toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleSave = async (data) => {
    if (editingStaff) await base44.entities.MaliyanStaff.update(editingStaff.id, data);
    else await base44.entities.MaliyanStaff.create(data);
    queryClient.invalidateQueries({ queryKey: ['maliyanStaff'] });
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    await base44.entities.MaliyanStaff.delete(id);
    queryClient.invalidateQueries({ queryKey: ['maliyanStaff'] });
  };

  const openEdit = (s) => { setEditingStaff(s); setDialogOpen(true); };
  const openAdd = () => { setEditingStaff(null); setDialogOpen(true); };

  const initials = (s) => `${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      <StaffFormDialog open={dialogOpen} onOpenChange={setDialogOpen} staff={editingStaff} onSave={handleSave} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Maliyan Staff Portal</h1>
        <p className="text-sm text-muted-foreground mt-1">Internal permanent staff directory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
          <div><p className="text-2xl font-bold">{staff.length}</p><p className="text-xs text-muted-foreground">Total Staff</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><Users className="w-5 h-5 text-success" /></div>
          <div><p className="text-2xl font-bold">{staff.filter(s => s.status === 'active').length}</p><p className="text-xs text-muted-foreground">Active</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Users className="w-5 h-5 text-warning" /></div>
          <div><p className="text-2xl font-bold">{staff.filter(s => s.status === 'on_leave').length}</p><p className="text-xs text-muted-foreground">On Leave</p></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Briefcase className="w-5 h-5 text-muted-foreground" /></div>
          <div><p className="text-2xl font-bold">{new Set(staff.map(s => s.department).filter(Boolean)).size}</p><p className="text-xs text-muted-foreground">Departments</p></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, position..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {['Operations', 'Recruitment', 'Finance', 'Compliance', 'IT', 'Administration', 'Management', 'Other'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Add Staff</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 opacity-30 mb-2" />
          <p className="text-sm font-medium">{staff.length === 0 ? 'No staff members yet' : 'No matches found'}</p>
          <p className="text-xs">{staff.length === 0 ? 'Add your first staff member to get started.' : 'Try a different search or filter.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {s.photo_url ? <img src={s.photo_url} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-sm font-bold text-primary">{initials(s)}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.position || '—'}</p>
                  <div className="mt-1"><StatusBadge status={s.status} /></div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-2 truncate"><Mail className="w-3 h-3 flex-shrink-0" />{s.email || '—'}</p>
                <p className="flex items-center gap-2"><Phone className="w-3 h-3 flex-shrink-0" />{s.phone || '—'}</p>
                <p className="flex items-center gap-2"><MapPin className="w-3 h-3 flex-shrink-0" />{s.location || '—'}</p>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{(s.department || 'other').replace(/_/g, ' ')}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{(s.employment_type || 'full_time').replace(/_/g, ' ')}</span>
                <div className="flex-1" />
                <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-muted rounded-md transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}