import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Building2, User, Wrench, FileText, BarChart2, ExternalLink, Plus, Trash2, Upload, Save, X } from 'lucide-react';
import OrgChart from '@/components/maliyan/OrgChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const TABS = [
  { id: 'profile', label: 'Company Profile', icon: Building2 },
  { id: 'details', label: 'Business Details', icon: FileText },
  { id: 'structure', label: 'Company Structure', icon: User },
  { id: 'capabilities', label: 'Capabilities', icon: Wrench },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
];

function Field({ label, value, onChange, multiline }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {multiline ? (
        <Textarea value={value || ''} onChange={e => onChange(e.target.value)} className="text-sm resize-none" rows={3} />
      ) : (
        <Input value={value || ''} onChange={e => onChange(e.target.value)} className="text-sm" />
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h3 className="font-bold text-sm text-foreground">{title}</h3>
      {children}
    </div>
  );
}

export default function PartnerPortal({ partner, logo, onBack }) {
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const { data: records = [] } = useQuery({
    queryKey: ['partner_hub', partner.id],
    queryFn: () => base44.entities.PartnerHub.filter({ partner_id: partner.id }),
    initialData: [],
  });

  const existing = records[0];

  const [data, setData] = useState(null);

  useEffect(() => {
    if (existing && data === null) {
      setData(existing);
    } else if (!existing && data === null) {
      setData({ partner_id: partner.id, company_profile: {}, business_details: {}, company_structure: [], capabilities: [], documents: [] });
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: () => existing
      ? base44.entities.PartnerHub.update(existing.id, data)
      : base44.entities.PartnerHub.create(data),
    onSuccess: () => queryClient.invalidateQueries(['partner_hub', partner.id]),
  });

  const setProfile = (key, val) => setData(d => ({ ...d, company_profile: { ...d.company_profile, [key]: val } }));
  const setDetails = (key, val) => setData(d => ({ ...d, business_details: { ...d.business_details, [key]: val } }));

  const addCapability = () => setData(d => ({ ...d, capabilities: [...(d.capabilities || []), ''] }));
  const updateCapability = (i, val) => setData(d => { const arr = [...(d.capabilities || [])]; arr[i] = val; return { ...d, capabilities: arr }; });
  const removeCapability = (i) => setData(d => ({ ...d, capabilities: d.capabilities.filter((_, idx) => idx !== i) }));

  const [docUploading, setDocUploading] = useState(false);
  const uploadDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setData(d => ({
      ...d,
      documents: [...(d.documents || []), { name: file.name, category: 'General', file_url, uploaded_date: new Date().toISOString().split('T')[0] }]
    }));
    setDocUploading(false);
  };
  const removeDoc = (i) => setData(d => ({ ...d, documents: d.documents.filter((_, idx) => idx !== i) }));
  const updateDocName = (i, val) => setData(d => { const arr = [...(d.documents || [])]; arr[i] = { ...arr[i], name: val }; return { ...d, documents: arr }; });
  const updateDocCategory = (i, val) => setData(d => { const arr = [...(d.documents || [])]; arr[i] = { ...arr[i], category: val }; return { ...d, documents: arr }; });

  if (!data) return <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Maliyan Partners
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-2xl p-7 text-primary-foreground shadow-lg flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 overflow-hidden flex items-center justify-center">
            {logo ? <img src={logo} alt={partner.name} className="w-full h-full object-contain p-1" /> : <Building2 className="w-8 h-8 text-white" />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Partner Business</p>
            <h1 className="text-2xl font-black">{partner.fullName}</h1>
            {data.company_profile?.tagline && <p className="text-sm opacity-70 mt-0.5">{data.company_profile.tagline}</p>}
          </div>
        </div>
        {data.hub_url && (
          <a href={data.hub_url} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" /> {data.hub_label || 'Open Hub'}
            </Button>
          </a>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">

        {activeTab === 'profile' && (
          <SectionCard title="Company Profile">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Tagline" value={data.company_profile?.tagline} onChange={v => setProfile('tagline', v)} />
              <Field label="Founded Year" value={data.company_profile?.founded_year} onChange={v => setProfile('founded_year', v)} />
              <Field label="Headquarters" value={data.company_profile?.headquarters} onChange={v => setProfile('headquarters', v)} />
              <Field label="Website" value={data.company_profile?.website} onChange={v => setProfile('website', v)} />
              <Field label="Email" value={data.company_profile?.email} onChange={v => setProfile('email', v)} />
              <Field label="Phone" value={data.company_profile?.phone} onChange={v => setProfile('phone', v)} />
            </div>
            <Field label="Company Overview" value={data.company_profile?.overview} onChange={v => setProfile('overview', v)} multiline />
          </SectionCard>
        )}

        {activeTab === 'details' && (
          <SectionCard title="Business Details">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Legal Name" value={data.business_details?.legal_name} onChange={v => setDetails('legal_name', v)} />
              <Field label="Trading Name" value={data.business_details?.trading_name} onChange={v => setDetails('trading_name', v)} />
              <Field label="ABN" value={data.business_details?.abn} onChange={v => setDetails('abn', v)} />
              <Field label="ACN" value={data.business_details?.acn} onChange={v => setDetails('acn', v)} />
              <Field label="Business Type" value={data.business_details?.business_type} onChange={v => setDetails('business_type', v)} />
              <Field label="Industry" value={data.business_details?.industry} onChange={v => setDetails('industry', v)} />
              <Field label="Payment Terms" value={data.business_details?.payment_terms} onChange={v => setDetails('payment_terms', v)} />
              <Field label="Registered Address" value={data.business_details?.registered_address} onChange={v => setDetails('registered_address', v)} />
            </div>
          </SectionCard>
        )}

        {activeTab === 'structure' && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-2">
            <h3 className="font-bold text-sm text-foreground mb-4">Company Structure — Org Chart</h3>
            <OrgChart
              nodes={data.company_structure || []}
              onChange={nodes => setData(d => ({ ...d, company_structure: nodes }))}
            />
          </div>
        )}

        {activeTab === 'capabilities' && (
          <SectionCard title="Capabilities">
            <div className="space-y-2">
              {(data.capabilities || []).map((cap, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={cap} onChange={e => updateCapability(i, e.target.value)} className="text-sm" placeholder="e.g. FIFO Labour Hire" />
                  <button onClick={() => removeCapability(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCapability} className="gap-2 mt-2"><Plus className="w-4 h-4" />Add Capability</Button>
            </div>
          </SectionCard>
        )}

        {activeTab === 'documents' && (
          <SectionCard title="Company Documents">
            <div className="space-y-3">
              {(data.documents || []).map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 grid sm:grid-cols-2 gap-2">
                    <Input value={doc.name} onChange={e => updateDocName(i, e.target.value)} className="text-sm h-8" placeholder="Document name" />
                    <Input value={doc.category} onChange={e => updateDocCategory(i, e.target.value)} className="text-sm h-8" placeholder="Category" />
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs whitespace-nowrap">View</a>
                  <button onClick={() => removeDoc(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <span>{docUploading ? 'Uploading...' : <><Upload className="w-4 h-4" />Upload Document</>}</span>
                </Button>
                <input type="file" className="hidden" onChange={uploadDoc} disabled={docUploading} />
              </label>
            </div>
          </SectionCard>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            <SectionCard title="Business Hub Access">
              <p className="text-sm text-muted-foreground">Link to this partner's dedicated business hub (e.g. STS Service Hub).</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Hub Label" value={data.hub_label} onChange={v => setData(d => ({ ...d, hub_label: v }))} />
                <Field label="Hub URL" value={data.hub_url} onChange={v => setData(d => ({ ...d, hub_url: v }))} />
              </div>
              {data.hub_url && (
                <a href={data.hub_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="gap-2 mt-1"><ExternalLink className="w-4 h-4" />{data.hub_label || 'Open Hub'}</Button>
                </a>
              )}
            </SectionCard>
            <SectionCard title="Financial & Labour Reports">
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                Reports coming soon — this section will house business-specific financial and labour data.
              </div>
            </SectionCard>
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end pt-2">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" />{saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}