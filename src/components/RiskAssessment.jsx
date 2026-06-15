import React, { useState, useEffect } from 'react';
import { calculateRiskScore } from '../lib/riskScoring';
import { getInherentRiskLevel } from '../lib/riskHeatmap';
import { isSupabaseConfigured, supabase, getSupabaseErrorMessage } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import AlertMessage from './AlertMessage';
import { 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  ChevronRight, 
  Gauge, 
  AlertTriangle,
  Database,
  History,
  Calendar,
  Target,
  Eye,
  ArrowLeft
} from 'lucide-react';

export default function RiskAssessment({ activeProject, onRiskGenerated }) {
  const { user } = useAuth();
  const [industry, setIndustry] = useState('Technology');
  const [revenue, setRevenue] = useState('150');
  const [employees, setEmployees] = useState('250');
  const [controlRating, setControlRating] = useState('Moderate');
  const [priorFindings, setPriorFindings] = useState('Minor Findings');
  const [integrityRating, setIntegrityRating] = useState('High');
  const [likelihood, setLikelihood] = useState(3);
  const [magnitude, setMagnitude] = useState(3);
  const [riskArea, setRiskArea] = useState('Revenue Recognition');
  const [assertion, setAssertion] = useState('Accuracy');
  const [significantRisk, setSignificantRisk] = useState(false);

  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [dbError, setDbError] = useState(null);

  const [savedAssessments, setSavedAssessments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [viewingAssessment, setViewingAssessment] = useState(null);

  const loadSavedAssessments = React.useCallback(async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', activeProject.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedAssessments(data || []);
    } catch (err) {
      console.warn('Failed to load saved assessments:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user, activeProject]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id || !activeProject?.id) return;
    loadSavedAssessments();
  }, [loadSavedAssessments]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeProject) {
      setDbError('No active project found. Please create or select a project on the Dashboard first.');
      return;
    }

    if (!user?.id) {
      setDbError('Please sign in before saving a risk assessment.');
      return;
    }

    const parsedRevenue = Number(revenue);
    const parsedEmployees = Number(employees);

    if (!Number.isFinite(parsedRevenue) || parsedRevenue <= 0) {
      setDbError('Annual revenue must be a positive number.');
      return;
    }

    if (!Number.isFinite(parsedEmployees) || parsedEmployees <= 0) {
      setDbError('Employee headcount must be a positive number.');
      return;
    }

    setIsGenerating(true);
    setSaveStatus(null);
    setDbError(null);

    const inherentScore = likelihood * magnitude;
    let controlScore = 15;
    if (controlRating === 'Weak') controlScore = 100;
    else if (controlRating === 'Moderate') controlScore = 60;

    const output = calculateRiskScore({
      industry,
      revenue,
      employees,
      controlRating,
      priorFindings,
      integrityRating
    });

    const enhancedOutput = {
      ...output,
      likelihood,
      magnitude,
      inherentRiskScore: inherentScore,
      inherentRiskLevel: getInherentRiskLevel(likelihood, magnitude),
      controlRiskScore: controlScore,
      significantRisk,
      riskArea,
      assertion
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const insertPayload = {
          user_id: user.id,
          project_id: activeProject.id,
          risk_score: output.score,
          risk_level: output.level,
          key_risks: output.keyRiskFactors,
          recommendations: output.focusAreas,
          likelihood,
          magnitude,
          inherent_risk_score: inherentScore,
          control_risk_score: controlScore,
          significant_risk: significantRisk,
          risk_area: riskArea,
          assertion
        };

        let { error } = await supabase
          .from('risk_assessments')
          .insert([{ ...insertPayload, fraud_indicators: output.fraudIndicators }]);

        if (error?.message?.includes('fraud_indicators')) {
          const { error: fallbackError } = await supabase
            .from('risk_assessments')
            .insert([insertPayload]);
          if (fallbackError) throw fallbackError;
        } else if (error) {
          throw error;
        }

        setSaveStatus('Assessment successfully compiled & saved to Supabase!');
        loadSavedAssessments();
      } catch (err) {
        setDbError(getSupabaseErrorMessage(err));
      } finally {
        setResult(enhancedOutput);
        setViewingAssessment(null);
        setIsGenerating(false);
        if (onRiskGenerated) {
          onRiskGenerated(enhancedOutput);
        }
      }
    } else {
      setTimeout(() => {
        setResult(enhancedOutput);
        setIsGenerating(false);
        setSaveStatus('Assessment generated locally (Sandbox Mode - DB config missing).');
        if (onRiskGenerated) {
          onRiskGenerated(enhancedOutput);
        }
      }, 700);
    }
  };

  const getGaugeColor = (score) => {
    if (score >= 70) return 'stroke-red-500';
    if (score >= 40) return 'stroke-amber-500';
    return 'stroke-emerald-500';
  };

  const getSeverityStyle = (level) => {
    switch (level) {
      case 'High': return 'text-red-700 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  const viewSavedAssessment = (assessment) => {
    setViewingAssessment(assessment);
    setResult({
      score: assessment.risk_score,
      level: assessment.risk_level,
      keyRiskFactors: assessment.key_risks || [],
      focusAreas: assessment.recommendations || [],
      fraudIndicators: assessment.fraud_indicators || [],
      timestamp: new Date(assessment.created_at).toLocaleDateString(),
      inputs: {
        industry: '',
        revenue: '',
        employees: '',
        controlRating: '',
        priorFindings: '',
        integrityRating: ''
      },
      likelihood: assessment.likelihood,
      magnitude: assessment.magnitude,
      inherentRiskScore: assessment.inherent_risk_score || assessment.likelihood * assessment.magnitude,
      inherentRiskLevel: getInherentRiskLevel(assessment.likelihood, assessment.magnitude),
      controlRiskScore: assessment.control_risk_score,
      significantRisk: assessment.significant_risk,
      riskArea: assessment.risk_area,
      assertion: assessment.assertion
    });
  };

  const displayResult = viewingAssessment || result;

  if (!activeProject) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto text-center py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="rounded-full bg-amber-50 p-4 border border-amber-100 text-amber-500 w-16 h-16 mx-auto flex items-center justify-center">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h4 className="font-display text-base font-bold text-slate-800">Scoping Project Required</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              In accordance with ISA 315, risk assessment procedures must be linked to a specific audit engagement profile. Please create or load a project first.
            </p>
          </div>
          <div>
            <span className="inline-block text-[10px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded">
              Current Status: No Active Project Scoped
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="rounded-xl border border-brand-100 bg-brand-50/10 px-4 py-3 flex items-center justify-between text-xs font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-brand-500" />
          <span>Active Engagement Target: <strong className="text-slate-900">{activeProject.project_name}</strong> ({activeProject.client_name})</span>
        </div>
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{activeProject.industry}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Auditee Profile & Control Environment
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
              >
                <option value="Financial Services">Financial Services</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other / General Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Annual Revenue ($ Millions)</label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                required
                min="0.1"
                step="any"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
                placeholder="e.g. 150"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Employee Headcount</label>
              <input
                type="number"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                required
                min="1"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
                placeholder="e.g. 250"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Internal Control Rating (COSO)</label>
              <div className="grid grid-cols-3 gap-2">
                {['Strong', 'Moderate', 'Weak'].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setControlRating(rating)}
                    className={`
                      rounded-xl border py-2 text-xs font-medium transition-all
                      ${controlRating === rating 
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold ring-2 ring-brand-100' 
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }
                    `}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Prior Audit Findings</label>
              <select
                value={priorFindings}
                onChange={(e) => setPriorFindings(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
              >
                <option value="None">None (Clean Opinion)</option>
                <option value="Minor Findings">Minor / Immaterial Findings</option>
                <option value="Significant Deficiency">Significant Deficiency</option>
                <option value="Material Weakness">Material Weakness (High Risk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Management Integrity Rating</label>
              <div className="grid grid-cols-3 gap-2">
                {['High', 'Medium', 'Low'].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setIntegrityRating(rating)}
                    className={`
                      rounded-xl border py-2 text-xs font-medium transition-all
                      ${integrityRating === rating 
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold ring-2 ring-brand-100' 
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }
                    `}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">ISA 315 Inherent Risk Factors</h4>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Likelihood of Misstatement</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setLikelihood(n)}
                      className={`rounded-lg border py-1.5 text-xs font-medium transition-all ${
                        likelihood === n
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold ring-2 ring-brand-100'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][likelihood - 1]}
                </p>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Magnitude of Misstatement</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMagnitude(n)}
                      className={`rounded-lg border py-1.5 text-xs font-medium transition-all ${
                        magnitude === n
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold ring-2 ring-brand-100'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  {['Negligible', 'Minor', 'Moderate', 'Major', 'Severe'][magnitude - 1]}
                </p>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Audit Risk Area</label>
                <select
                  value={riskArea}
                  onChange={(e) => setRiskArea(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
                >
                  <option value="Revenue Recognition">Revenue Recognition</option>
                  <option value="Inventory Valuation">Inventory Valuation</option>
                  <option value="Lease Accounting">Lease Accounting (IFRS 16)</option>
                  <option value="Tax Provisions">Tax Provisions</option>
                  <option value="Receivables">Receivables & Allowances</option>
                  <option value="Payroll">Payroll & Employee Benefits</option>
                  <option value="PP&E">Property, Plant & Equipment</option>
                  <option value="Goodwill">Goodwill & Intangibles</option>
                  <option value="Cash">Cash & Equivalents</option>
                  <option value="Liabilities">Long-term Liabilities</option>
                  <option value="Other">Other Area</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Financial Statement Assertion</label>
                <select
                  value={assertion}
                  onChange={(e) => setAssertion(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
                >
                  <option value="Accuracy">Accuracy</option>
                  <option value="Completeness">Completeness</option>
                  <option value="Cutoff">Cutoff</option>
                  <option value="Existence">Existence / Occurrence</option>
                  <option value="Rights and Obligations">Rights & Obligations</option>
                  <option value="Valuation">Valuation & Allocation</option>
                  <option value="Presentation and Disclosure">Presentation & Disclosure</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mb-1">
                <button
                  type="button"
                  onClick={() => setSignificantRisk(!significantRisk)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                    significantRisk ? 'bg-red-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                      significantRisk ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  {significantRisk ? 'Significant Risk (Requires separate audit procedures)' : 'Not a significant risk'}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 ml-0">
                Inherent risk score: {likelihood * magnitude}/25 | Control risk score: {controlRating === 'Weak' ? 100 : controlRating === 'Moderate' ? 60 : 15}
              </p>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white shadow-lg shadow-brand-700/20 hover:bg-brand-700 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-75"
            >
              {isGenerating ? (
                <LoadingSpinner label="Generating & Saving Risk..." className="text-white" />
              ) : (
                'Generate Risk Assessment'
              )}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3 flex flex-col justify-between min-h-[500px]">
          {!displayResult ? (
            <div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 text-slate-400">
                <Gauge className="h-10 w-10 animate-pulse text-brand-500" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-slate-700">No Assessment Active</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Fill out the parameters on the left and hit "Generate Risk Assessment" to compute and write metrics.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  {viewingAssessment && (
                    <button
                      onClick={() => { setViewingAssessment(null); setResult(null); }}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                      title="Back to new assessment"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  )}
                  <div>
                    <h4 className="font-display text-base font-bold text-slate-800">Audit Risk Valuation Report</h4>
                    <p className="text-[10px] text-slate-400">
                      {viewingAssessment ? 'Saved assessment from ' : 'Compiled on '}
                      {displayResult.timestamp} • Dynamic COSO Index Model
                    </p>
                  </div>
                </div>
                
                <div className={`rounded-xl border px-4 py-2 flex items-center gap-2.5 ${getSeverityStyle(displayResult.level)}`}>
                  {displayResult.level === 'High' ? (
                    <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                  ) : displayResult.level === 'Medium' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  )}
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider font-semibold opacity-75">Audit Risk Level</span>
                    <span className="font-display text-sm font-bold">{displayResult.level}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col items-center justify-center border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <div className="relative h-20 w-20">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="40" cy="40" r="32" className="stroke-slate-200" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="32" 
                        className={`transition-all duration-500 ${getGaugeColor(displayResult.score)}`} 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeDasharray={200}
                        strokeDashoffset={200 - (200 * displayResult.score) / 100}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-display text-base font-bold text-slate-800">
                      {displayResult.score}
                    </span>
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Score</span>
                </div>

                <div className="sm:col-span-2 border border-slate-100 rounded-xl p-4 bg-slate-50/30 flex flex-col justify-center space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Risk Area:</span>
                    <span className="font-semibold text-slate-700">{displayResult.riskArea}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assertion:</span>
                    <span className="font-semibold text-slate-700">{displayResult.assertion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Likelihood / Magnitude:</span>
                    <span className="font-semibold text-slate-700">{displayResult.likelihood} / {displayResult.magnitude}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inherent Risk Score:</span>
                    <span className="font-semibold text-slate-700">{displayResult.inherentRiskScore}/25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Inherent Risk Level:</span>
                    <span className={`font-semibold ${displayResult.inherentRiskLevel === 'High' ? 'text-red-600' : displayResult.inherentRiskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {displayResult.inherentRiskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Control Risk Score:</span>
                    <span className="font-semibold text-slate-700">{displayResult.controlRiskScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Significant Risk:</span>
                    <span className={`font-semibold ${displayResult.significantRisk ? 'text-red-600' : 'text-emerald-600'}`}>
                      {displayResult.significantRisk ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Risk Factors</h5>
                <div className="space-y-2">
                  {displayResult.keyRiskFactors.map((risk, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3">
                      <div className="mt-0.5 rounded bg-brand-50 p-1 text-brand-600">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{risk}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Suggested Audit Focus Areas</h5>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {displayResult.focusAreas.map((proc, idx) => (
                    <li key={idx} className="flex gap-2">
                      <ChevronRight className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                      <span>{proc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`rounded-xl border p-4 ${displayResult.score >= 40 ? 'bg-red-50/35 border-red-100' : 'bg-slate-50 border-slate-200'}`}>
                <h5 className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${displayResult.score >= 40 ? 'text-red-700' : 'text-slate-700'}`}>
                  <AlertTriangle className="h-4 w-4" /> Key Fraud Risk Indicators (ISA 240)
                </h5>
                <ul className={`space-y-1.5 text-xs ${displayResult.score >= 40 ? 'text-red-700' : 'text-slate-600'}`}>
                  {displayResult.fraudIndicators.map((fi, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="shrink-0 font-bold">•</span>
                      <span>{fi}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {saveStatus && (
                <AlertMessage type="success" title="Risk Assessment Saved" message={saveStatus} />
              )}

              {dbError && (
                <AlertMessage type="error" title="Risk Assessment Validation" message={dbError} />
              )}
            </div>
          )}

          {displayResult && (
            <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">Simulation Status: Valuation Complete</span>
              <button 
                onClick={() => window.print()}
                className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 transition-colors font-medium text-slate-600"
              >
                Print Report
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-400" />
            <h3 className="font-display text-base font-bold text-slate-900">Saved Risk Assessments</h3>
          </div>
          <span className="text-xs text-slate-400">{savedAssessments.length} saved</span>
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner label="Loading saved assessments..." className="h-5 w-5" />
          </div>
        ) : savedAssessments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Target className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p>No saved risk assessments for this project yet.</p>
            <p className="text-[10px] text-slate-300 mt-1">Generate one above and it will appear here.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
            {savedAssessments.map((a) => (
              <div
                key={a.id}
                onClick={() => viewSavedAssessment(a)}
                className={`rounded-xl border p-3 transition-all cursor-pointer hover:shadow-sm ${
                  viewingAssessment?.id === a.id
                    ? 'border-brand-300 bg-brand-50/30 ring-1 ring-brand-200'
                    : 'border-slate-100 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        a.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                        a.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {a.risk_level}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{a.risk_area || 'N/A'}</span>
                      {a.significant_risk && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[8px] font-bold text-red-600">
                          Significant
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                      <span>Score: {a.risk_score}</span>
                      <span>Lik: {a.likelihood}/5</span>
                      <span>Mag: {a.magnitude}/5</span>
                      <span>Assertion: {a.assertion || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Eye className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}