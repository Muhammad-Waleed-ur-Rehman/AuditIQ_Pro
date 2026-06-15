import { useState } from 'react';
import Papa from 'papaparse';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  RefreshCw, 
  Download,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { validateCSVColumns, analyzeFinancialData } from '../lib/financialRatios';
import { isSupabaseConfigured, supabase, getSupabaseErrorMessage } from '../lib/supabaseClient';

import { useAuth } from '../context/AuthContext';
import { buildRedFlagExplanationPrompt } from '../lib/auditPrompts';
import LoadingSpinner from './LoadingSpinner';
import AlertMessage from './AlertMessage';

export default function FinancialAnalyzer() {
  const { user } = useAuth();
  const [fileName, setFileName] = useState(null);
  const [dataset, setDataset] = useState(null); // Analyzed rows array
  const [selectedYear, setSelectedYear] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redFlagInsight, setRedFlagInsight] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  // Fallback demo data matching the specifications
  const demoData = [
    { Year: 2024, Revenue: 78000000, CostOfGoodsSold: 46100000, NetIncome: 8300000, CurrentAssets: 53200000, Inventory: 19100000, CurrentLiabilities: 17800000, TotalAssets: 96200000, TotalLiabilities: 52800000, Equity: 43400000 },
    { Year: 2025, Revenue: 84500000, CostOfGoodsSold: 52300000, NetIncome: 6000000, CurrentAssets: 62500000, Inventory: 28400000, CurrentLiabilities: 26200000, TotalAssets: 107500000, TotalLiabilities: 58200000, Equity: 49300000 },
    { Year: 2026, Revenue: 92000000, CostOfGoodsSold: 54000000, NetIncome: 11500000, CurrentAssets: 75000000, Inventory: 22000000, CurrentLiabilities: 21000000, TotalAssets: 120000000, TotalLiabilities: 55000000, Equity: 65000000 }
  ];

  const processData = (rawData) => {
    try {
      const analyzed = analyzeFinancialData(rawData);
      if (analyzed.length === 0) {
        throw new Error('No valid financial entries found in dataset.');
      }
      setDataset(analyzed);
      setSelectedYear(analyzed[analyzed.length - 1].year.toString());
      setErrorMsg(null);

      if (isSupabaseConfigured && supabase && user?.id) {
        supabase.from('financial_analyses').insert([{
          user_id: user.id,
          ratios: analyzed[analyzed.length - 1]?.ratios || null,
          red_flags: analyzed[analyzed.length - 1]?.redFlags || null,
        }]).then(({ error }) => {
          if (error) console.warn('Failed to save financial analysis:', error.message);
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error processing financial data ratios.');
      setDataset(null);
    }
  };

  const handleLoadDemo = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      setFileName('auditiq_demo_financials.csv');
      processData(demoData);
      setIsLoading(false);
    }, 300);
  };

  const handleFileUpload = (file) => {
    if (!file) return;

    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrorMsg('Invalid file format. Please upload a standard CSV (.csv) file.');
      setFileName(null);
      setDataset(null);
      return;
    }

    if (file.size === 0) {
      setErrorMsg('The selected CSV file is empty. Please upload a file with financial data.');
      setFileName(null);
      setDataset(null);
      return;
    }

    setFileName(file.name);
    setErrorMsg(null);
    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsLoading(false);
        if (results.errors.length > 0 && results.data.length === 0) {
          setErrorMsg('Invalid CSV format. Please use a standard comma-separated file with the expected financial columns.');
          setDataset(null);
          return;
        }

        const headers = results.meta.fields || [];
        const validation = validateCSVColumns(headers);
        
        if (!validation.isValid) {
          setErrorMsg(`Invalid CSV format. Missing required columns: ${validation.missing.join(', ')}.`);
          setDataset(null);
          return;
        }

        processData(results.data);
      },
      error: () => {
        setErrorMsg('Network or file read failure. Please try a different CSV file and confirm the file is not locked by another application.');
        setDataset(null);
        setIsLoading(false);
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const downloadSampleCSV = () => {
    const csvContent = 
      "Year,Revenue,CostOfGoodsSold,NetIncome,CurrentAssets,Inventory,CurrentLiabilities,TotalAssets,TotalLiabilities,Equity\n" +
      "2024,78000000,46100000,8300000,53200000,19100000,17800000,96200000,52800000,43400000\n" +
      "2025,84500000,52300000,6000000,62500000,28400000,26200000,107500000,58200000,49300000\n" +
      "2026,92000000,54000000,11500000,75000000,22000000,21000000,120000000,55000000,65000000\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "auditiq_sample_financials.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Extract values for target year
  const getSelectedYearData = () => {
    if (!dataset) return null;
    return dataset.find(d => d.year.toString() === selectedYear);
  };

  const yearData = getSelectedYearData();

  const explainRedFlags = async () => {
    if (!yearData || !yearData.redFlags?.length) return;

    setIsExplaining(true);
    setErrorMsg(null);

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase must be configured for Gemini-guided red-flag analysis.');
      }

      const { data, error: funcError } = await supabase.functions.invoke('gemini-audit', {
        body: {
          mode: 'red_flag_explanation',
          prompt: buildRedFlagExplanationPrompt(yearData.redFlags, yearData.ratios),
          additionalData: { year: selectedYear, ratios: yearData.ratios }
        }
      });

      if (funcError) throw funcError;
      setRedFlagInsight(typeof data?.result === 'string' ? data.result : JSON.stringify(data?.result ?? {}, null, 2));
    } catch (err) {
      setErrorMsg(getSupabaseErrorMessage(err) || 'Unable to explain the red flags right now.');
    } finally {
      setIsExplaining(false);
    }
  };

  // Helper for KPI styling
  const getRatioBadgeStyle = (val, min, max, isHigherBetter = true) => {
    const isOk = isHigherBetter ? val >= min : val <= max;
    return isOk 
      ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
      : 'text-red-700 bg-red-50 border-red-100';
  };

  // Convert raw value format (currency)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatChartVal = (tick) => {
    if (tick >= 1000000) return `$${(tick / 1000000).toFixed(1)}M`;
    if (tick >= 1000) return `$${(tick / 1000).toFixed(0)}k`;
    return tick;
  };

  // Format Recharts data arrays
  const getChartData = () => {
    if (!dataset) return [];
    return dataset.map(d => ({
      Year: d.year.toString(),
      Revenue: d.raw.revenue,
      CostOfGoodsSold: d.raw.cogs,
      NetIncome: d.raw.netIncome,
      Debt: d.raw.totalLiabilities,
      Equity: d.raw.equity
    }));
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* File Upload Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Upload Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Upload Ledger CSV</h3>
            <p className="text-xs text-slate-400 mt-1">Upload audit worksheets to compute analytical ratios</p>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 min-h-[180px]
              ${isDragOver 
                ? 'border-brand-500 bg-brand-50/50 scale-[1.01]' 
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }
            `}
          >
            <input 
              type="file" 
              id="csv-file-input" 
              accept=".csv"
              onChange={handleFileChange}
              className="hidden" 
            />
            <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-2.5">
              <div className="rounded-full bg-brand-50 p-3 text-brand-600 shadow-sm">
                <Upload className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Drag & drop your CSV file here</p>
                <p className="text-[10px] text-slate-400">or click to browse local files</p>
              </div>
            </label>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <AlertMessage type="error" title="Financial Analyzer Validation" message={errorMsg} />
          )}

          {isLoading && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <LoadingSpinner label="Analyzing CSV and preparing ratios..." />
            </div>
          )}

          {/* Load Sample Data buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleLoadDemo}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all hover:scale-[1.01]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Load Demo Audit Data
            </button>
            <button
              onClick={downloadSampleCSV}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              Download CSV Template
            </button>
          </div>
        </div>

        {/* Right Info Screen */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3 flex flex-col justify-center min-h-[300px]">
          {!dataset ? (
            <div className="text-center space-y-4 max-w-sm mx-auto p-4">
              <div className="rounded-full bg-slate-50 p-4 border border-slate-100 text-slate-300 w-16 h-16 mx-auto flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-brand-500" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-slate-700">Audit Ratio Workbench Standby</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Drag and drop a client's trial balance CSV or load the demo dataset on the left to begin financial trend and ratio calculations.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-display text-sm font-bold text-slate-800">Uploaded Auditee File</h4>
                  <p className="text-[10px] text-slate-400 truncate max-w-xs">{fileName}</p>
                </div>
                
                {/* Year Scope Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Review Year:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold outline-none focus:border-brand-500"
                  >
                    {dataset.map(d => (
                      <option key={d.year} value={d.year}>{d.year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ratios KPI Cards */}
              {yearData && (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  {/* Current Ratio */}
                  <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/30">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Current Ratio</span>
                    <span className="block text-base font-bold text-slate-800 mt-1">{yearData.ratios.currentRatio.toFixed(2)}</span>
                    <span className={`inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-semibold ${getRatioBadgeStyle(yearData.ratios.currentRatio, 1.2, 0)}`}>
                      {yearData.ratios.currentRatio >= 1.2 ? 'Healthy' : 'Risk'} (Bench: &gt;1.2)
                    </span>
                  </div>

                  {/* Quick Ratio */}
                  <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/30">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Quick Ratio</span>
                    <span className="block text-base font-bold text-slate-800 mt-1">{yearData.ratios.quickRatio.toFixed(2)}</span>
                    <span className={`inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-semibold ${getRatioBadgeStyle(yearData.ratios.quickRatio, 1.0, 0)}`}>
                      {yearData.ratios.quickRatio >= 1.0 ? 'Healthy' : 'Warning'} (Bench: &gt;1.0)
                    </span>
                  </div>

                  {/* Gross Profit Margin */}
                  <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/30">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Gross Margin</span>
                    <span className="block text-base font-bold text-slate-800 mt-1">{yearData.ratios.grossProfitMargin.toFixed(1)}%</span>
                    <span className="inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 bg-slate-100">
                      Product Margin
                    </span>
                  </div>

                  {/* Net Profit Margin */}
                  <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/30">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Net Margin</span>
                    <span className="block text-base font-bold text-slate-800 mt-1">{yearData.ratios.netProfitMargin.toFixed(1)}%</span>
                    <span className={`inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-semibold ${getRatioBadgeStyle(yearData.ratios.netProfitMargin, 5.0, 0)}`}>
                      {yearData.ratios.netProfitMargin >= 5.0 ? 'Healthy' : 'Risk'} (Bench: &gt;5%)
                    </span>
                  </div>

                  {/* Debt Ratio */}
                  <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/30">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Debt Ratio</span>
                    <span className="block text-base font-bold text-slate-800 mt-1">{yearData.ratios.debtRatio.toFixed(1)}%</span>
                    <span className={`inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-semibold ${getRatioBadgeStyle(yearData.ratios.debtRatio, 0, 60, false)}`}>
                      {yearData.ratios.debtRatio <= 60.0 ? 'Healthy' : 'Risk'} (Bench: &lt;60%)
                    </span>
                  </div>

                  {/* Debt-to-Equity */}
                  <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/30">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Debt-to-Equity</span>
                    <span className="block text-base font-bold text-slate-800 mt-1">{yearData.ratios.debtToEquity.toFixed(2)}</span>
                    <span className="inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 bg-slate-100">
                      Leverage Value
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ratios & Red Flag Panel (Visible if CSV processed) */}
      {dataset && yearData && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Key Audit Red Flags ({selectedYear})
            </h3>
            <button
              onClick={explainRedFlags}
              disabled={isExplaining || !yearData.redFlags?.length}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              {isExplaining ? 'Analyzing…' : 'Explain Red Flags with AI'}
            </button>
          </div>
          
          {yearData.redFlags.length === 0 ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 flex gap-2.5 items-start text-xs text-emerald-700">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">No Red Flags Triggered</p>
                <p className="text-[10px] mt-0.5">All ratio parameters for {selectedYear} fall within standard benchmark audit ranges.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {yearData.redFlags.map((flag, idx) => (
                  <div key={idx} className="rounded-xl border border-red-100 bg-red-50/30 p-3.5 flex gap-2.5 items-start text-xs text-red-700 hover:scale-[1.005] transition-all">
                    <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">{flag.title}</p>
                      <p className="text-[10px] leading-relaxed mt-1">{flag.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              {redFlagInsight ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 whitespace-pre-wrap">{redFlagInsight}</div>
              ) : null}
            </>
          )}
        </div>
      )}

      {/* Dynamic Charts Section */}
      {dataset && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Trend Area Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">Revenue Trend Line</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="Year" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={formatChartVal} />
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} labelStyle={{ fontSize: 10 }} itemStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit Trend Double Bar Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">Profit Trend Analysis</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="Year" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={formatChartVal} />
                  <Tooltip formatter={(value) => formatCurrency(value)} labelStyle={{ fontSize: 10 }} itemStyle={{ fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="CostOfGoodsSold" name="COGS" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="NetIncome" name="Net Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Debt vs Equity Line Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">Debt & Equity Leverage</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="Year" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={formatChartVal} />
                  <Tooltip formatter={(value) => formatCurrency(value)} labelStyle={{ fontSize: 10 }} itemStyle={{ fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="Debt" name="Total Debt" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Equity" name="Equity" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* AI Intelligence Explanation Section */}
      {redFlagInsight && (
        <article className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 animate-fadeIn">
          <div className="flex items-center gap-2 text-brand-600 mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Financial Red Flag Intelligence</span>
          </div>
          
          {(() => {
            try {
              const data = typeof redFlagInsight === 'string' ? JSON.parse(redFlagInsight.replace(/```json|```/gi, '').trim()) : redFlagInsight;
              return (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm mb-2">Executive Summary</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{data.summary}</p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.redFlagAnalysis?.map((item, idx) => (
                      <div key={idx} className="rounded-2xl border border-slate-200 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-800 text-sm">{item.redFlag}</h5>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.severity === 'High' ? 'bg-red-100 text-red-700' : 
                            item.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.severity}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Possible Causes</p>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                            {item.possibleCauses?.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Audit Implications</p>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                            {item.auditImplications?.map((imp, i) => <li key={i}>{imp}</li>)}
                          </ul>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Recommended Procedures</p>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                            {item.recommendedProcedures?.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 text-center italic mt-6">
                    AI-generated audit outputs are for assistance only and must be reviewed by a qualified auditor before use.
                  </p>
                </div>
              );
            } catch {
              return <pre className="text-xs bg-slate-50 p-4 rounded-xl overflow-auto">{redFlagInsight}</pre>;
            }
          })()}
        </article>
      )}
    </div>
  );
}
