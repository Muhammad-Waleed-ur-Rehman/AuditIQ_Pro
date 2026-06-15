import { useState } from 'react';
import { Copy, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { invokeGemini } from '../lib/invokeGemini';
import { useAuth } from '../context/AuthContext';
import { buildPlanningMemoPrompt } from '../lib/auditPrompts';

function normalizeKeyRisks(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim());
  return [];
}

export default function PlanningMemo({ activeProject = null }) {
  const { user } = useAuth();
  const [clientBackground, setClientBackground] = useState('Regional retailer with expanding e-commerce operations and stock-based inventory.');
  const [auditType, setAuditType] = useState('Year-end financial statement audit');
  const [industry, setIndustry] = useState('Retail');
  const [keyRisks, setKeyRisks] = useState('Inventory valuation, revenue recognition, returns and refunds.');
  const [financialRedFlags, setFinancialRedFlags] = useState('Declining margin, higher leverage, working capital pressure.');
  const [internalControlConcerns, setInternalControlConcerns] = useState('Segregation of duties in order-to-cash process.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSaved('');
    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('Supabase must be configured for Gemini generation.');
      const result = await invokeGemini({
        mode: 'planning_memo',
        prompt: buildPlanningMemoPrompt({ clientBackground, auditType, industry, keyRisks, financialRedFlags, internalControlConcerns }),
        projectContext: activeProject || null,
        additionalData: { clientBackground, auditType, industry, keyRisks, financialRedFlags, internalControlConcerns },
      });
      if (!result) {
        throw new Error('The AI service returned an empty response. Please try again.');
      }

      setResult(result);
      if (user?.id) {
        const { error: saveError } = await supabase.from('planning_memos').insert([{
          user_id: user.id,
          project_id: activeProject?.id ?? null,
          client_background: result.clientBackground,
          audit_scope: result.auditScope,
          key_risks: normalizeKeyRisks(result.keyRisks),
          materiality_considerations: result.materialityConsiderations,
          audit_strategy: result.auditStrategy,
          team_planning_notes: result.teamPlanningNotes,
          timeline_considerations: result.timelineConsiderations,
        }]);
        if (saveError) throw saveError;
        setSaved('Planning memo saved to Supabase.');
      } else {
        setSaved('Planning memo generated. Sign in to save this into your own Supabase records.');
      }
    } catch (err) {
      setError(err.message || 'Unable to generate a planning memo right now.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setSaved('Planning memo copied to clipboard.');
  };

  return (
    <section className="p-6 md:p-10">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Premium feature</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Planning Memo Assistant</h2>
          <p className="mt-3 text-slate-600">Create a planning memo outline that reflects the engagement context, financial risks, and audit strategy.</p>
          <div className="mt-6 space-y-4 text-sm">
            <label className="block"><span className="text-xs uppercase tracking-[0.35em] text-slate-500">Client background</span><textarea value={clientBackground} onChange={(e) => setClientBackground(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white" /></label>
            <label className="block"><span className="text-xs uppercase tracking-[0.35em] text-slate-500">Audit type</span><input value={auditType} onChange={(e) => setAuditType(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white" /></label>
            <label className="block"><span className="text-xs uppercase tracking-[0.35em] text-slate-500">Industry</span><input value={industry} onChange={(e) => setIndustry(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white" /></label>
            <label className="block"><span className="text-xs uppercase tracking-[0.35em] text-slate-500">Key risks</span><textarea value={keyRisks} onChange={(e) => setKeyRisks(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white" /></label>
            <label className="block"><span className="text-xs uppercase tracking-[0.35em] text-slate-500">Financial red flags</span><textarea value={financialRedFlags} onChange={(e) => setFinancialRedFlags(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white" /></label>
            <label className="block"><span className="text-xs uppercase tracking-[0.35em] text-slate-500">Internal control concerns</span><textarea value={internalControlConcerns} onChange={(e) => setInternalControlConcerns(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white" /></label>
          </div>
          <button onClick={handleGenerate} disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700 disabled:opacity-70">{loading ? 'Generating…' : 'Generate planning memo'}</button>
          <p className="mt-4 text-xs text-slate-500 font-medium">AI-generated audit outputs are for assistance only and must be reviewed by a qualified auditor before use.</p>
        </article>

        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Output</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Audit planning notes</h3>
            </div>
            <button onClick={copyText} disabled={!result} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"><Copy className="h-4 w-4" /> Copy</button>
          </div>
          {error ? <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
          {saved ? <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">{saved}</div> : null}
          {!result ? <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Generate a planning memo to view the risk assessment, strategy, and team notes.</div> : <pre className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>}
        </article>
      </div>

      <article className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="flex items-start gap-3 text-sm text-slate-600"><ShieldCheck className="h-5 w-5 text-brand-600" /> The planning memo is generated with the Gemini planning_memo mode and stored in the planning_memos table when your session is authenticated.</div>
      </article>
    </section>
  );
}
