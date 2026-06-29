import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Briefcase, Users, Building2, ClipboardList,
  ShieldCheck, Truck, Clock, DollarSign, Receipt, BarChart3,
  MessageSquare, Settings, ChevronLeft, ChevronRight, HardHat, Bot, ClipboardCheck
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Jobs', icon: Briefcase, path: '/jobs' },
  { label: 'Candidates', icon: Users, path: '/candidates' },
  { label: 'Clients', icon: Building2, path: '/clients' },
  { label: 'Job Orders', icon: ClipboardList, path: '/job-orders' },
  { label: 'Compliance', icon: ShieldCheck, path: '/compliance' },
  { label: 'Mobilisation', icon: Truck, path: '/mobilisation' },
  { label: 'Timesheets', icon: Clock, path: '/timesheets' },
  { label: 'Payroll Prep', icon: DollarSign, path: '/payroll' },
  { label: 'Billing Prep', icon: Receipt, path: '/billing' },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  { label: 'AI Assistant', icon: Bot, path: '/ai-assistant' },
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Brainstorm', icon: MessageSquare, path: '/brainstorm' },
  { label: 'BDM Portal', icon: ClipboardCheck, path: '/bdm-portal' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out",
        "bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]",
        collapsed ? "w-[68px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[hsl(var(--sidebar-border))]">
        <div className="w-9 h-9 rounded-lg bg-[hsl(var(--sidebar-primary))] flex items-center justify-center flex-shrink-0">
          <HardHat className="w-5 h-5 text-[hsl(var(--sidebar-primary-foreground))]" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight text-white truncate">STS Recruitment</h1>
            <p className="text-[10px] text-[hsl(var(--sidebar-foreground))] opacity-60 truncate">Workforce Hub</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-[hsl(var(--sidebar-accent))]",
                isActive
                  ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
                  : "text-[hsl(var(--sidebar-foreground))] opacity-75 hover:opacity-100"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-[hsl(var(--sidebar-primary))]")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 opacity-60" />
        ) : (
          <ChevronLeft className="w-4 h-4 opacity-60" />
        )}
      </button>
    </aside>
  );
}