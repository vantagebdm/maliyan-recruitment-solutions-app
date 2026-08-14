import React from 'react';
import { Building2, Users, MapPin, TrendingUp, Briefcase } from 'lucide-react';

const STATES = [
  { state: 'NSW', name: 'New South Wales', color: 'from-blue-600 to-blue-700', ring: 'ring-blue-500' },
  { state: 'WA', name: 'Western Australia', color: 'from-amber-500 to-amber-600', ring: 'ring-amber-500' },
  { state: 'SA', name: 'South Australia', color: 'from-red-600 to-red-700', ring: 'ring-red-500' },
  { state: 'NT', name: 'Northern Territory', color: 'from-orange-500 to-orange-600', ring: 'ring-orange-500' },
  { state: 'QLD', name: 'Queensland', color: 'from-purple-600 to-purple-700', ring: 'ring-purple-500' },
  { state: 'VIC', name: 'Victoria', color: 'from-teal-600 to-teal-700', ring: 'ring-teal-500' },
  { state: 'TAS', name: 'Tasmania', color: 'from-emerald-600 to-emerald-700', ring: 'ring-emerald-500' },
  { state: 'ACT', name: 'Australian Capital Territory', color: 'from-slate-600 to-slate-700', ring: 'ring-slate-500' },
];

export function clientInState(client, state) {
  return client.site_locations?.some(s => s.includes(state)) || client.billing_address?.includes(state);
}

export default function ClientStateDashboard({ clients = [], placements = [] }) {
  const activePlacements = placements.filter(p => p.status === 'active');
  const totalPlacements = placements.length;

  return (
    <div className="space-y-4">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-xs text-muted-foreground">Total Clients</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activePlacements.length}</p>
            <p className="text-xs text-muted-foreground">Active Placements</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Briefcase className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalPlacements}</p>
            <p className="text-xs text-muted-foreground">Total Placements</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <MapPin className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{STATES.filter(s => clients.some(c => clientInState(c, s.state))).length}</p>
            <p className="text-xs text-muted-foreground">States Covered</p>
          </div>
        </div>
      </div>

      {/* Per-state breakdown */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Clients & Placements by State
          </h3>
        </div>
        <div className="divide-y divide-border">
          {STATES.map(({ state, name, color }) => {
            const stateClients = clients.filter(c => clientInState(c, state));
            const statePlacements = placements.filter(p => stateClients.some(c => c.id === p.client_id));
            const stateActive = statePlacements.filter(p => p.status === 'active').length;
            const hasData = stateClients.length > 0;
            return (
              <div key={state} className={`flex items-center gap-4 p-3 ${hasData ? '' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                  {state}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{name}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold">{stateClients.length}</p>
                    <p className="text-[10px] text-muted-foreground">Clients</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{stateActive}</p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{statePlacements.length}</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}