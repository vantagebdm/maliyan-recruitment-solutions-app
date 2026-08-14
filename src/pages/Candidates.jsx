import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import CandidateFormDialog from '../components/candidates/CandidateFormDialog';
import CandidateColumn from '../components/candidates/CandidateColumn';

export default function Candidates() {
  const [search, setSearch] = useState('');
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
    if (!search) return true;
    const q = search.toLowerCase();
    return `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.trade?.toLowerCase().includes(q);
  });

  const { activeCands, pipelineCands, inactiveCands } = useMemo(() => {
    const active = [];
    const pipeline = [];
    const inactive = [];
    for (const c of filtered) {
      const stage = c.candidate_stage || 'available';
      if (stage === 'active') {
        active.push(c);
      } else if (['inactive', 'archived', 'demobbed'].includes(stage)) {
        inactive.push(c);
      } else {
        pipeline.push(c);
      }
    }
    return { activeCands: active, pipelineCands: pipeline, inactiveCands: inactive };
  }, [filtered]);

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
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <CandidateColumn
            title="Active"
            subtitle="In active placements"
            accentClass="bg-emerald-500/10 text-emerald-700"
            candidates={activeCands}
            onEdit={(c) => { setEditingCandidate(c); setShowForm(true); }}
          />
          <CandidateColumn
            title="Pipeline / Pending"
            subtitle="Available, applied, mobilising"
            accentClass="bg-blue-500/10 text-blue-700"
            candidates={pipelineCands}
            onEdit={(c) => { setEditingCandidate(c); setShowForm(true); }}
          />
          <CandidateColumn
            title="Inactive / Archived"
            subtitle="Demobbed, inactive, archived"
            accentClass="bg-muted text-muted-foreground"
            candidates={inactiveCands}
            onEdit={(c) => { setEditingCandidate(c); setShowForm(true); }}
          />
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