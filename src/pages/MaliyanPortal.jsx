import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Upload, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PARTNERS = [
  { id: 'sts', name: 'STS', fullName: 'STS Recruitment' },
  { id: 'nhm', name: 'NHM', fullName: 'NHM' },
  { id: 'app', name: 'APP', fullName: 'APP' },
  { id: 'mip', name: 'MIP Hydraulics', fullName: 'MIP Hydraulics' },
];

function PartnerCard({ partner, logo, onLogoUpload, onLogoRemove }) {
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
    <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4 hover:shadow-md transition-shadow">
      {/* Logo area */}
      <div className="relative w-28 h-28 rounded-xl bg-muted flex items-center justify-center overflow-hidden group">
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
          <label className="flex flex-col items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-4 text-center">
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
        <h3 className="text-lg font-bold">{partner.name}</h3>
        <p className="text-sm text-muted-foreground">{partner.fullName}</p>
      </div>

      {/* Replace logo button if logo exists */}
      {logo && (
        <label className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-2 transition-colors">
          {uploading ? 'Uploading...' : 'Replace Logo'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      )}
    </div>
  );
}

export default function MaliyanPortal() {
  const [logos, setLogos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('maliyan_logos') || '{}'); } catch { return {}; }
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
          {PARTNERS.map(partner => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              logo={logos[partner.id]}
              onLogoUpload={handleLogoUpload}
              onLogoRemove={handleLogoRemove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}