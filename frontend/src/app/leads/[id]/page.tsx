'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { leadsApi, aiApi } from '@/lib/api';
import { Lead } from '@/types';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Zap, Mail, ExternalLink, Edit2, Check, X, Loader2, Building, Phone, Globe, Linkedin, Tag, Users } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
  const cls: Record<string, string> = {
    new: 'badge-new', qualified: 'badge-qualified', unqualified: 'badge-unqualified',
    contacted: 'badge-contacted', converted: 'badge-converted',
  };
  return <span className={cls[status] || 'badge-new'}>{status}</span>;
};

const ScoreBar = ({ score }: { score: number }) => {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-500">Qualification Score</span>
        <span className={`text-sm font-bold ${score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{score}/100</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [qualifying, setQualifying] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailTone, setEmailTone] = useState('professional');
  const [emailFocus, setEmailFocus] = useState('');
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    leadsApi.getOne(Number(id))
      .then(res => { setLead(res.data); setNewStatus(res.data.status); })
      .catch(() => router.push('/leads'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleQualify = async () => {
    if (!lead) return;
    setQualifying(true);
    setError('');
    try {
      await aiApi.qualify(lead.id);
      const { data } = await leadsApi.getOne(lead.id);
      setLead(data);
      setSuccessMsg('Lead qualified successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Qualification failed. Check AI API keys.');
    } finally {
      setQualifying(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!lead) return;
    setGeneratingEmail(true);
    setError('');
    try {
      await aiApi.generateEmail(lead.id, emailTone, emailFocus || undefined);
      const { data } = await leadsApi.getOne(lead.id);
      setLead(data);
      setShowEmailOptions(false);
      setSuccessMsg('Email generated!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Email generation failed. Check Gemini API key.');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!lead) return;
    try {
      const { data } = await leadsApi.update(lead.id, { status: newStatus });
      setLead(data);
      setEditStatus(false);
    } catch (e: any) {
      setError('Status update failed.');
    }
  };

  if (loading) return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </main>
    </div>
  );

  if (!lead) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/leads" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                {lead.first_name[0]}{lead.last_name[0]}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{lead.first_name} {lead.last_name}</h1>
                <p className="text-sm text-slate-500">{lead.job_title}{lead.company ? ` · ${lead.company}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {successMsg && <span className="text-green-600 text-sm font-medium flex items-center gap-1"><Check className="w-4 h-4" />{successMsg}</span>}
              <button onClick={handleQualify} disabled={qualifying} className="btn-secondary flex items-center gap-2 text-sm">
                {qualifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
                {qualifying ? 'Qualifying...' : 'AI Qualify'}
              </button>
              <button onClick={() => setShowEmailOptions(!showEmailOptions)} className="btn-primary flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4" /> Generate Email
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <X className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Email options dropdown */}
        {showEmailOptions && (
          <div className="mx-8 mt-4 card p-5">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Email Generation Options</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Tone</label>
                <select value={emailTone} onChange={e => setEmailTone(e.target.value)} className="input-field text-sm">
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="direct">Direct</option>
                  <option value="consultative">Consultative</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Focus (optional)</label>
                <input type="text" value={emailFocus} onChange={e => setEmailFocus(e.target.value)} placeholder="e.g. Reducing churn with AI" className="input-field text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleGenerateEmail} disabled={generatingEmail} className="btn-primary text-sm flex items-center gap-2">
                {generatingEmail ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Mail className="w-4 h-4" />Generate</>}
              </button>
              <button onClick={() => setShowEmailOptions(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="p-8 grid grid-cols-3 gap-5">
          {/* Left col */}
          <div className="col-span-2 space-y-5">
            {/* Contact Info */}
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Mail, label: 'Email', value: lead.email, href: `mailto:${lead.email}` },
                  { icon: Phone, label: 'Phone', value: lead.phone, href: `tel:${lead.phone}` },
                  { icon: Building, label: 'Company', value: lead.company },
                  { icon: Tag, label: 'Job Title', value: lead.job_title },
                  { icon: Globe, label: 'Industry', value: lead.industry },
                  { icon: Users, label: 'Company Size', value: lead.company_size ? `${lead.company_size} employees` : null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">{label}</div>
                      {value ? (
                        href ? (
                          <a href={href} className="text-sm text-indigo-600 hover:underline">{value}</a>
                        ) : (
                          <div className="text-sm text-slate-900">{value}</div>
                        )
                      ) : (
                        <div className="text-sm text-slate-300">—</div>
                      )}
                    </div>
                  </div>
                ))}

                {lead.website && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Website</div>
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        {lead.website.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {lead.linkedin_url && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0">
                      <Linkedin className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">LinkedIn</div>
                      <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {lead.notes && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-400 mb-1">Notes</div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>

            {/* Generated Email */}
            {lead.generated_email_subject && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">AI-Generated Email</h2>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="mb-3">
                    <span className="text-xs font-medium text-slate-500 uppercase">Subject</span>
                    <div className="font-semibold text-slate-900 mt-1">{lead.generated_email_subject}</div>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <span className="text-xs font-medium text-slate-500 uppercase">Body</span>
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">{lead.generated_email_body}</p>
                  </div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(`Subject: ${lead.generated_email_subject}\n\n${lead.generated_email_body}`); setSuccessMsg('Copied!'); setTimeout(() => setSuccessMsg(''), 2000); }}
                  className="btn-secondary text-xs mt-3">
                  Copy to clipboard
                </button>
              </div>
            )}
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* Status */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 text-sm">Status</h3>
                <button onClick={() => setEditStatus(!editStatus)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {editStatus ? (
                <div className="space-y-2">
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field text-sm">
                    {['new', 'qualified', 'unqualified', 'contacted', 'converted'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={handleStatusUpdate} className="btn-primary text-xs py-1.5 px-3">Save</button>
                    <button onClick={() => setEditStatus(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                  </div>
                </div>
              ) : (
                <StatusBadge status={lead.status} />
              )}
            </div>

            {/* Qualification */}
            {lead.qualification_score !== undefined && lead.qualification_score > 0 && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-slate-900 text-sm">AI Qualification</h3>
                </div>
                <ScoreBar score={lead.qualification_score} />
                {lead.qualification_reason && (
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">{lead.qualification_reason}</p>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="card p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-3">Timeline</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-400">Added</div>
                  <div className="text-sm text-slate-700">{new Date(lead.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                {lead.updated_at && (
                  <div>
                    <div className="text-xs text-slate-400">Last updated</div>
                    <div className="text-sm text-slate-700">{new Date(lead.updated_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
