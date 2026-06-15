import { useState } from 'react';
import { Copy, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { invokeGemini } from '../lib/invokeGemini';
import { useAuth } from '../context/AuthContext';
import { buildManagementLetterPrompt } from '../lib/auditPrompts';

export default function ManagementLetters({ activeProject = null }) {
  const { user } = useAuth();
  const [observation, setObservation] = useState('Purchase approvals were not consistently documented for unusual transactions.');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const handleGenerate = async () => {
    if (!observation.trim()) {
      setError('Please describe the control weakness or observation before generating a management letter.');
      return;
    }
    setLoading(true);
    setError('');
    setSaved('');

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase must be configured for Gemini generation.');
      }

      const result = await invokeGemini({
        mode: 'management_letter',
        prompt: buildManagementLetterPrompt(observation),
        projectContext: activeProject || null,
        additionalData: { observation },
      });

      if (!result) {
        throw new Error('The AI service returned an empty response. Please try again.');
      }

      setResult(result);

      if (user?.id) {
        const { error: saveError } = await supabase.from('management_letters').insert([
          {
            user_id: user.id,
            project_id: activeProject?.id ?? null,
            observation: result.observation || observation,
            risk: result.risk || '',
            recommendation: result.recommendation || '',
            management_response_template: result.managementResponseTemplate || '',
          },
        ]);
        if (saveError) throw saveError;
        setSaved('Management letter draft saved to Supabase.');
      } else {
        setSaved('Management letter generated. Sign in to save this into your own Supabase records.');
      }
    } catch (err) {
      setError(err.message || 'Unable to generate the management letter right now.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setSaved('Draft copied to clipboard.');
  };

  return (
    <section className="p-6 md:p-10">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Premium feature</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Management Letter Generator</h2>
          <p className="mt-3 text-slate-600">Turn a control weakness into a professional management letter draft for review by a qualified auditor.</p>
          <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Control weakness / audit observation</label>
          <textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={6} className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white" />
          <button onClick={handleGenerate} disabled={loading} className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700 disabled:opacity-70">{loading ? 'Generating…' : 'Generate management letter'}</button>
          <p className="mt-4 text-xs text-slate-500">AI-generated audit outputs are for assistance only and must be reviewed by a qualified auditor before use.</p>
        </article>

        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Output</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Draft summary</h3>
            </div>
            <button onClick={copyText} disabled={!result} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"><Copy className="h-4 w-4" /> Copy</button>
          </div>
          {error ? <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
          {saved ? <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">{saved}</div> : null}
          {!result ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Generate a draft to view the management letter content and save it to your records.</div>
          ) : (
            <div className="mt-6 space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><strong>Observation:</strong> {result.observation}</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><strong>Risk:</strong> {result.risk}</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><strong>Recommendation:</strong> {result.recommendation}</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><strong>Management Response Template:</strong> {result.managementResponseTemplate}</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><strong>Priority:</strong> {result.priority}</div>
            </div>
          )}
        </article>
      </div>

      <article className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="flex items-start gap-3 text-sm text-slate-600"><ShieldCheck className="h-5 w-5 text-brand-600" /> This premium feature uses the Gemini mode for management letters and stores the result to the management_letters table when the user is authenticated.</div>
      </article>
    </section>
  );
}
