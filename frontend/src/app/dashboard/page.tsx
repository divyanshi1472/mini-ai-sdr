'use client';
import { useEffect, useState } from 'react';
import { leadsApi } from '@/lib/api';
import { LeadStats, Lead } from '@/types';
import Sidebar from '@/components/Sidebar';
import { Users, TrendingUp, Mail, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Link from 'next/link';
import Cookies from 'js-cookie';

const COLORS = ['#6366f1', '#22c55e', '#ef4444', '#3b82f6', '#a855f7'];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    new: 'badge-new', qualified: 'badge-qualified', unqualified: 'badge-unqualified',
    contacted: 'badge-contacted', converted: 'badge-converted',
  };
  return <span className={styles[status] || 'badge-new'}>{status}</span>;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const userStr = typeof window !== 'undefined' ? Cookies.get('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    Promise.all([leadsApi.stats(), leadsApi.getAll({ limit: 5 })])
      .then(([statsRes, leadsRes]) => {
        setStats(statsRes.data);
        setRecentLeads(leadsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'New', value: stats.new },
    { name: 'Qualified', value: stats.qualified },
    { name: 'Unqualified', value: stats.total - stats.qualified - stats.contacted - stats.converted - stats.new },
    { name: 'Contacted', value: stats.contacted },
    { name: 'Converted', value: stats.converted },
  ].filter(d => d.value > 0) : [];

  const barData = stats ? [
    { name: 'New', count: stats.new },
    { name: 'Qualified', count: stats.qualified },
    { name: 'Contacted', count: stats.contacted },
    { name: 'Converted', count: stats.converted },
  ] : [];

  const statCards = [
    { label: 'Total Leads', value: stats?.total ?? 0, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Qualified', value: stats?.qualified ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    { label: 'Contacted', value: stats?.contacted ?? 0, icon: Mail, color: 'text-blue-600 bg-blue-50' },
    { label: 'Conversion Rate', value: `${stats?.conversion_rate ?? 0}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">Here's your pipeline overview</p>
            </div>
            <Link href="/leads/new" className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Lead
            </Link>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-5">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {loading ? <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" /> : value}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm">Lead Pipeline</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm">Status Distribution</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={180}>
                  <PieChart>
                    <Pie data={pieData} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {pieData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600">{item.name}</span>
                      <span className="font-medium text-slate-900 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Recent Leads</h3>
              <Link href="/leads" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-9 h-9 bg-slate-100 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-32 bg-slate-100 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : recentLeads.length === 0 ? (
                <div className="px-5 py-10 text-center text-slate-400 text-sm">
                  No leads yet.{' '}
                  <Link href="/leads/new" className="text-indigo-600 hover:underline">Add your first lead</Link>
                </div>
              ) : (
                recentLeads.map(lead => (
                  <Link key={lead.id} href={`/leads/${lead.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
                      {lead.first_name[0]}{lead.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-900">{lead.first_name} {lead.last_name}</div>
                      <div className="text-xs text-slate-500 truncate">{lead.job_title}{lead.company ? ` · ${lead.company}` : ''}</div>
                    </div>
                    <StatusBadge status={lead.status} />
                    {lead.qualification_score !== undefined && lead.qualification_score > 0 && (
                      <div className={`text-xs font-bold px-2 py-0.5 rounded ${lead.qualification_score >= 70 ? 'text-green-700 bg-green-50' : lead.qualification_score >= 40 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}>
                        {lead.qualification_score}
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
