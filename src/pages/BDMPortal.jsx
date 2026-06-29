import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ClipboardCheck, Star, Search, TrendingUp, CheckCircle2 } from 'lucide-react';
import { POLICY_CATEGORIES, PRIORITY_POLICIES, getAllPolicies, policyKey, isPriority } from '@/components/bdm/policyData';
import PolicyCategory from '@/components/bdm/PolicyCategory';
import PolicyItemPanel from '@/components/bdm/PolicyItemPanel';

export default function BDMPortal() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | priority | incomplete
  const [manageItem, setManageItem] = useState(null); // { category, policy }

  // Fetch tracker record
  const { data: tracker, isLoading } = useQuery({
    queryKey: ['policyTracker'],
    queryFn: async () => {
      const list = await base44.entities.PolicyTracker.list('-created_date', 1);
      if (list && list.length > 0) return list[0];
      // create initial record
      const created = await base44.entities.PolicyTracker.create({ policies: {}, notes: '' });
      return created;
    },
  });

  const checkedMap = tracker?.policies || {};

  const toggleMutation = useMutation({
    mutationFn: async ({ category, policy }) => {
      const key = policyKey(category, policy);
      const current = checkedMap[key]?.checked || false;
      const user = await base44.auth.me().catch(() => null);
      const newEntry = !current
        ? { checked: true, checked_by_name: user?.full_name || 'Unknown', checked_date: new Date().toISOString() }
        : { checked: false, checked_by_name: null, checked_date: null };
      const updatedPolicies = { ...checkedMap, [key]: newEntry };
      if (!current === false) delete updatedPolicies[key];
      const result = await base44.entities.PolicyTracker.update(tracker.id, { policies: updatedPolicies });
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policyTracker'] }),
  });

  // Stats
  const allPolicies = useMemo(() => getAllPolicies(), []);
  const totalChecked = allPolicies.filter((p) => checkedMap[policyKey(p.category, p.policy)]?.checked).length;
  const totalPolicies = allPolicies.length;
  const overallPct = totalPolicies > 0 ? Math.round((totalChecked / totalPolicies) * 100) : 0;

  const priorityChecked = PRIORITY_POLICIES.filter((p) => {
    return allPolicies.some((ap) => ap.policy === p && checkedMap[policyKey(ap.category, ap.policy)]?.checked);
  }).length;
  const priorityPct = PRIORITY_POLICIES.length > 0 ? Math.round((priorityChecked / PRIORITY_POLICIES.length) * 100) : 0;

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    return POLICY_CATEGORIES.map((cat) => ({
      ...cat,
      policies: cat.policies.filter((p) => {
        if (q && !p.toLowerCase().includes(q) && !cat.name.toLowerCase().includes(q)) return false;
        const key = policyKey(cat.name, p);
        const isChecked = !!checkedMap[key]?.checked;
        if (filter === 'priority' && !isPriority(p)) return false;
        if (filter === 'incomplete' && isChecked) return false;
        return true;
      }),
    })).filter((cat) => cat.policies.length > 0);
  }, [search, filter, checkedMap]);

  const handleToggle = (category, policy) => {
    if (tracker) toggleMutation.mutate({ category, policy });
  };

  const updateEntryMutation = useMutation({
    mutationFn: async ({ category, policy, updatedEntry }) => {
      const key = policyKey(category, policy);
      const updatedPolicies = { ...checkedMap, [key]: { ...checkedMap[key], ...updatedEntry } };
      const result = await base44.entities.PolicyTracker.update(tracker.id, { policies: updatedPolicies });
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['policyTracker'] }),
  });

  const handleManage = (category, policy) => {
    setManageItem({ category, policy });
  };

  const handlePanelUpdate = (updatedEntry) => {
    if (manageItem && tracker) {
      updateEntryMutation.mutate({ category: manageItem.category, policy: manageItem.policy, updatedEntry });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-8 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <ClipboardCheck className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest opacity-70 mb-1">Business Development</p>
            <h1 className="text-3xl font-black">BDM Portal</h1>
            <p className="text-sm opacity-70 mt-1">Policy Governance Tracker — Maliyan Industry Partners</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-4xl font-black">{overallPct}%</p>
            <p className="text-xs opacity-70">{totalChecked} / {totalPolicies} policies</p>
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="mt-5 h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-black">{totalChecked}/{totalPolicies}</p>
            <p className="text-xs text-muted-foreground">Policies Complete</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-accent fill-accent" />
          </div>
          <div>
            <p className="text-2xl font-black">{priorityChecked}/{PRIORITY_POLICIES.length}</p>
            <p className="text-xs text-muted-foreground">Priority Launch ({priorityPct}%)</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-black">{POLICY_CATEGORIES.length}</p>
            <p className="text-xs text-muted-foreground">Policy Categories</p>
          </div>
        </div>
      </div>

      {/* Priority Launch section */}
      <div className="bg-gradient-to-r from-accent/10 to-transparent border border-accent/30 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-accent fill-accent" />
          <h2 className="font-bold text-sm">Priority for Initial Launch</h2>
          <span className="text-xs text-muted-foreground">— {priorityChecked} of {PRIORITY_POLICIES.length} complete</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div className="h-full bg-accent transition-all duration-500" style={{ width: `${priorityPct}%` }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_POLICIES.map((p) => {
            const entry = allPolicies.find((ap) => ap.policy === p);
            const isChecked = entry ? !!checkedMap[policyKey(entry.category, entry.policy)]?.checked : false;
            return (
              <span
                key={p}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${isChecked ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 line-through opacity-60' : 'bg-card text-muted-foreground border-border'}`}
              >
                {p}
              </span>
            );
          })}
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-lg bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'priority', label: 'Priority Only' },
            { key: 'incomplete', label: 'Incomplete' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${filter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category list */}
      <div className="space-y-3">
        {filteredCategories.map((cat) => (
          <PolicyCategory
            key={cat.name}
            category={cat.name}
            color={cat.color}
            policies={cat.policies}
            checkedMap={checkedMap}
            onToggle={handleToggle}
            onManage={handleManage}
          />
        ))}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No policies match your search.</p>
          </div>
        )}
      </div>

      {/* Policy item management panel */}
      {manageItem && (
        <PolicyItemPanel
          category={manageItem.category}
          policy={manageItem.policy}
          entry={checkedMap[policyKey(manageItem.category, manageItem.policy)] || { checked: true }}
          onUpdate={handlePanelUpdate}
          onClose={() => setManageItem(null)}
        />
      )}
    </div>
  );
}