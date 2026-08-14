import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, Phone, Mail, MapPin, Users, ChevronDown, ChevronUp, LayoutGrid, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../components/shared/StatusBadge';
import ClientFormDialog from '@/components/clients/ClientFormDialog';
import ClientStateDashboard, { clientInState } from '@/components/clients/ClientStateDashboard';

export default function Clients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedClient, setExpandedClient] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [showAllClients, setShowAllClients] = useState(false);

  const { data: placements = [] } = useQuery({
    queryKey: ['placements'],
    queryFn: () => base44.entities.Placement.list('-created_date'),
    initialData: [],
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
    initialData: [],
  });

  const openForm = (client) => {
    setEditing(client);
    setShowForm(true);
  };

  const filtered = clients.filter(c => {
    const matchSearch = !search ||
      c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.primary_contact_name?.toLowerCase().includes(search.toLowerCase());
    const matchState = !selectedState || clientInState(c, selectedState);
    return matchSearch && matchState;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} total clients</p>
        </div>
        <Button onClick={() => openForm(null)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button
          variant={showAllClients ? 'default' : 'outline'}
          onClick={() => { setShowAllClients(!showAllClients); setSelectedState(null); }}
          className="gap-2"
        >
          <LayoutGrid className="w-4 h-4" />
          {showAllClients ? 'Hide List' : 'All Clients'}
        </Button>
      </div>

      {/* Featured Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Maliyan Industry Partners */}
        <div onClick={() => navigate('/clients/maliyan')} className="col-span-2 sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-primary to-primary/80 rounded-xl p-5 text-primary-foreground flex flex-col justify-between min-h-[110px] shadow-md cursor-pointer hover:opacity-90 transition-opacity">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 opacity-80" />
            <span className="text-xs font-semibold uppercase tracking-widest opacity-70">Partner</span>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Maliyan Industry Partners</h3>
            <p className="text-xs opacity-70 mt-1">Strategic Industry Partner</p>
          </div>
        </div>

        {/* State Cards */}
        {[
          { state: 'NSW', name: 'New South Wales', color: 'from-blue-600 to-blue-700', ring: 'ring-blue-400' },
          { state: 'WA', name: 'Western Australia', color: 'from-amber-500 to-amber-600', ring: 'ring-amber-400' },
          { state: 'SA', name: 'South Australia', color: 'from-red-600 to-red-700', ring: 'ring-red-400' },
          { state: 'NT', name: 'Northern Territory', color: 'from-orange-500 to-orange-600', ring: 'ring-orange-400' },
          { state: 'QLD', name: 'Queensland', color: 'from-purple-600 to-purple-700', ring: 'ring-purple-400' },
          { state: 'VIC', name: 'Victoria', color: 'from-teal-600 to-teal-700', ring: 'ring-teal-400' },
          { state: 'TAS', name: 'Tasmania', color: 'from-emerald-600 to-emerald-700', ring: 'ring-emerald-400' },
          { state: 'ACT', name: 'Australian Capital Territory', color: 'from-slate-600 to-slate-700', ring: 'ring-slate-400' },
        ].map(({ state, name, color, ring }) => {
          const count = clients.filter(c => clientInState(c, state)).length;
          const isSelected = selectedState === state;
          return (
            <div
              key={state}
              onClick={() => { setSelectedState(isSelected ? null : state); setShowAllClients(false); }}
              className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white flex flex-col justify-between min-h-[100px] shadow-sm cursor-pointer hover:scale-[1.02] transition-all ${isSelected ? `ring-4 ${ring} scale-[1.02]` : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 opacity-70" />
                  <span className="text-xs opacity-70 font-medium">State</span>
                </div>
                {isSelected && <X className="w-3.5 h-3.5 opacity-80" />}
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">{state}</p>
                <p className="text-[10px] opacity-60 leading-tight mt-0.5">{name}</p>
                {count > 0 && <p className="text-xs font-semibold mt-1 opacity-90">{count} client{count !== 1 ? 's' : ''}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium">
          {showAllClients ? 'All Clients' : selectedState ? `Clients in ${selectedState}` : 'State & Placement Dashboard'}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : showAllClients || selectedState ? (
        <>
          {selectedState && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filtered.length} client{filtered.length !== 1 ? 's' : ''} in {selectedState}
              </p>
              <Button variant="ghost" size="sm" onClick={() => setSelectedState(null)} className="gap-1.5 text-xs">
                <X className="w-3.5 h-3.5" /> Clear filter
              </Button>
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No clients found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(client => (
                <div
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{client.company_name}</h3>
                      <StatusBadge status={client.status} className="mt-1" />
                    </div>
                  </div>
                  {client.primary_contact_name && (
                    <p className="text-sm font-medium mb-1">{client.primary_contact_name}</p>
                  )}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {client.primary_contact_email && (
                      <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{client.primary_contact_email}</p>
                    )}
                    {client.primary_contact_phone && (
                      <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{client.primary_contact_phone}</p>
                    )}
                    {client.industry && <p className="mt-2 font-medium text-foreground">{client.industry}</p>}
                  </div>

                  {/* Employees / Placements */}
                  {(() => {
                    const clientPlacements = placements.filter(p => p.client_id === client.id);
                    const activeCount = clientPlacements.filter(p => p.status === 'active').length;
                    return (
                      <div className="mt-3 border-t border-border pt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedClient(expandedClient === client.id ? null : client.id); }}
                          className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span className="flex items-center gap-1.5 font-medium">
                            <Users className="w-3.5 h-3.5" /> Employees / Placements
                            {activeCount > 0 && <span className="inline-flex px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-semibold">{activeCount} active</span>}
                          </span>
                          {expandedClient === client.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {expandedClient === client.id && (
                          <div className="mt-2 space-y-1">
                            {clientPlacements.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic pl-1">No placements recorded.</p>
                            ) : (
                              clientPlacements.map(p => (
                                <div key={p.id} className="flex items-center justify-between gap-2 text-xs py-1">
                                  {p.candidate_id ? (
                                    <Link to={`/candidates/${p.candidate_id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-primary hover:underline truncate">
                                      {p.candidate_name || 'View candidate'}
                                    </Link>
                                  ) : (
                                    <span className="truncate">{p.candidate_name}</span>
                                  )}
                                  <span className="flex items-center gap-2 flex-shrink-0">
                                    {p.job_title && <span className="text-muted-foreground truncate max-w-[120px]">{p.job_title}</span>}
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${p.status === 'active' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                      {p.status === 'active' ? 'Active' : p.status}
                                    </span>
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <ClientStateDashboard clients={clients} placements={placements} />
      )}

      <ClientFormDialog client={editing} open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}