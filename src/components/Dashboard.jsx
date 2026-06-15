import React, { useState, useEffect } from 'react';
import {
  FolderGit,
  ShieldX,
  ShieldAlert,
  FileCheck,
  Bot,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Gauge,
  Sparkles,
  FileText,
  PenSquare,
  BookOpen,
  Search,
  Trash2,
  Plus,
  AlertOctagon,
  ListTodo,
  Target,
  Activity
} from 'lucide-react';
import { isSupabaseConfigured, supabase, getSupabaseErrorMessage } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import {
  fetchActiveEngagements,
  fetchProjectRiskScores,
  fetchHighRiskCount,
  fetchLatestRiskScore,
  fetchAllRiskAssessments,
  fetchActiveEngagementsCount,
  fetchAiQueriesCount
} from '../lib/dashboardData';
import {
  fetchChecklistItems,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  fetchChecklistStats
} from '../lib/checklistService';
import {
  buildHeatmapGrid,
  placeAssessmentsOnGrid,
  getInherentRiskColor,
  getInherentRiskLevel,
  getControlRiskLevel,
  getControlRiskColor,
  getOverallRiskLevel,
  getOverallRiskColor,
  LIKELIHOOD_LABELS,
  MAGNITUDE_LABELS,
  getStatusBadgeStyle
} from '../lib/riskHeatmap';
import StatCard from './StatCard';
import SectionCard from './SectionCard';
import AlertMessage from './AlertMessage';
import LoadingSpinner from './LoadingSpinner';

export default function Dashboard({
  page = 'dashboard',
  stats = { projects: 0, highRisks: 0, workingPapers: 0, queries: 0, recentRiskScore: 'Pending', managementLetters: 0, planningMemos: 0, promptLibrary: 0, knowledgeHub: 0, financialRedFlags: 0, checklistCompletion: 0 },
  setStats,
  onNavigate,
  searchQuery = '',
  onSearch
}) {
  const [projectsList, setProjectsList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [auditType, setAuditType] = useState('External Audit');
  const [industry, setIndustry] = useState('Technology');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const { user, profile } = useAuth();
  const { activeProject, setActiveProject } = useProject();

  const [engagements, setEngagements] = useState([]);
  const [riskScores, setRiskScores] = useState({});
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState(null);
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [heatmapGrid, setHeatmapGrid] = useState([]);
  const [activeEngagementsCount, setActiveEngagementsCount] = useState(0);
  const [checklistStats, setChecklistStats] = useState({ total: 0, completed: 0, progress: 0 });

  const loadDashboardData = React.useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user?.id) return;
    setIsLoadingMetrics(true);

    async function safeFetch(name, fn) {
      try { return await fn(); }
      catch (e) { console.warn(`${name} query failed:`, e); return null; }
    }

    const [
      projectsRes,
      lettersRes,
      memosRes,
      promptsRes,
      financialRes,
      wpRes,
      queriesCount,
      highRiskCount,
      latestScore,
      engagementsData,
      riskScoresData,
      riskAssessmentsData,
      activeCount,
      checklistStatsData
    ] = await Promise.all([
      safeFetch('projectCount', () =>
        supabase.from('audit_projects').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ),
      safeFetch('lettersCount', () =>
        supabase.from('management_letters').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ),
      safeFetch('memosCount', () =>
        supabase.from('planning_memos').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ),
      safeFetch('promptsCount', () =>
        supabase.from('prompt_library').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ),
      safeFetch('financialRedFlags', () =>
        supabase.from('financial_analyses').select('red_flags').eq('user_id', user.id)
      ),
      safeFetch('wpCount', () =>
        supabase.from('working_papers').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ),
      safeFetch('aiQueriesCount', () => fetchAiQueriesCount(user.id)),
      safeFetch('highRiskCount', () => fetchHighRiskCount(user.id)),
      safeFetch('latestScore', () => fetchLatestRiskScore(user.id)),
      safeFetch('engagements', () => fetchActiveEngagements(user.id)),
      safeFetch('riskScores', () => fetchProjectRiskScores(user.id)),
      safeFetch('riskAssessments', () => fetchAllRiskAssessments(user.id)),
      safeFetch('activeCount', () => fetchActiveEngagementsCount(user.id)),
      safeFetch('checklistStats', () => fetchChecklistStats(user.id, activeProject?.id))
    ]);

    const redFlagsCount = financialRes?.data?.reduce((acc, curr) => {
      return acc + (Array.isArray(curr.red_flags) ? curr.red_flags.length : 0);
    }, 0) ?? 0;

    const checklistStatsSafe = checklistStatsData || { total: 0, completed: 0, progress: 0 };

    setStats(prev => ({
      ...prev,
      projects: projectsRes?.count ?? prev.projects,
      highRisks: highRiskCount ?? prev.highRisks,
      workingPapers: wpRes?.count ?? prev.workingPapers,
      queries: queriesCount ?? prev.queries,
      recentRiskScore: latestScore || prev.recentRiskScore,
      managementLetters: lettersRes?.count ?? prev.managementLetters ?? 0,
      planningMemos: memosRes?.count ?? prev.planningMemos ?? 0,
      promptLibrary: promptsRes?.count ?? prev.promptLibrary ?? 0,
      financialRedFlags: redFlagsCount,
      checklistCompletion: checklistStatsSafe.progress
    }));
    setEngagements(engagementsData || []);
    setRiskScores(riskScoresData || {});
    setRiskAssessments(riskAssessmentsData || []);
    setActiveEngagementsCount(activeCount ?? 0);
    setChecklistStats(checklistStatsSafe);

    const grid = buildHeatmapGrid();
    setHeatmapGrid(placeAssessmentsOnGrid(grid, riskAssessmentsData || []));

    setIsLoadingMetrics(false);
  }, [user, activeProject?.id, setStats]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    async function loadChecklist() {
      if (!isSupabaseConfigured || !supabase || !user?.id) return;
      setChecklistLoading(true);
      setChecklistError(null);
      try {
        const items = await fetchChecklistItems(user.id, activeProject?.id);
        setChecklistItems(items);
        const statsData = await fetchChecklistStats(user.id, activeProject?.id);
        setChecklistStats(statsData);
      } catch (err) {
        setChecklistError(err.message);
      } finally {
        setChecklistLoading(false);
      }
    }
    loadChecklist();
  }, [activeProject, user?.id]);

  useEffect(() => {
    async function loadProjects() {
      if (!isSupabaseConfigured || !supabase || !user?.id) return;
      setLoadingProjects(true);
      try {
        const { data, error } = await supabase
          .from('audit_projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProjectsList(data || []);
      } catch (err) {
        console.warn('Failed to load projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    }
    if (page === 'projects') loadProjects();
  }, [page, user?.id]);

  const handleToggleChecklist = async (id, currentCompleted) => {
    setChecklistError(null);
    try {
      await toggleChecklistItem(id, currentCompleted);
      setChecklistItems(prev =>
        prev.map(item => item.id === id ? { ...item, is_completed: !currentCompleted } : item)
      );
      const statsData = await fetchChecklistStats(user.id, activeProject?.id);
      setChecklistStats(statsData);
    } catch (err) {
      setChecklistError(err.message);
    }
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newChecklistTitle.trim() || !user?.id) return;
    if (!activeProject) {
      setChecklistError('Select a project first before adding tasks.');
      return;
    }
    setChecklistError(null);
    try {
      const item = await addChecklistItem(user.id, activeProject.id, newChecklistTitle.trim());
      if (item) {
        setChecklistItems(prev => [item, ...prev]);
        setNewChecklistTitle('');
        const statsData = await fetchChecklistStats(user.id, activeProject?.id);
        setChecklistStats(statsData);
      }
    } catch (err) {
      setChecklistError(err.message);
    }
  };

  const handleDeleteChecklist = async (id) => {
    setChecklistError(null);
    try {
      await deleteChecklistItem(id);
      setChecklistItems(prev => prev.filter(item => item.id !== id));
      const statsData = await fetchChecklistStats(user.id, activeProject?.id);
      setChecklistStats(statsData);
    } catch (err) {
      setChecklistError(err.message);
    }
  };

  const handleClickEngagement = (eng) => {
    setActiveProject(eng);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setDbError(null);

    if (!user?.id) {
      setDbError('Please sign in before creating an audit project.');
      setIsSaving(false);
      return;
    }

    const newProjectData = {
      user_id: user.id,
      project_name: projectName,
      client_name: clientName,
      audit_type: auditType,
      industry: industry
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_projects')
          .insert([newProjectData])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          setActiveProject(data[0]);
          setSuccessMsg(`Project "${projectName}" successfully saved to Supabase database!`);
          setProjectName('');
          setClientName('');
          await loadDashboardData();
          setStats(prev => ({ ...prev, projects: (prev.projects || 0) + 1 }));
        }
      } catch (err) {
        setDbError(getSupabaseErrorMessage(err));
      } finally {
        setIsSaving(false);
      }
    } else {
      setTimeout(() => {
        const localMockProject = {
          id: 'local-mock-id-' + Math.floor(Math.random() * 1000),
          ...newProjectData,
          created_at: new Date().toISOString()
        };
        setActiveProject(localMockProject);
        setStats(prev => ({ ...prev, projects: prev.projects + 1 }));
        setSuccessMsg(`Project "${projectName}" saved locally (Sandbox Mode)!`);
        setProjectName('');
        setClientName('');
        setIsSaving(false);
      }, 500);
    }
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredProjects = q
    ? projectsList.filter((p) =>
        [p.project_name, p.client_name, p.audit_type, p.industry]
          .some((f) => f?.toLowerCase().includes(q))
      )
    : projectsList;

  if (page === 'projects') {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Audit Projects</h2>
            <p className="text-sm text-slate-500 mt-1">Your saved audit engagements</p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            + New Project
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex gap-3 text-xs text-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Database Configuration Required</p>
              <p className="text-[11px] leading-relaxed mt-0.5">Projects are stored in Supabase. Configure your environment variables to save and view projects.</p>
            </div>
          </div>
        )}

        {loadingProjects ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner label="Loading projects..." className="h-6 w-6" />
          </div>
        ) : projectsList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <FolderGit className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-slate-600">No projects yet</h3>
            <p className="mt-1 text-sm text-slate-400">Create your first audit project to get started.</p>
            <button
              onClick={() => onNavigate('dashboard')}
              className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        ) : q && filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <Search className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-slate-600">No results for "{searchQuery}"</h3>
            <p className="mt-1 text-sm text-slate-400">Try a different search term or browse all projects.</p>
            <button
              onClick={() => onSearch?.('')}
              className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {q && (
              <p className="text-xs text-slate-500">{filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
            )}
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => { setActiveProject(project); onNavigate('dashboard'); }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{project.project_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{project.client_name}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold text-brand-600">
                        {project.audit_type}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {project.industry}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    project.status === 'active' || !project.status
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-50 text-slate-500'
                  }`}>
                    {project.status || 'active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const completedTasks = checklistItems.filter(i => i.is_completed).length;
  const totalTasks = checklistItems.length;
  const checklistProgressValue = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {!isSupabaseConfigured && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex gap-3 text-xs text-amber-800 animate-fadeIn">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Database Configuration Required</p>
            <p className="text-[11px] leading-relaxed mt-0.5">
              The application is running in Simulation Mode because the database environment configuration is incomplete.
              To save audits to your Supabase project, copy .env.example to .env and enter your project credentials.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 p-6 md:p-8 text-white shadow-xl">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}</h2>
        <p className="mt-2 text-sm text-brand-100 max-w-xl">
          AuditIQ Pro has compiled your active client profiles. Review risk assessments, run ratio analytics, and generate compliance work papers below.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('risk-assessment')}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-brand-900 shadow-md transition-all hover:bg-slate-100 hover:scale-[1.02]"
          >
            New Risk Assessment <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigate('copilot')}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500/35 border border-brand-400/30 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-brand-500/50"
          >
            Consult AI Copilot
          </button>
        </div>
      </div>

      {isLoadingMetrics && (
        <div className="flex items-center gap-2 text-xs text-slate-400 animate-pulse">
          <LoadingSpinner label="Synchronizing audit metrics..." className="h-4 w-4" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          icon={FolderGit}
          label="Total Projects"
          value={stats.projects}
          detail="Active engagement profiles"
          accent="brand"
          onClick={() => onNavigate('projects')}
        />
        <StatCard
          icon={Activity}
          label="Active Engagements"
          value={activeEngagementsCount}
          detail="Projects in progress"
          accent="blue"
          onClick={() => onNavigate('projects')}
        />
        <StatCard
          icon={ShieldX}
          label="High Risk Areas"
          value={stats.highRisks}
          detail="Risk level = High or Significant"
          accent="red"
          onClick={() => onNavigate('risk-assessment')}
        />
        <StatCard
          icon={ListTodo}
          label="Checklist Completion"
          value={`${checklistStats.progress}%`}
          detail={`${checklistStats.completed} / ${checklistStats.total} tasks`}
          accent="teal"
        />
        <StatCard
          icon={AlertTriangle}
          label="Financial Red Flags"
          value={stats.financialRedFlags ?? 0}
          detail="Detected anomalies"
          accent="red"
          onClick={() => onNavigate('financial-analyzer')}
        />
        <StatCard
          icon={FileText}
          label="Management Letters"
          value={stats.managementLetters ?? 0}
          detail="Drafts created"
          accent="teal"
          onClick={() => onNavigate('management-letters')}
        />
        <StatCard
          icon={PenSquare}
          label="Planning Memos"
          value={stats.planningMemos ?? 0}
          detail="Engagement planning notes"
          accent="indigo"
          onClick={() => onNavigate('planning-memo')}
        />
        <StatCard
          icon={Gauge}
          label="Latest Risk Score"
          value={stats.recentRiskScore || 'Pending'}
          detail="Most recent assessment"
          accent="violet"
          onClick={() => onNavigate('risk-assessment')}
        />
        <StatCard
          icon={Sparkles}
          label="Prompt Library Items"
          value={stats.promptLibrary ?? 0}
          detail="Reusable prompts saved"
          accent="amber"
          onClick={() => onNavigate('prompt-library')}
        />
        <StatCard
          icon={FileCheck}
          label="Working Papers"
          value={stats.workingPapers}
          detail="Generated output items"
          accent="emerald"
          onClick={() => onNavigate('working-paper')}
        />
        <StatCard
          icon={BookOpen}
          label="Knowledge Hub"
          value={stats.knowledgeHub ?? 0}
          detail="Reference guidance sessions"
          accent="cyan"
          onClick={() => onNavigate('knowledge-hub')}
        />
        <StatCard
          icon={Bot}
          label="AI Queries"
          value={stats.queries}
          detail="Copilot interactions"
          accent="amber"
          onClick={() => onNavigate('ai-copilot')}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Recent Activity"
          subtitle="A quick summary of the most recent audit actions"
          action={<span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-semibold text-brand-700">Live</span>}
        >
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div>
                <p className="font-semibold text-slate-800">Active engagement</p>
                <p className="text-[11px] text-slate-500">{activeProject ? `${activeProject.project_name} for ${activeProject.client_name}` : 'No project selected yet.'}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">Ready</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div>
                <p className="font-semibold text-slate-800">Latest risk score</p>
                <p className="text-[11px] text-slate-500">{stats.recentRiskScore || 'No risk assessment generated yet.'}</p>
              </div>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div>
                <p className="font-semibold text-slate-800">Checklist progress</p>
                <p className="text-[11px] text-slate-500">{checklistStats.completed} of {checklistStats.total} tasks complete ({checklistStats.progress}%)</p>
              </div>
              <ListTodo className="h-4 w-4 text-brand-500" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div>
                <p className="font-semibold text-slate-800">AI activity</p>
                <p className="text-[11px] text-slate-500">{stats.queries} queries tracked for the current session.</p>
              </div>
              <Sparkles className="h-4 w-4 text-brand-500" />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Deployment Readiness"
          subtitle="What is currently available in the current MVP"
        >
          <div className="space-y-3 text-xs text-slate-600">
            <AlertMessage
              type={isSupabaseConfigured ? 'success' : 'warning'}
              title={isSupabaseConfigured ? 'Supabase is configured' : 'Supabase setup required'}
              message={isSupabaseConfigured ? 'Project, risk, and AI data are ready to sync.' : 'Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values to use live persistence.'}
            />
            <AlertMessage
              type="info"
              title="MVP status"
              message="All existing modules remain available while the AI and database flows are connected for deployment preparation."
            />
          </div>
        </SectionCard>
      </div>

      {activeProject ? (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/10 p-5 shadow-sm space-y-4 animate-fadeIn">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 uppercase tracking-wide">
                Database Entry Connected
              </span>
              <span className="text-sm font-semibold text-slate-700">Active Audit Engagement</span>
            </div>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getStatusBadgeStyle(activeProject.status)}`}>
              {activeProject.status || 'active'}
            </span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs font-medium text-slate-700">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Project Name:</span>
              <span className="font-bold text-slate-900">{activeProject.project_name}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Client / Auditee:</span>
              <span className="font-bold text-slate-900">{activeProject.client_name}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Audit Scoping Type:</span>
              <span className="font-bold text-slate-900">{activeProject.audit_type}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Industry Target:</span>
              <span className="font-bold text-slate-900">{activeProject.industry}</span>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveProject(null)}
              className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Clear Active Project
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display text-base font-bold text-slate-900">Setup Audit Project</h3>
            <p className="text-xs text-slate-400 mt-0.5">Initialize a client project to save risk assessments and audit checklists</p>
          </div>

          <form onSubmit={handleSaveProject} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                placeholder="e.g. FY26 Q2 Sales Audit"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                placeholder="e.g. Apex Tech Corp"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase">Audit Type</label>
              <select
                value={auditType}
                onChange={(e) => setAuditType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
              >
                <option value="External Audit">External Audit</option>
                <option value="Internal Audit">Internal Audit</option>
                <option value="Compliance Audit">Compliance Audit</option>
                <option value="Special Investigation">Special Investigation</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1.5 uppercase">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
              >
                <option value="Technology">Technology</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-700/15 hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-75"
              >
                {isSaving ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </form>

          {successMsg && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 flex gap-2.5 items-start text-xs text-emerald-700 animate-fadeIn">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {dbError && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 flex gap-2.5 items-start text-xs text-red-700 animate-fadeIn">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Database Error</p>
                <p className="text-[10px] leading-relaxed mt-0.5">{dbError}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Active Audit Engagements</h3>
              <p className="text-xs text-slate-400">Projects where status is not completed</p>
            </div>
            <span className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-600">
              {engagements.length} Active
            </span>
          </div>

          <div className="mt-4">
            {engagements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <FolderGit className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p>No active engagements yet. Create a project to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {engagements.map((eng) => {
                  const risk = riskScores[eng.id];
                  const isActive = activeProject?.id === eng.id;
                  return (
                    <div
                      key={eng.id}
                      onClick={() => handleClickEngagement(eng)}
                      className={`rounded-xl border p-3 transition-all cursor-pointer hover:shadow-sm ${
                        isActive
                          ? 'border-brand-400 bg-brand-50/40 ring-1 ring-brand-200'
                          : 'border-slate-100 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                                Current
                              </span>
                            )}
                            <p className="text-xs font-semibold text-slate-800">{eng.client_name}</p>
                            <span className="text-[10px] text-slate-400">-</span>
                            <p className="text-[10px] text-slate-500">{eng.project_name}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                              {eng.audit_type}
                            </span>
                            <span className="text-[9px] text-slate-400">{eng.industry || 'N/A'}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${getStatusBadgeStyle(eng.status)}`}>
                              {eng.status || 'active'}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          {risk ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                              risk.level === 'High' ? 'bg-red-50 text-red-600' :
                              risk.level === 'Medium' ? 'bg-amber-50 text-amber-600' :
                              'bg-emerald-50 text-emerald-600'
                            }`}>
                              {risk.level}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400">No risk score</span>
                          )}
                          <p className="text-[9px] text-slate-400 mt-1">{new Date(eng.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
            Audit Checklist & Tasks
          </h3>

          {!activeProject ? (
            <div className="py-6 text-center text-xs text-slate-400">
              <AlertOctagon className="h-6 w-6 text-slate-300 mx-auto mb-1" />
              <p>Select a project first to manage tasks.</p>
            </div>
          ) : (
            <>
              {totalTasks > 0 && (
                <div className="mt-3 mb-4">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>{completedTasks} of {totalTasks} done</span>
                    <span>{checklistProgressValue}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-300"
                      style={{ width: `${checklistProgressValue}%` }}
                    />
                  </div>
                </div>
              )}

              <form onSubmit={handleAddChecklist} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newChecklistTitle.trim()}
                  className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </form>

              {checklistError && (
                <div className="mb-3 rounded-lg bg-red-50 border border-red-100 p-2 text-[10px] text-red-600">
                  {checklistError}
                </div>
              )}

              <div className="mt-2 space-y-2 max-h-[350px] overflow-y-auto">
                {checklistLoading ? (
                  <div className="flex justify-center py-6">
                    <LoadingSpinner label="Loading tasks..." className="h-5 w-5" />
                  </div>
                ) : checklistItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <FileCheck className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                    <p>No checklist items yet.</p>
                  </div>
                ) : (
                  checklistItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-100 p-2.5 transition-colors hover:bg-slate-50/50 group"
                    >
                      <input
                        type="checkbox"
                        checked={item.is_completed}
                        onChange={() => handleToggleChecklist(item.id, item.is_completed)}
                        className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium ${item.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                            item.category === 'Fieldwork' ? 'bg-violet-50 text-violet-600' :
                            item.category === 'Reporting' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {item.category || 'Planning'}
                          </span>
                          {item.due_date && (
                            <span className="text-[9px] text-slate-400">
                              Due: {new Date(item.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteChecklist(item.id)}
                        className="shrink-0 rounded-lg p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">ISA 315-Inspired Risk Assessment View</h3>
            <p className="text-xs text-slate-400">Conceptual risk visualization based on inherent risk factors and control effectiveness</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{riskAssessments.length} assessment{riskAssessments.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => onNavigate('risk-assessment')}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              + New Assessment
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-500" />
                Inherent Risk Matrix (Likelihood × Magnitude)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/30 p-3">
                <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-1 min-w-[400px]">
                  <div className="col-span-1" />
                  {MAGNITUDE_LABELS.map((label, i) => (
                    <div key={label} className="text-center text-[9px] font-semibold text-slate-500 pb-2">
                      <span className="block text-xs font-bold text-slate-700">{i + 1}</span>
                      <span>{label}</span>
                    </div>
                  ))}
                  {heatmapGrid.map((row, likIdx) => (
                    <React.Fragment key={likIdx}>
                      <div className="flex items-center justify-end pr-2 text-[9px] font-semibold text-slate-500">
                        <span className="text-right">
                          <span className="block text-xs font-bold text-slate-700">{5 - likIdx}</span>
                          <span>{LIKELIHOOD_LABELS[4 - likIdx]}</span>
                        </span>
                      </div>
                      {row.map((cell, magIdx) => (
                        <div
                          key={`${likIdx}-${magIdx}`}
                          className={`rounded-lg border ${cell.color.bg} p-2 text-center min-h-[58px] flex flex-col items-center justify-center gap-1 transition-all hover:shadow-sm hover:scale-[1.02]`}
                        >
                          <span className={`text-[9px] font-bold ${cell.color.badge}`}>{cell.level}</span>
                          {cell.assessments.length > 0 && (
                            <span className="text-[11px] font-bold text-slate-700 bg-white/60 rounded-full px-2 py-0.5">
                              {cell.assessments.length}
                            </span>
                          )}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                  <div className="col-span-1" />
                  {['Mag 1', 'Mag 2', 'Mag 3', 'Mag 4', 'Mag 5'].map((l) => (
                    <div key={l} className="text-center text-[8px] text-slate-400 pt-1">{l}</div>
                  ))}
                </div>
              </div>
              {riskAssessments.length === 0 && (
                <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                  <Target className="h-5 w-5" />
                  <p>No risk assessments yet. Create one to populate the matrix.</p>
                </div>
              )}
            </div>

            {riskAssessments.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  Control Risk Assessment
                </h4>
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {riskAssessments.slice(0, 5).map((a) => {
                    const controlLevel = getControlRiskLevel(a.control_risk_score);
                    const controlColor = getControlRiskColor(controlLevel);
                    return (
                      <div
                        key={a.id}
                        className={`rounded-xl border ${a.significant_risk ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white'} p-4 text-xs shadow-sm`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-800">{a.risk_area || 'N/A'}</span>
                          {a.significant_risk && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">
                              <AlertOctagon className="h-3.5 w-3.5" /> Significant Risk
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Assertion:</span>
                            <span className="font-semibold text-slate-700">{a.assertion || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Inherent:</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${getInherentRiskColor(getInherentRiskLevel(a.likelihood, a.magnitude)).badge}`}>
                              {getInherentRiskLevel(a.likelihood, a.magnitude)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Control:</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${controlColor.badge}`}>{controlLevel}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Score:</span>
                            <span className="font-semibold text-slate-700">{a.inherent_risk_score || a.likelihood * a.magnitude}/25</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Lik/Mag:</span>
                            <span className="font-semibold text-slate-700">{a.likelihood}/{a.magnitude}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {riskAssessments.length > 5 && (
                    <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100">
                      + {riskAssessments.length - 5} more assessment{riskAssessments.length - 5 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {riskAssessments.length > 0 && (
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-violet-500" />
                Combined Risk Summary
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider">Risk Area</th>
                      <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider">Assertion</th>
                      <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center">Lik</th>
                      <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center">Mag</th>
                      <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center">Inherent</th>
                      <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center">Control</th>
                      <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center">Overall</th>
                      <th className="py-3 px-4 font-bold text-[10px] uppercase tracking-wider text-center">Significant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riskAssessments.map((a) => {
                      const inherentLevel = getInherentRiskLevel(a.likelihood, a.magnitude);
                      const controlLevel = getControlRiskLevel(a.control_risk_score);
                      const overallLevel = getOverallRiskLevel(inherentLevel, controlLevel);
                      const overallColor = getOverallRiskColor(overallLevel);
                      return (
                        <tr key={a.id} className={`hover:bg-slate-50/70 transition-colors ${a.significant_risk ? 'bg-red-50/30' : ''}`}>
                          <td className="py-3 px-4 font-semibold text-slate-800">{a.risk_area || 'N/A'}</td>
                          <td className="py-3 px-4 text-slate-500">{a.assertion || 'N/A'}</td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">{a.likelihood || '-'}</td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">{a.magnitude || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${getInherentRiskColor(inherentLevel).badge}`}>
                              {inherentLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${getControlRiskColor(controlLevel).badge}`}>
                              {controlLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${overallColor.badge}`}>
                              {overallLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {a.significant_risk ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">
                                <AlertOctagon className="h-3 w-3" /> Yes
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">No</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug Panel */}
      <details className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 shadow-sm">
        <summary className="cursor-pointer text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider select-none">
          Debug Info (click to expand)
        </summary>
        <div className="mt-3 space-y-1.5 text-[10px] font-mono text-slate-600">
          <p>supabase: {isSupabaseConfigured ? 'CONFIGURED' : 'NOT_CONFIGURED'}</p>
          <p>user.id: {user?.id || 'null'}</p>
          <p>profile: {profile ? JSON.stringify(profile, null, 2) : 'null'}</p>
          <p>activeProject.id: {activeProject?.id || 'null'}</p>
          <p>activeProject.name: {activeProject?.project_name || 'null'}</p>
          <p>stats.projects: {stats.projects} | highRisks: {stats.highRisks} | workingPapers: {stats.workingPapers} | queries: {stats.queries}</p>
          <p>stats.recentRiskScore: {stats.recentRiskScore} | financialRedFlags: {stats.financialRedFlags}</p>
          <p>stats.managementLetters: {stats.managementLetters} | planningMemos: {stats.planningMemos}</p>
          <p>stats.promptLibrary: {stats.promptLibrary} | knowledgeHub: {stats.knowledgeHub}</p>
          <p>activeEngagementsCount: {activeEngagementsCount}</p>
          <p>riskAssessments.length: {riskAssessments.length}</p>
          <p>checklistStats: {JSON.stringify(checklistStats)}</p>
          <p>checklistItems.length: {checklistItems.length}</p>
          <p>engagements.length: {engagements.length}</p>
          <p>heatmapGrid cells with assessments: {heatmapGrid.flat().filter(c => c.assessments.length > 0).length}</p>
        </div>
      </details>
    </div>
  );
}
