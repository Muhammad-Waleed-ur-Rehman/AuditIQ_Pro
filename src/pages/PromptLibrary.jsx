import { useEffect, useState } from 'react';
import { Copy, Plus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase, getSupabaseErrorMessage } from '../lib/supabaseClient';
import { buildPromptLibrarySuggestions } from '../lib/auditPrompts';

export default function PromptLibrary() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Custom');
  const [promptText, setPromptText] = useState('');
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const templates = buildPromptLibrarySuggestions();

  const fetchPrompts = async () => {
    if (!user?.id || !supabase) return;
    const { data, error } = await supabase.from('prompt_library').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!error) setSavedPrompts(data || []);
  };

  useEffect(() => { fetchPrompts(); }, [user]);

  const savePrompt = async () => {
    if (!title.trim() || !promptText.trim()) {
      setError('Add both a title and prompt text before saving.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (!isSupabaseConfigured || !supabase) throw new Error('Supabase must be configured to save prompts.');
      const { error: insertError } = await supabase.from('prompt_library').insert([{ user_id: user.id, title, category, prompt_text: promptText }]);
      if (insertError) throw insertError;
      setSaved('Prompt saved to your library.');
      setTitle('');
      setCategory('Custom');
      setPromptText('');
      await fetchPrompts();
    } catch (err) {
      setError(getSupabaseErrorMessage(err) || 'Unable to save the prompt.');
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    setSaved('Prompt text copied to clipboard.');
  };

  const deletePrompt = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('prompt_library').delete().eq('id', id);
    if (error) {
      setError(getSupabaseErrorMessage(error) || 'Unable to delete the prompt.');
      return;
    }
    await fetchPrompts();
  };

  return (
    <section className="p-6 md:p-10">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Prompt library</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Reusable audit prompts</h2>
          <p className="mt-3 text-slate-600">Save your own prompt templates and reuse the built-in audit starters for working papers, planning memos, and analysis.</p>
          <div className="mt-6 space-y-4 text-sm">
            <label className="block"><span className="text-xs uppercase tracking-[0.35em] text-slate-500">Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white" /></label>
            <label className="block"><span className="text-xs uppercase tracking-[0.35em] text-slate-500">Category</span><input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white" /></label>
            <label className="block"><span className="text-xs uppercase tracking-[0.35em] text-slate-500">Prompt text</span><textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} rows={5} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white" /></label>
          </div>
          <button onClick={savePrompt} disabled={loading} className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700 disabled:opacity-70"><Plus className="h-4 w-4" />{loading ? 'Saving…' : 'Save prompt'}</button>
          <p className="mt-4 text-xs text-slate-500 font-medium">AI-generated audit outputs are for assistance only and must be reviewed by a qualified auditor before use.</p>
          {error ? <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
          {saved ? <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">{saved}</div> : null}
        </article>

        <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Starter prompts</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">Built-in templates</h3>
          <div className="mt-6 space-y-4">
            {templates.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="text-xs uppercase tracking-[0.25em] text-brand-600">{item.category}</p></div><button onClick={() => copyText(item.promptText)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Copy className="h-4 w-4" /> Copy</button></div>
                <p className="mt-3 text-sm text-slate-600">{item.promptText}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-600">Saved prompts</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-900">Your library</h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {savedPrompts.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No saved prompts yet. Create one to start building your reusable audit workflow library.</div> : savedPrompts.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="text-xs uppercase tracking-[0.25em] text-brand-600">{item.category}</p></div><button onClick={() => deletePrompt(item.id)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">Delete</button></div>
              <p className="mt-3 text-sm text-slate-600">{item.prompt_text}</p>
              <button onClick={() => copyText(item.prompt_text)} className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Copy className="h-4 w-4" /> Copy</button>
            </article>
          ))}
        </div>
      </article>

      <article className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="flex items-start gap-3 text-sm text-slate-600"><ShieldCheck className="h-5 w-5 text-brand-600" /> The prompt library stores your reusable prompts in Supabase and includes built-in templates to accelerate audit workflows.</div>
      </article>
    </section>
  );
}
