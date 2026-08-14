import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Phone, Mail, Eye, Pencil } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import TrafficLight from '@/components/shared/TrafficLight';

export default function CandidateColumn({ title, subtitle, accentClass, candidates, onEdit }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-muted/40 rounded-xl border border-border min-w-0">
      <div className={`flex items-center justify-between px-4 py-3 border-b border-border rounded-t-xl ${accentClass}`}>
        <div>
          <h2 className="text-sm font-bold">{title}</h2>
          <p className="text-xs opacity-80">{subtitle}</p>
        </div>
        <span className="text-lg font-bold tabular-nums">{candidates.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-260px)]">
        {candidates.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">No candidates</p>
        ) : (
          candidates.map(c => (
            <div
              key={c.id}
              className="bg-card rounded-lg border border-border p-3 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  onClick={() => navigate(`/candidates/${c.id}`)}
                  className="flex flex-1 items-center gap-3 cursor-pointer min-w-0"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-semibold text-sm truncate">{c.first_name} {c.last_name}</h3>
                      <StatusBadge status={c.candidate_stage || 'available'} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {c.trade && <span className="font-medium text-foreground truncate">{c.trade}</span>}
                      {c.email && <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 flex-shrink-0" />{c.email}</span>}
                      {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                      {c.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>}
                      {c.fifo_available && <span className="text-emerald-600 font-medium">FIFO ✓</span>}
                    </div>
                  </div>
                </div>
                {c.rating > 0 && (
                  <div className="flex items-center gap-0.5 text-amber-500 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-semibold">{c.rating}</span>
                  </div>
                )}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/candidates/${c.id}`)} className="h-7 w-7 p-0">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(c)} className="h-7 w-7 p-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}