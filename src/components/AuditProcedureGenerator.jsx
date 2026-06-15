import { useState } from 'react';
import { generateAuditProgram } from '../lib/auditEngine';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { invokeGemini } from '../lib/invokeGemini';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Sparkles, CheckSquare, Square } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import AlertMessage from './AlertMessage';

export default function AuditProcedureGenerator({ activeProject = null }) {
  const { user } = useAuth();
  const [area, setArea] = useState('Cash');
  const [assertions, setAssertions] = useState(['Existence', 'Completeness']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [program, setProgram] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Assertion checkboxes config
  const assertionOptions = [
    'Existence', 
    'Completeness', 
    'Accuracy', 
    'Valuation', 
    'Rights & Obligations', 
    'Presentation & Disclosure'
  ];

  const handleToggleAssertion = (item) => {
    if (assertions.includes(item)) {
      setAssertions(assertions.filter(a => a !== item));
    } else {
      setAssertions([...assertions, item]);
    }
  };

  const handleGenerate = async () => {
    if (!area || !area.trim()) {
      setErrorMessage('Please choose an audit area before generating a procedure set.');
      return;
    }

    if (assertions.length === 0) {
      setErrorMessage('Select at least one assertion to generate a procedure set.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      if (isSupabaseConfigured && supabase) {
        const result = await invokeGemini({
          mode: 'audit_procedure',
          prompt: `Generate audit procedures for ${area} with the following assertions: ${assertions.join(', ')}.`,
          projectContext: activeProject || { area, assertions },
        });

        const parsed = result;

        if (!parsed || (!Array.isArray(parsed.procedures) && !Array.isArray(parsed.auditProcedures))) {
          throw new Error('Gemini returned an invalid audit procedure response.');
        }

        const rawProcedures = parsed.procedures || parsed.auditProcedures || [];
        const steps = rawProcedures.map((procedure, idx) => ({
          id: idx + 1,
          procedure: typeof procedure === 'string' ? procedure : (procedure.procedure || procedure.step || JSON.stringify(procedure)),
          assertion: (parsed.assertions && parsed.assertions[idx]) || (procedure.assertion) || assertions[idx % assertions.length],
          sampleSize: parsed.samplingApproach || procedure.sampleSize || 'Judgmental',
          evidenceRequired: (parsed.evidenceRequired && parsed.evidenceRequired[idx]) || (procedure.evidenceRequired) || 'Document support, reperformance, and inspection of key records.',
        }));

        setProgram({
          area,
          assertionsSelected: assertions,
          steps,
          createdAt: new Date().toLocaleString(),
          samplingApproach: parsed.samplingApproach || 'Judgmental sampling tailored to the selected assertions.',
        });
        setStatusMessage('Audit procedure set generated with Gemini.');

        if (activeProject && supabase && user?.id) {
          const { error: saveError } = await supabase.from('audit_procedures').insert([{
            user_id: user.id,
            project_id: activeProject.id,
            audit_area: area,
            assertions: assertions,
            procedures: steps.map(s => s.procedure),
            evidence_required: steps.map(s => s.evidenceRequired),
            sampling_approach: parsed.samplingApproach || 'Judgmental',
          }]);
          if (saveError) {
            console.warn('Failed to save audit procedure:', saveError);
          }
        }
      } else {
        const output = generateAuditProgram(area, assertions);
        setProgram(output);
        setStatusMessage('Gemini is not configured yet; using the local audit program generator.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to generate the audit program right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Side: Parameters Selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Audit Program Scope & Objectives
          </h3>

          {/* Audit Area Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Audit Area</label>
            <select
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                setProgram(null); // Clear previous program
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
            >
              <option value="Cash">Cash & Cash Equivalents</option>
              <option value="Inventory">Inventory Valuation & Quantity</option>
              <option value="Accounts Receivable">Accounts Receivable & Recoverability</option>
              <option value="Fixed Assets">Property, Plant & Equipment</option>
              <option value="Liabilities">Unrecorded Liabilities & Accruals</option>
            </select>
          </div>

          {/* Assertion Multi-select Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Financial Assertions Checked</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {assertionOptions.map((opt) => {
                const isChecked = assertions.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleAssertion(opt)}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-slate-100 p-2 hover:bg-slate-50 text-left transition-colors"
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4.5 w-4.5 text-brand-600 shrink-0" />
                    ) : (
                      <Square className="h-4.5 w-4.5 text-slate-300 shrink-0" />
                    )}
                    <span className="text-xs font-medium text-slate-700">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || assertions.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-700 active:scale-[0.99] transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? <LoadingSpinner label="Generating..." className="text-white" /> : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Audit Program
              </>
            )}
          </button>
          {errorMessage && (
            <AlertMessage type="error" title="Procedure Validation" message={errorMessage} />
          )}

          {statusMessage && (
            <AlertMessage type="info" title="Status" message={statusMessage} className="mt-3" />
          )}
        </div>

        {/* Right Side: Tailored Audit Program Results */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3 flex flex-col justify-between min-h-[450px]">
          {!program ? (
            <div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 text-slate-400">
                <ClipboardCheck className="h-10 w-10 text-brand-500 animate-pulse" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-slate-700">Audit Program Standby</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Select an audit segment and at least one financial assertion, then click "Generate Audit Program" to tailor the testing steps. The generated output is for assistance only.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <AlertMessage
                type="warning"
                title="AI-generated audit output"
                message="AI-generated audit outputs are for assistance only and must be reviewed by a qualified auditor before use."
              />
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-display text-base font-bold text-slate-900">
                    Tailored Substantive Program: {program.area}
                  </h4>
                  <p className="text-[10px] text-slate-400">Target Assertions: {program.assertionsSelected.join(', ')}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">PCAOB AS 1105 Compliant</span>
              </div>

              {/* Audit program table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-100 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold">
                      <th className="p-3 w-10 text-center">No</th>
                      <th className="p-3">Audit Testing Procedure</th>
                      <th className="p-3 w-28">Target Assertion</th>
                      <th className="p-3 w-20 text-center">Sample Size</th>
                      <th className="p-3">Required Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {program.steps.map((step) => (
                      <tr key={step.id} className="hover:bg-slate-50/30">
                        <td className="p-3 text-center text-slate-400 font-bold">{step.id}</td>
                        <td className="p-3 text-slate-600 leading-relaxed">{step.procedure}</td>
                        <td className="p-3">
                          <span className="inline-flex rounded-md bg-brand-50 border border-brand-100 px-2 py-0.5 text-[10px] text-brand-700 font-semibold">
                            {step.assertion}
                          </span>
                        </td>
                        <td className="p-3 text-center text-slate-500 font-bold">{step.sampleSize} items</td>
                        <td className="p-3 text-slate-500 text-[10px] leading-relaxed">{step.evidenceRequired}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Program Compiled: {program.createdAt}</span>
                <button 
                  onClick={() => alert('Exporting audit program (simulated).')}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 font-semibold text-slate-600 transition-colors"
                >
                  Print Program
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
