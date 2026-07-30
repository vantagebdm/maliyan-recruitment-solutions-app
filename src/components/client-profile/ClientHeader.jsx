import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, MapPin, Building2, Pencil } from 'lucide-react';

const STATUS_CONFIG = {
  active: { label: 'Active', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  inactive: { label: 'Inactive', cls: 'bg-red-500/10 text-red-600 border-red-500/30' },
  prospect: { label: 'Prospect', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
};

export default function ClientHeader({ client, onEdit, onStatusChange }) {
  const status = STATUS_CONFIG[client.status] || STATUS_CONFIG.active;
  const mainLocation = client.billing_address || client.site_address || (client.site_locations?.[0]);

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start gap-5">
        <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {client.logo_url ? (
            <img src={client.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-9 h-9 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            {client.client_id && <span className="text-sm font-bold text-primary">{client.client_id}</span>}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight mb-2">{client.company_name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {client.industry && <span className="font-medium text-foreground">{client.industry}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {client.primary_contact_email && (
              <a href={`mailto:${client.primary_contact_email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <Mail className="w-3 h-3" /> {client.primary_contact_email}
              </a>
            )}
            {client.primary_contact_phone && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" /> {client.primary_contact_phone}
              </span>
            )}
            {mainLocation && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" /> {mainLocation}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1">
            <Pencil className="w-3 h-3" /> Edit Client
          </Button>
          <Select value={client.status || 'active'} onValueChange={onStatusChange}>
            <SelectTrigger className="w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}