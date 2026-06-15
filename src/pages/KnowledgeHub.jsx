import { useMemo, useState } from 'react';
import { BookOpen, Search, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { invokeGemini } from '../lib/invokeGemini';
import { buildKnowledgeHubPrompt } from '../lib/auditPrompts';

const topics = [
  { title: 'Revenue Recognition', summary: 'Review contract terms, cut-off, returns, and side letters for completeness.' },
  { title: 'Inventory', summary: 'Confirm quantities, obsolete stock, and costing methods for accurate valuation.' },
  { title: 'Cash and Bank', summary: 'Reconcile bank accounts, investigate unusual transfers, and review restrictions.' },
  { title: 'Fixed Assets', summary: 'Verify existence, ownership, depreciation rates, and impairment indicators.' },
  { title: 'Payroll', summary: 'Test salary calculations, tax withholdings, and existence of employees.' },
  { title: 'Procurement', summary: 'Review purchase orders, vendor approvals, and three-way matching controls.' },
  { title: 'Internal Controls', summary: 'Assess segregation of duties, approvals, and management review controls.' },
  { title: 'Fraud Risk', summary: 'Evaluate management override, revenue pressure, and misappropriation risks.' },
  { title: 'Audit Assertions', summary: 'Existence, completeness, valuation, rights & obligations, and presentation.' },
  { title: 'Substantive Procedures', summary: 'Detailed testing of transactions and balances to detect material misstatements.' },
  { title: 'Test of Controls', summary: 'Evaluate the operating effectiveness of controls in preventing or detecting errors.' },
];

export default function KnowledgeHub() {
  const [query, setQuery] = useState('How should I assess inventory risk in a retail audit?');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredTopics = useMemo(() => topics.filter((t) => `${t.title} ${t.summary}`.toLowerCase().includes(query.toLowerCase())), [query]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('Supabase must be configured for Gemini generation.');
      const result = await invokeGemini({
        mode: 'knowledge_hub',
        prompt: buildKnowledgeHubPrompt(query),
      });
      setAnswer(result || 'No response returned.');
    } catch (err) {
      setError(err.message || 'Unable to generate the knowledge hub answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 md:p-10">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Knowledge hub</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Audit guidance and reference topics</h2>
          <p className="mt-3 text-slate-600">Use the curated topics and Gemini support to quickly find guidance for planning, documentation, and risk review.</p>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-slate-800 outline-none" placeholder="Ask about risk areas, assertions, or working papers" />
          </div>
          <button onClick={handleSearch} disabled={loading} className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700 disabled:opacity-70">{loading ? 'Searching…' : 'Ask Gemini'}</button>
          <p className="mt-4 text-xs text-slate-500 font-medium">AI-generated audit outputs are for assistance only and must be reviewed by a qualified auditor before use.</p>
          <div className="mt-6 space-y-3">
            {filteredTopics.map((topic) => (
              <button key={topic.title} onClick={() => setQuery(topic.title)} className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-brand-200 hover:bg-brand-50/40">
                <div className="flex items-start gap-3"><BookOpen className="h-5 w-5 text-brand-600" /><div><p className="text-sm font-semibold text-slate-900">{topic.title}</p><p className="text-xs text-slate-500">{topic.summary}</p></div></div>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Gemini answer</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Suggested guidance and next steps</h3>
          {error ? <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
          {!answer ? <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Ask a question to receive audit-focused guidance from the Gemini knowledge hub mode.</div> : <article className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 whitespace-pre-wrap">{answer}</article>}
        </article>
      </div>

      <article className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="flex items-start gap-3 text-sm text-slate-600"><ShieldCheck className="h-5 w-5 text-brand-600" /> The knowledge hub combines curated topics with Gemini-powered guidance to support audit planning, risk review, and working paper preparation.</div>
      </article>
    </section>
  );
}
