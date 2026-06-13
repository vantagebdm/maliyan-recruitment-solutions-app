import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function MaliyanPortal() {
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

      {/* Empty canvas */}
      <div className="bg-card rounded-2xl border border-dashed border-border p-24 text-center text-muted-foreground">
        <p className="text-sm">Content goes here</p>
      </div>
    </div>
  );
}