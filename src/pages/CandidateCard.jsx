import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Mail, Phone, MapPin, Star, Linkedin, Facebook, Pencil, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import CandidateFormDialog from '@/components/candidates/CandidateFormDialog';
import QuickAccess from '@/components/candidate-card/QuickAccess';
import PersonalDetails from '@/components/candidate-card/PersonalDetails';
import AvailabilitySection from '@/components/candidate-card/AvailabilitySection';
import CommentsSection from '@/components/candidate-card/CommentsSection';
import VerificationSection from '@/components/candidate-card/VerificationSection';
import DocumentationSection from '@/components/candidate-card/DocumentationSection';
import ActivitiesSection from '@/components/candidate-card/ActivitiesSection';
import PlacementsSection from '@/components/candidate-card/PlacementsSection';
import { Briefcase, Clock, Calendar } from 'lucide-react';

const STAGE_CONFIG = {
  available: { label: 'Available', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  active: { label: 'Active', cls: 'bg-green-500/10 text-green-700 border-green-500/30' },
  applied: { label: 'Applied', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  mobilising: { label: 'Mobilising', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  demobbed: { label: 'Demobbed', cls: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  inactive: { label: 'Inactive', cls: 'bg-red-500/10 text-red-600 border-red-500/30' },
  archived: { label: 'Archived', cls: 'bg-muted text-muted-foreground border-border' },
};

export const STATUS_CONFIG = {
  active: { label: 'Active', cls: 'bg-green-500/10 text-green-700 border-green-500/30' },
  inactive: { label: 'Inactive', cls: 'bg-red-500/10 text-red-600 border-red-500/30' },
  blacklisted: { label: 'Blacklisted', cls: 'bg-red-600/10 text-red-700 border-red-600/30' },
  suspended_host_only: { label: 'Suspended (Host Only)', cls: 'bg-orange-500/10 text-orange-700 border-orange-500/30' },
  suspended_stood_down: { label: 'Suspended (Stood Down)', cls: 'bg-amber-500/10 text-amber-700 border-amber-500/30' },
  stood_down_investigation: { label: 'Stood Down (Under Investigation)', cls: 'bg-red-500/10 text-red-700 border-red-500/30' },
};

const SUSPENSION_STATUSES = ['suspended_host_only', 'suspended_stood_down', 'stood_down_investigation'];

export default function CandidateCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('personal');
  const [showEditForm, setShowEditForm] = useState(false);
  const sectionRefs = useRef({});

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => base44.entities.Candidate.get(id),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Candidate.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate', id] }),
  });

  const { data: placements = [] } = useQuery({
    queryKey: ['placements', id],
    queryFn: () => base44.entities.Placement.filter({ candidate_id: id }),
    enabled: !!id,
    initialData: [],
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
    initialData: [],
  });

  const createPlacementMutation = useMutation({
    mutationFn: (data) => base44.entities.Placement.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placements', id] }),
  });
  const updatePlacementMutation = useMutation({
    mutationFn: ({ pid, data }) => base44.entities.Placement.update(pid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placements', id] }),
  });
  const deletePlacementMutation = useMutation({
    mutationFn: (pid) => base44.entities.Placement.delete(pid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['placements', id] }),
  });

  const currentPlacement = placements.find(p => p.status === 'active');

  const handleAddPlacement = (payload) => {
    createPlacementMutation.mutateAsync(payload).then(() => logActivity('stage_changed', `Placement added with ${payload.client_name}`));
  };
  const handleUpdatePlacement = (pid, payload) => {
    updatePlacementMutation.mutateAsync({ pid, data: payload }).then(() => logActivity('stage_changed', `Placement updated for ${payload.client_name}`));
  };
  const handleDeletePlacement = (pid) => {
    deletePlacementMutation.mutateAsync(pid).then(() => logActivity('stage_changed', 'Placement record removed'));
  };

  const logActivity = async (type, description) => {
    try {
      const user = await base44.auth.me().catch(() => null);
      const activities = [...(candidate.activities || []), { type, description, by: user?.full_name || 'System', date: new Date().toISOString() }];
      await base44.entities.Candidate.update(id, { activities });
    } catch (e) { /* non-critical */ }
  };

  const handleUpdate = async (data) => {
    await updateMutation.mutateAsync({ id, data });
    await logActivity('stage_changed', 'Candidate details updated');
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const handleAddComment = async ({ type, text, images }) => {
    const user = await base44.auth.me().catch(() => null);
    const comments = [...(candidate.comments || []), { type, text, images: images || [], author_name: user?.full_name || 'Unknown', date: new Date().toISOString() }];
    await base44.entities.Candidate.update(id, { comments });
    const actType = type === 'phone_call' ? 'phone_call' : type === 'sms_sent' ? 'sms' : 'note';
    await logActivity(actType, `Comment added: ${text.slice(0, 80)}`);
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const handleDeleteComment = async (idx) => {
    const comments = [...(candidate.comments || [])];
    comments.splice(idx, 1);
    await base44.entities.Candidate.update(id, { comments });
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const handleAddVerification = async (v) => {
    const verifications = [...(candidate.verifications || []), { ...v }];
    await base44.entities.Candidate.update(id, { verifications });
    await logActivity('verification_completed', `Verification added: ${v.item}`);
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const handleDeleteVerification = async (idx) => {
    const verifications = [...(candidate.verifications || [])];
    verifications.splice(idx, 1);
    await base44.entities.Candidate.update(id, { verifications });
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const handleAddDocument = async (d) => {
    const documents = [...(candidate.documents || []), { ...d }];
    await base44.entities.Candidate.update(id, { documents });
    await logActivity('document_uploaded', `Document uploaded: ${d.file_name || d.type}`);
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const handleDeleteDocument = async (idx) => {
    const documents = [...(candidate.documents || [])];
    documents.splice(idx, 1);
    await base44.entities.Candidate.update(id, { documents });
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const handleStageChange = async (newStage) => {
    await base44.entities.Candidate.update(id, { candidate_stage: newStage });
    await logActivity('stage_changed', `Stage changed to ${STAGE_CONFIG[newStage]?.label || newStage}`);
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const handleStatusChange = async (newStatus) => {
    const isSus = SUSPENSION_STATUSES.includes(newStatus);
    const updates = { status: newStatus };
    if (!isSus) updates.not_attending_site = false;
    await base44.entities.Candidate.update(id, updates);
    await logActivity('stage_changed', `Status changed to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const handleNotAttendingToggle = async (checked) => {
    await base44.entities.Candidate.update(id, { not_attending_site: checked });
    await logActivity('stage_changed', checked ? 'Marked as not attending site' : 'Marked as attending site');
    queryClient.invalidateQueries({ queryKey: ['candidate', id] });
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const ref = sectionRefs.current[sectionId];
    if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (candidate && !candidate.candidate_id) {
      const num = String(candidate.id).slice(-5).padStart(5, '0');
      base44.entities.Candidate.update(candidate.id, { candidate_id: `CND-${num}` });
    }
  }, [candidate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link to="/candidates" className="text-primary hover:underline mt-2 inline-block">Back to Candidates</Link>
      </div>
    );
  }

  const stage = STAGE_CONFIG[candidate.candidate_stage] || STAGE_CONFIG.available;
  const isSuspended = SUSPENSION_STATUSES.includes(candidate.status);
  const notAttending = isSuspended && candidate.not_attending_site;

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link to="/candidates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Candidates
      </Link>

      {/* Header / Identity Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            {candidate.photo_url ? (
              <img src={candidate.photo_url} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {candidate.first_name?.[0]}{candidate.last_name?.[0]}
              </span>
            )}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              {candidate.candidate_id && (
                <span className="text-sm font-bold text-primary">{candidate.candidate_id}</span>
              )}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${stage.cls}`}>
                {stage.label}
              </span>
              {candidate.status && candidate.status !== 'active' && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${(STATUS_CONFIG[candidate.status] || STATUS_CONFIG.active).cls}`}>
                  {STATUS_CONFIG[candidate.status]?.label || candidate.status}
                </span>
              )}
            </div>
            <h1 className="text-xl font-black tracking-tight mb-2">
              {candidate.first_name} {candidate.last_name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {candidate.trade && <span className="font-medium text-foreground">{candidate.trade}</span>}
              {candidate.applied_date && <span>Applied: {format(new Date(candidate.applied_date), 'dd MMM yyyy')}</span>}
              {candidate.recruiter_name && <span>Recruiter: {candidate.recruiter_name}</span>}
            </div>
            {/* Contact + social */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {candidate.email && (
                <a href={`mailto:${candidate.email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <Mail className="w-3 h-3" /> Email
                </a>
              )}
              {candidate.phone && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" /> {candidate.phone}
                </span>
              )}
              {candidate.location && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {candidate.location}{candidate.state ? `, ${candidate.state}` : ''}
                </span>
              )}
              {candidate.linkedin_url && (
                <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
              {candidate.facebook_url && (
                <a href={candidate.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              {candidate.rating > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-500">
                  <Star className="w-3 h-3 fill-current" /> {candidate.rating}
                </span>
              )}
            </div>
          </div>

          {/* Stage selector + Edit */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)} className="gap-1">
              <Pencil className="w-3 h-3" /> Edit
            </Button>
            <Select value={candidate.candidate_stage || 'available'} onValueChange={handleStageChange}>
              <SelectTrigger className="w-36 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STAGE_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={candidate.status || 'active'} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-44 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Current Placement summary */}
      {currentPlacement && (
        <div className={`rounded-xl p-4 flex items-center gap-3 flex-wrap border ${notAttending ? 'bg-red-500/5 border-red-500/30' : 'bg-emerald-500/5 border-emerald-500/30'}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${notAttending ? 'bg-red-500/15' : 'bg-emerald-500/15'}`}>
            <Briefcase className={`w-4 h-4 ${notAttending ? 'text-red-600' : 'text-emerald-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-semibold uppercase tracking-wide ${notAttending ? 'text-red-700' : 'text-emerald-700'}`}>Current Placement</span>
              {isSuspended && (
                <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                  <Switch checked={!!candidate.not_attending_site} onCheckedChange={handleNotAttendingToggle} />
                  <span className="text-xs font-semibold text-amber-700">Not attending site</span>
                </label>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm mt-0.5">
              {currentPlacement.client_id ? (
                <Link to="/clients" className="font-semibold text-primary hover:underline">{currentPlacement.client_name}</Link>
              ) : (
                <span className="font-semibold">{currentPlacement.client_name}</span>
              )}
              {currentPlacement.job_title && <span className="text-muted-foreground">{currentPlacement.job_title}</span>}
              {currentPlacement.site && <span className="inline-flex items-center gap-1 text-muted-foreground"><MapPin className="w-3 h-3" />{currentPlacement.site}</span>}
              {currentPlacement.roster && <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" />{currentPlacement.roster}</span>}
              {currentPlacement.start_date && <span className="inline-flex items-center gap-1 text-muted-foreground"><Calendar className="w-3 h-3" />Since {format(new Date(currentPlacement.start_date), 'dd MMM yyyy')}</span>}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => scrollToSection('placements')}>View placements</Button>
        </div>
      )}

      {/* Quick Access */}
      <QuickAccess activeSection={activeSection} onSelect={scrollToSection} />

      {/* Sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div ref={el => sectionRefs.current.personal = el}>
          <PersonalDetails candidate={candidate} onUpdate={handleUpdate} />
        </div>
        <div ref={el => sectionRefs.current.availability = el}>
          <AvailabilitySection candidate={candidate} onUpdate={handleUpdate} />
        </div>
        <div ref={el => sectionRefs.current.comments = el}>
          <CommentsSection candidate={candidate} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />
        </div>
        <div ref={el => sectionRefs.current.verification = el}>
          <VerificationSection candidate={candidate} onAddVerification={handleAddVerification} onDeleteVerification={handleDeleteVerification} />
        </div>
        <div ref={el => sectionRefs.current.documentation = el}>
          <DocumentationSection candidate={candidate} onAddDocument={handleAddDocument} onDeleteDocument={handleDeleteDocument} />
        </div>
        <div ref={el => sectionRefs.current.activities = el}>
          <ActivitiesSection candidate={candidate} />
        </div>
      </div>

      {/* Placements (full width) */}
      <div ref={el => sectionRefs.current.placements = el}>
        <PlacementsSection
          candidate={candidate}
          placements={placements}
          clients={clients}
          isLoadingClients={isLoadingClients}
          onAdd={handleAddPlacement}
          onUpdate={handleUpdatePlacement}
          onDelete={handleDeletePlacement}
        />
      </div>

      {/* Edit dialog */}
      <CandidateFormDialog
        open={showEditForm}
        onOpenChange={setShowEditForm}
        candidate={candidate}
        onSave={(data) => handleUpdate(data)}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}