import { useState } from 'react';
import { generateWorkingPaper } from '../lib/auditEngine';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { invokeGemini } from '../lib/invokeGemini';
import { useAuth } from '../context/AuthContext';
import { ClipboardCopy, Download, FileSpreadsheet, Check, Sparkles } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import AlertMessage from './AlertMessage';

export default function WorkingPaperGenerator({ activeProject = null, onWpGenerated }) {
  const { user } = useAuth();
  const [area, setArea] = useState('Cash');
  const [grade, setGrade] = useState('Senior Associate');
  const [observation, setObservation] = useState('Review cash disbursement controls and supporting evidence for unusual quarterly payments.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wp, setWp] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleGenerate = async () => {
    if (!observation.trim()) {
      setErrorMessage('Please enter the audit observation before generating the working paper.');
      return;
    }

    if (!activeProject && isSupabaseConfigured) {
      setStatusMessage('No active project is selected. The AI draft will still generate, but saving to the database will be skipped.');
    }

    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      if (isSupabaseConfigured && supabase) {
        const result = await invokeGemini({
          mode: 'working_paper',
          prompt: `Audit area: ${area}. Auditor grade: ${grade}. Observation: ${observation}`,
          projectContext: activeProject || { area, grade },
        });

        const parsed = result;

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Gemini returned an invalid working paper response.');
        }

        const generatedPaper = {
          reference: `WP-${Date.now().toString().slice(-6)}`,
          title: `AI Working Paper - ${area}`,
          meta: {
            preparedBy: grade,
            reviewedBy: 'Gemini via Supabase',
            datePrepared: new Date().toLocaleDateString(),
            status: 'Generated with AI',
          },
          objective: `Audit observation: ${observation}`,
          procedures: [
            'Review supporting evidence and controls relevant to the observation.',
            'Validate the documented criteria, condition, and risk implications.',
            'Confirm the recommended remediation steps and implementation timing.',
          ],
          findings: `Criteria: ${parsed.criteria || parsed.Criteria || 'Not provided'}\nCondition: ${parsed.condition || parsed.Condition || 'Not provided'}\nCause: ${parsed.cause || parsed.Cause || 'Not provided'}\nEffect: ${parsed.effect || parsed.Effect || 'Not provided'}`,
          conclusion: `Recommendation: ${parsed.recommendation || parsed.Recommendation || 'Not provided'}\nRisk Rating: ${parsed.riskRating || parsed.risk_rating || parsed.RiskRating || 'Medium'}`,
          criteria: parsed.criteria || parsed.Criteria || '',
          condition: parsed.condition || parsed.Condition || '',
          cause: parsed.cause || parsed.Cause || '',
          effect: parsed.effect || parsed.Effect || '',
          recommendation: parsed.recommendation || parsed.Recommendation || '',
          riskRating: parsed.riskRating || parsed.risk_rating || parsed.RiskRating || 'Medium',
        };

        setWp(generatedPaper);
        setStatusMessage(activeProject
          ? 'Working paper generated with Gemini and linked to your active project.'
          : 'Working paper generated with Gemini (not linked to a project).');

        if (activeProject && supabase && user?.id) {
          const { error: saveError } = await supabase.from('working_papers').insert([
            {
              user_id: user.id,
              project_id: activeProject.id,
              observation,
              criteria: generatedPaper.criteria,
              condition: generatedPaper.condition,
              cause: generatedPaper.cause,
              effect: generatedPaper.effect,
              recommendation: generatedPaper.recommendation,
              risk_rating: generatedPaper.riskRating,
            },
          ]);

          if (saveError) {
            throw saveError;
          }
        } else if (activeProject && !user?.id) {
          setStatusMessage('Sign in to save working papers to your own project record.');
        }
      } else {
        const result = generateWorkingPaper(area, grade);
        setWp(result);
        setStatusMessage('Gemini is not configured yet; the local working paper flow is being used.');
      }

      if (onWpGenerated) {
        onWpGenerated();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to generate the working paper right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(JSON.stringify(wp, null, 2));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Parameter selections */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
          Working Paper Scope & Preparer
        </h3>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Audit Area</label>
            <select
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                setWp(null); // Clear previous WP
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
            >
              <option value="Cash">Cash & Cash Equivalents</option>
              <option value="Inventory">Inventory Valuation & Quantity</option>
              <option value="Accounts Receivable">Accounts Receivable & Provisioning</option>
              <option value="Fixed Assets">Property, Plant & Equipment</option>
              <option value="Liabilities">Unrecorded Liabilities Search</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Auditor Grade (Preparer)</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
            >
              <option value="Junior Auditor">Junior Auditor</option>
              <option value="Associate">Audit Associate</option>
              <option value="Senior Associate">Senior Audit Associate</option>
              <option value="Manager">Audit Manager</option>
            </select>
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Audit Observation</label>
            <textarea
              value={observation}
              onChange={(e) => {
                setObservation(e.target.value);
                setErrorMessage('');
              }}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
              placeholder="Describe the observation, control issue, or audit finding to analyze."
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-700/15 hover:bg-brand-700 active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isGenerating ? <LoadingSpinner label="Generating..." className="text-white" /> : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Working Paper
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <AlertMessage type="error" title="Working Paper Validation" message={errorMessage} className="mt-4" />
        )}

        {statusMessage && (
          <AlertMessage type="info" title="Status" message={statusMessage} className="mt-3" />
        )}
      </div>

      {/* Generated WP Output Display */}
      {!wp ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
          <FileSpreadsheet className="h-12 w-12 text-slate-300 animate-pulse mb-3" />
          <h4 className="font-display text-sm font-bold text-slate-700">Working Paper Template Sandbox</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Choose an audit balance segment and provide an observation to generate a working-paper style draft. The output is for assistance only and must be reviewed by a qualified auditor.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm space-y-6 animate-fadeIn">
          <AlertMessage
            type="warning"
            title="AI-generated audit output"
            message="AI-generated audit outputs are for assistance only and must be reviewed by a qualified auditor before use."
          />

          {/* Working Paper Metadata Table */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 uppercase tracking-wide">
                  {wp.reference}
                </span>
                <span className="text-xs text-slate-400 font-medium">Internal Workpaper Documentation</span>
              </div>
              <h4 className="font-display text-base font-bold text-slate-900 mt-1">{wp.title}</h4>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
              </button>
              
              <button 
                onClick={() => alert('Exporting working paper to Excel (simulated).')}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-all shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Preparer Metadata Block */}
          <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-xs sm:grid-cols-4 border border-slate-100">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Prepared By:</span>
              <span className="font-semibold text-slate-700">{wp.meta.preparedBy}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Reviewed By:</span>
              <span className="font-semibold text-slate-700">{wp.meta.reviewedBy}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Date Prepared:</span>
              <span className="font-semibold text-slate-700">{wp.meta.datePrepared}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Workflow Status:</span>
              <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                {wp.meta.status}
              </span>
            </div>
          </div>

          {/* Audit Objective */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Scoping Objective</h5>
            <p className="rounded-xl border border-slate-100 p-3.5 text-xs text-slate-600 leading-relaxed bg-slate-50/20">
              {wp.objective}
            </p>
          </div>

          {/* Audit Procedures Performed */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Substantive Procedures Performed</h5>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-medium">
                    <th className="p-3 w-12 text-center">Ref</th>
                    <th className="p-3">Required testing actions</th>
                    <th className="p-3 w-28 text-center">Sign-off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {wp.procedures.map((proc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30">
                      <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-3 text-slate-600 leading-relaxed">{proc}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 font-semibold border border-emerald-100">
                          <Check className="h-3 w-3" /> Done
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Findings */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Observations & Findings</h5>
            <p className="rounded-xl border border-slate-100 p-3.5 text-xs text-slate-600 leading-relaxed bg-slate-50/20">
              {wp.findings}
            </p>
          </div>

          {/* Audit Conclusion */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Testing Conclusion</h5>
            <p className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-3.5 text-xs text-slate-600 leading-relaxed">
              {wp.conclusion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
