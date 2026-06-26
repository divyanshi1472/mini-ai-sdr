'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { leadsApi } from '@/lib/api';
import { Lead, LeadStatus } from '@/types';
import Sidebar from '@/components/Sidebar';
import { Plus, Search, Filter, Trash2, Eye, ChevronRight } from 'lucide-react';

const STATUS_OPTIONS: LeadStatus[] = ['new', 'qualified', 'unqualified', 'contacted', 'converted'];

const StatusBadge = ({ status }: { status: LeadStatus }) => {
  const cls: Record<string, string> = {
    new: 'badge-new', qualified: 'badge-qualified', unqualified: 'badge-unqualified',
    contacted: 'badge-contacted', converted: 'badge-converted',
  };
  return <span className={cls[status]}>{status}</span>;
};

const ScoreDot = ({ score }: { score?: number }) => {
  if (!score) return <span className="text-slate-300 text-xs">—</span>;
  const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';
  return <span className={`font-bold text-sm ${color}`}>{score}</span>;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await leadsApi.getAll({ search: search || undefined, status: statusFilter || undefined, limit: 100 });
      setLeads(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [search, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await leadsApi.delete(id);
      setLeads(leads.filter(l => l.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Leads</h1>
              <p className="text-sm text-slate-500">{leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/leads/new" className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Lead
            </Link>
          </div>
        </div>

        <div className="p-8">
          {/* Filters */}
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" placeholder="Search leads..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="input-field pl-10 pr-8 appearance-none cursor-pointer w-44"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-5 py-3">Lead</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Company</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Industry</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Score</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">
                      No leads found.{' '}
                      <Link href="/leads/new" className="text-indigo-600 hover:underline">Add your first lead</Link>
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-xs flex-shrink-0">
                            {lead.first_name[0]}{lead.last_name[0]}
                          </div>
                          <div>
                            <div className="font-medium text-sm text-slate-900">{lead.first_name} {lead.last_name}</div>
                            <div className="text-xs text-slate-500">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{lead.company || '—'}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">{lead.industry || '—'}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3.5"><ScoreDot score={lead.qualification_score} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link href={`/leads/${lead.id}`} className="p-1.5 hover:bg-indigo-50 rounded-lg transition-colors text-slate-400 hover:text-indigo-600">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(lead.id)} disabled={deleting === lead.id} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600 disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link href={`/leads/${lead.id}`} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
