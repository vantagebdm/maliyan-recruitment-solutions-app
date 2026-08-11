import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, Upload, X, ArrowRight, Mail, Phone, Users, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PartnerPortal from '@/components/maliyan/PartnerPortal';
import StatusBadge from '@/components/shared/StatusBadge';

const PARTNERS = [
  { id: 'sts', name: 'STS', fullName: 'Specialised Truck Services', clientCompany: 'M.F HOLDING WA PTY LTD' },
  { id: 'nhm', name: 'NHM', fullName: 'NHM' },
  { id: 'app', name: 'APP', fullName: 'Alliance Priority Parts', clientCompany: 'Alliance Priority Parts' },
  { id: 'mip', name: 'MIP Hydraulics', fullName: 'MIP Hydraulics' },
];

function PartnerCard({ partner, logo, onLogoUpload, onLogoRemove, onOpen, client, activeCount }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onLogoUpload(partner.id, file_url);
    setUploading(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Logo area */}
      <div className="relative w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden group mx-auto">
        {logo ? (
          <>
            <img src={logo} alt={partner.name} className="w-full h-full object-contain p-2" />
            <button
              onClick={() => onLogoRemove(partner.id)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <label className="flex flex-col items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-3 text-center">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-[10px] font-medium leading-tight">Upload Logo</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
        )}
      </div>

      {/* Partner Info */}
      <div className="text-center">
        <h3 className="text-lg font-bold leading-tight">{client?.company_name || partner.fullName}</h3>
        {client ? (
          <div className="flex justify-center mt-1"><StatusBadge status={client.status} /></div>
        ) : (
          <p className="text-sm text-muted-foreground">{partner.fullName}</p>
        )}
      </div>

      {/* Contact details from linked client */}
      {client && (
        <div className="space-y-1 text-xs text-muted-foreground">
          {client.primary_contact_name && <p className="font-medium text-foreground">{client.primary_contact_name}</p>}
          {client.primary_contact_email && (
            <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{client.primary_contact_email}</span></p>
          )}
          {client.primary_contact_phone && (
            <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0" />{client.primary_contact_phone}</p>
          )}
          {client.industry && <p className="font-medium text-foreground mt-1">{client.industry}</p>}
        </div>
      )}

      {/* Replace logo link if logo exists */}
      {logo && (
        <label className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-2 transition-colors text-center">
          {uploading ? 'Uploading...' : 'Replace Logo'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      )}

      {/* Employees / Placements */}
      <div className="border-t border-border pt-3">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5" /> Employees / Placements
            {activeCount > 0 && <span className="inline-flex px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-semibold">{activeCount} active</span>}
          </span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Open Portal */}
      <button
        onClick={onOpen}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg py-2 hover:bg-primary/90 transition-colors"
      >
        Open Portal <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function MaliyanPortal() {
  const [openPartner, setOpenPartner] = useState(null);
  const [logos, setLogos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('maliyan_logos') || '{}'); } catch { return {}; }
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
    initialData: [],
  });

  const { data: placements = [] } = useQuery({
    queryKey: ['placements'],
    queryFn: () => base44.entities.Placement.list('-created_date'),
    initialData: [],
  });

  const handleLogoUpload = (id, url) => {
    const updated = { ...logos, [id]: url };
    setLogos(updated);
    localStorage.setItem('maliyan_logos', JSON.stringify(updated));
  };

  const handleLogoRemove = (id) => {
    const updated = { ...logos };
    delete updated[id];
    setLogos(updated);
    localStorage.setItem('maliyan_logos', JSON.stringify(updated));
  };

  if (openPartner) {
    return <PartnerPortal partner={openPartner} logo={logos[openPartner.id]} onBack={() => setOpenPartner(null)} />;
  }

  return (
    <div className="space-y-6">
      <Link to="/clients" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-8 text-primary-foreground shadow-lg">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest opacity-70 mb-1">Strategic Industry Partner</p>
            <h1 className="text-3xl font-black">Maliyan Industry Partners</h1>
            <p className="text-sm opacity-70 mt-1">Partner Portal — STS Recruitment Hub</p>
          </div>
        </div>
      </div>

      {/* Partner Cards */}
      <div>
        <h2 className="text-base font-semibold mb-4 text-muted-foreground uppercase tracking-wide text-xs">Partner Businesses</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PARTNERS.map(partner => {
            const client = partner.clientCompany
              ? clients.find(c => c.company_name === partner.clientCompany)
              : null;
            const activeCount = client
              ? placements.filter(p => p.client_id === client.id && p.status === 'active').length
              : 0;
            return (
              <PartnerCard
                key={partner.id}
                partner={partner}
                logo={logos[partner.id]}
                onLogoUpload={handleLogoUpload}
                onLogoRemove={handleLogoRemove}
                onOpen={() => setOpenPartner(partner)}
                client={client}
                activeCount={activeCount}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}