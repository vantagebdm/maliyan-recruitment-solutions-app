import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Star, MapPin, Phone, Mail, Eye, Pencil } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import TrafficLight from '../components/shared/TrafficLight';
import CandidateFormDialog from '../components/candidates/CandidateFormDialog';

export default function Candidates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => base44.entities.Candidate.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Candidate.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['candidates'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Candidate.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['candidates'] }); setShowForm(false); setEditingCandidate(null); },
  });

  const handleSave = (data) => {
    if (editingCandidate) {
      updateMutation.mutate({ id: editingCandidate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = candidates.filter(c => {
    const matchSearch = !search || 
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.trade?.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'all' || c.candidate_stage === stageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-1">{candidates.length} total candidates</p>
        </div>
        <Button onClick={() => { setEditingCandidate(null); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Candidate
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, trade..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="mobilising">Mobilising</SelectItem>
            <SelectItem value="demobbed">Demobbed</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No candidates found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(c => (
            <div
              key={c.id}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  onClick={() => navigate(`/candidates/${c.id}`)}
                  className="flex flex-1 items-center gap-4 cursor-pointer min-w-0"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-sm">{c.first_name} {c.last_name}</h3>
                      <StatusBadge status={c.candidate_stage || 'available'} />
                      <TrafficLight status={c.compliance_status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {c.trade && <span className="font-medium text-foreground">{c.trade}</span>}
                      {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                      {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                      {c.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>}
                      {c.fifo_available && <span className="text-emerald-600 font-medium">FIFO ✓</span>}
                    </div>
                  </div>
                </div>
                {c.rating > 0 && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{c.rating}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/candidates/${c.id}`)} className="gap-1 text-xs">
                    <Eye className="w-3.5 h-3.5" /> View Card
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingCandidate(c); setShowForm(true); }} className="text-xs">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CandidateFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        candidate={editingCandidate}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}