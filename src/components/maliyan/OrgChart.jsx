import React, { useState } from 'react';
import { Plus, X, Edit2, ChevronDown, ChevronRight, User, Mail, Phone, Target, Briefcase, Users, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const DEPT_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-900',
  'bg-emerald-100 border-emerald-300 text-emerald-900',
  'bg-purple-100 border-purple-300 text-purple-900',
  'bg-amber-100 border-amber-300 text-amber-900',
  'bg-rose-100 border-rose-300 text-rose-900',
  'bg-cyan-100 border-cyan-300 text-cyan-900',
  'bg-orange-100 border-orange-300 text-orange-900',
  'bg-indigo-100 border-indigo-300 text-indigo-900',
];

function getDeptColor(dept, allDepts) {
  const idx = allDepts.indexOf(dept);
  return DEPT_COLORS[idx % DEPT_COLORS.length] || DEPT_COLORS[0];
}

function OrgNode({ node, allDepts, onSelect, selectedId, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const color = getDeptColor(node.department, allDepts);

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div className="relative flex flex-col items-center">
        <div
          onClick={() => onSelect(node)}
          className={`cursor-pointer border-2 rounded-xl px-4 py-3 min-w-[140px] max-w-[180px] text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${color} ${isSelected ? 'ring-2 ring-offset-2 ring-primary shadow-lg scale-105' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-white/70 border-2 border-current/20 flex items-center justify-center mx-auto mb-2">
            {node.photo_url
              ? <img src={node.photo_url} alt={node.name} className="w-full h-full rounded-full object-cover" />
              : <span className="text-lg font-bold">{(node.name || '?')[0]?.toUpperCase()}</span>
            }
          </div>
          <p className="font-bold text-xs leading-tight truncate">{node.name || 'Vacant'}</p>
          <p className="text-xs opacity-70 truncate mt-0.5">{node.role || 'Position'}</p>
          {node.department && <p className="text-[10px] opacity-50 mt-0.5 truncate">{node.department}</p>}
        </div>

        {hasChildren && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-1 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors z-10"
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="relative mt-0">
          {/* Vertical line down from toggle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-border" />
          <div className="flex gap-6 mt-4 relative">
            {/* Horizontal connector line */}
            {node.children.length > 1 && (
              <div
                className="absolute top-0 bg-border"
                style={{
                  height: '1px',
                  left: `calc(50% - ${((node.children.length - 1) * 196) / 2}px)`,
                  width: `${(node.children.length - 1) * 196}px`,
                }}
              />
            )}
            {node.children.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line from horizontal to child */}
                <div className="w-px h-4 bg-border" />
                <OrgNode node={child} allDepts={allDepts} onSelect={onSelect} selectedId={selectedId} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function buildTree(nodes) {
  const map = {};
  nodes.forEach(n => { map[n.id] = { ...n, children: [] }; });
  const roots = [];
  nodes.forEach(n => {
    if (n.reports_to && map[n.reports_to]) {
      map[n.reports_to].children.push(map[n.id]);
    } else {
      roots.push(map[n.id]);
    }
  });
  return roots;
}

function DetailPanel({ node, allNodes, onUpdate, onClose }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...node });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addKpi = () => setForm(f => ({ ...f, kpis: [...(f.kpis || []), ''] }));
  const updateKpi = (i, v) => setForm(f => { const a = [...(f.kpis || [])]; a[i] = v; return { ...f, kpis: a }; });
  const removeKpi = (i) => setForm(f => ({ ...f, kpis: (f.kpis || []).filter((_, idx) => idx !== i) }));

  const handleSave = () => { onUpdate(form); setEditing(false); };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-card border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className={`p-6 border-b border-border flex items-start justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
            {node.photo_url
              ? <img src={node.photo_url} alt={node.name} className="w-full h-full object-cover" />
              : <span className="text-xl font-bold text-muted-foreground">{(node.name || '?')[0]?.toUpperCase()}</span>
            }
          </div>
          <div>
            <h2 className="font-bold text-base">{node.name || 'Vacant Position'}</h2>
            <p className="text-sm text-muted-foreground">{node.role}</p>
            {node.department && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{node.department}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setEditing(!editing)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Edit2 className="w-4 h-4" /></button>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {!editing ? (
          <>
            {/* Contact */}
            {(node.email || node.phone) && (
              <Section title="Contact" icon={Mail}>
                {node.email && <InfoRow label="Email" value={node.email} />}
                {node.phone && <InfoRow label="Phone" value={node.phone} />}
              </Section>
            )}

            {/* Reports to */}
            {node.reports_to && (
              <Section title="Reports To" icon={Users}>
                <p className="text-sm text-foreground">{allNodes.find(n => n.id === node.reports_to)?.name || '—'}</p>
              </Section>
            )}

            {/* Job Description */}
            <Section title="Job Description" icon={Briefcase}>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{node.job_description || 'No job description added yet.'}</p>
            </Section>

            {/* KPIs */}
            <Section title="KPIs" icon={Target}>
              {(node.kpis || []).length > 0 ? (
                <ul className="space-y-1">
                  {node.kpis.map((kpi, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {kpi}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">No KPIs defined yet.</p>}
            </Section>

            {/* Other info */}
            {node.notes && (
              <Section title="Additional Notes" icon={Briefcase}>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{node.notes}</p>
              </Section>
            )}
          </>
        ) : (
          <>
            <div className="space-y-3">
              <EditField label="Name / Staff Member" value={form.name} onChange={v => set('name', v)} />
              <EditField label="Role / Title" value={form.role} onChange={v => set('role', v)} />
              <EditField label="Department" value={form.department} onChange={v => set('department', v)} />
              <EditField label="Email" value={form.email} onChange={v => set('email', v)} />
              <EditField label="Phone" value={form.phone} onChange={v => set('phone', v)} />
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Reports To</label>
                <select
                  value={form.reports_to || ''}
                  onChange={e => set('reports_to', e.target.value || null)}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">— None (Top Level) —</option>
                  {allNodes.filter(n => n.id !== node.id).map(n => (
                    <option key={n.id} value={n.id}>{n.name || n.role || n.id}</option>
                  ))}
                </select>
              </div>
              <EditField label="Job Description" value={form.job_description} onChange={v => set('job_description', v)} multiline />
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">KPIs</label>
                <div className="space-y-2">
                  {(form.kpis || []).map((kpi, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={kpi} onChange={e => updateKpi(i, e.target.value)} className="text-sm" placeholder="e.g. Achieve 95% placement rate" />
                      <button onClick={() => removeKpi(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addKpi} className="gap-2"><Plus className="w-3 h-3" />Add KPI</Button>
                </div>
              </div>
              <EditField label="Additional Notes" value={form.notes} onChange={v => set('notes', v)} multiline />
            </div>
            <Button onClick={handleSave} className="w-full gap-2"><Save className="w-4 h-4" />Save Position</Button>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground w-16 flex-shrink-0">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function EditField({ label, value, onChange, multiline }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">{label}</label>
      {multiline
        ? <Textarea value={value || ''} onChange={e => onChange(e.target.value)} className="text-sm resize-none" rows={3} />
        : <Input value={value || ''} onChange={e => onChange(e.target.value)} className="text-sm" />
      }
    </div>
  );
}

export default function OrgChart({ nodes, onChange }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const allDepts = [...new Set((nodes || []).map(n => n.department).filter(Boolean))];
  const tree = buildTree(nodes || []);

  const addNode = () => {
    const newNode = {
      id: `node_${Date.now()}`,
      name: '',
      role: 'New Position',
      department: '',
      email: '',
      phone: '',
      reports_to: null,
      job_description: '',
      kpis: [],
      notes: '',
    };
    onChange([...(nodes || []), newNode]);
    setSelectedNode(newNode);
  };

  const updateNode = (updated) => {
    const newNodes = (nodes || []).map(n => n.id === updated.id ? updated : n);
    onChange(newNodes);
    setSelectedNode(updated);
  };

  const removeNode = (id) => {
    onChange((nodes || []).filter(n => n.id !== id));
    setSelectedNode(null);
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {allDepts.map((dept, i) => (
            <span key={dept} className={`text-xs px-2 py-1 rounded-full border ${DEPT_COLORS[i % DEPT_COLORS.length]}`}>{dept}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {selectedNode && (
            <Button variant="destructive" size="sm" onClick={() => removeNode(selectedNode.id)} className="gap-2">
              <X className="w-3 h-3" />Remove Position
            </Button>
          )}
          <Button size="sm" onClick={addNode} className="gap-2"><Plus className="w-4 h-4" />Add Position</Button>
        </div>
      </div>

      {/* Chart area */}
      {(nodes || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <Users className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No positions yet</p>
          <p className="text-xs mt-1">Click "Add Position" to start building the org chart</p>
        </div>
      ) : (
        <div className="overflow-auto pb-8">
          <div className="flex gap-12 justify-center min-w-max px-8 py-4">
            {tree.map(root => (
              <OrgNode
                key={root.id}
                node={root}
                allDepts={allDepts}
                onSelect={setSelectedNode}
                selectedId={selectedNode?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedNode && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedNode(null)} />
          <DetailPanel
            node={selectedNode}
            allNodes={nodes || []}
            onUpdate={updateNode}
            onClose={() => setSelectedNode(null)}
          />
        </>
      )}
    </div>
  );
}