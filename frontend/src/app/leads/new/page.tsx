'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { leadsApi } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const INDUSTRIES = ['Software / SaaS', 'E-commerce', 'Finance / Fintech', 'Healthcare', 'Education / EdTech', 'Marketing / Advertising', 'Manufacturing', 'Consulting', 'Real Estate', 'Other'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    company: '', job_title: '', industry: '', company_size: '',
    website: '', linkedin_url: '', notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(form).filter(([_, v]) => v !== ''));
      const { data } = await leadsApi.create(clean);
      router.push(`/leads/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Link href="/leads" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Add New Lead</h1>
              <p className="text-sm text-slate-500">Fill in the lead details below</p>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-3xl">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name *</label>
                  <input type="text" required value={form.first_name} onChange={e => set('first_name', e.target.value)} className="input-field" placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name *</label>
                  <input type="text" required value={form.last_name} onChange={e => set('last_name', e.target.value)} className="input-field" placeholder="Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} className="input-field" placeholder="jane@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" placeholder="+1-555-0102" />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Company Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company</label>
                  <input type="text" value={form.company} onChange={e => set('company', e.target.value)} className="input-field" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                  <input type="text" value={form.job_title} onChange={e => set('job_title', e.target.value)} className="input-field" placeholder="VP of Engineering" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                  <select value={form.industry} onChange={e => set('industry', e.target.value)} className="input-field">
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Size</label>
                  <select value={form.company_size} onChange={e => set('company_size', e.target.value)} className="input-field">
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                  <input type="url" value={form.website} onChange={e => set('website', e.target.value)} className="input-field" placeholder="https://company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn URL</label>
                  <input type="url" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} className="input-field" placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Notes</h2>
              <textarea
                rows={4} value={form.notes} onChange={e => set('notes', e.target.value)}
                className="input-field resize-none"
                placeholder="How did you meet? What are their pain points? Any relevant context..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Lead'}
              </button>
              <Link href="/leads" className="btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
