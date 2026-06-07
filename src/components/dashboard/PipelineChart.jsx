import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const stageLabels = {
  new_applicant: 'New',
  resume_review: 'Resume',
  phone_screen: 'Phone',
  interview: 'Interview',
  reference_check: 'Ref Check',
  compliance_check: 'Compliance',
  medical_required: 'Medical',
  ready_for_placement: 'Ready',
  offered: 'Offered',
  accepted: 'Accepted',
  mobilising: 'Mobilising',
  active: 'Active',
};

export default function PipelineChart({ candidates = [] }) {
  const data = Object.entries(stageLabels).map(([key, label]) => ({
    stage: label,
    count: candidates.filter(c => c.pipeline_stage === key).length,
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Recruitment Pipeline</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="stage" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}