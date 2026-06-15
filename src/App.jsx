import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RiskAssessment from './components/RiskAssessment';
import FinancialAnalyzer from './components/FinancialAnalyzer';
import WorkingPaperGenerator from './components/WorkingPaperGenerator';
import AuditProcedureGenerator from './components/AuditProcedureGenerator';
import AICopilot from './components/AICopilot';
import ManagementLetters from './pages/ManagementLetters';
import PlanningMemo from './pages/PlanningMemo';
import KnowledgeHub from './pages/KnowledgeHub';
import PromptLibrary from './pages/PromptLibrary';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';

const defaultStats = {
  projects: 12,
  highRisks: 4,
  workingPapers: 48,
  queries: 156,
  recentRiskScore: 'Pending',
  managementLetters: 0,
  planningMemos: 0,
  knowledgeHub: 0,
  promptLibrary: 0,
  financialRedFlags: 0
};

function DashboardShell({ page }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { activeProject, setActiveProject } = useProject();
  const [stats, setStats] = useState(defaultStats);
  const [searchQuery, setSearchQuery] = useState('');

  const tabMap = {
    dashboard: 'dashboard',
    projects: 'dashboard',
    'risk-assessment': 'risk-assessment',
    'financial-analyzer': 'financial-analyzer',
    'working-papers': 'working-paper',
    procedures: 'procedure-generator',
    'management-letters': 'management-letters',
    'planning-memo': 'planning-memo',
    'knowledge-hub': 'knowledge-hub',
    'prompt-library': 'prompt-library',
    copilot: 'ai-copilot',
    profile: 'profile'
  };

  const activeTab = tabMap[page] || 'dashboard';

  const handleSidebarNavigate = (tabId) => {
    const routeMap = {
      dashboard: '/dashboard',
      'risk-assessment': '/risk-assessment',
      'financial-analyzer': '/financial-analyzer',
      'working-paper': '/working-papers',
      'procedure-generator': '/procedures',
      'management-letters': '/management-letters',
      'planning-memo': '/planning-memo',
      'knowledge-hub': '/knowledge-hub',
      'prompt-library': '/prompt-library',
      'ai-copilot': '/copilot',
      profile: '/profile'
    };

    navigate(routeMap[tabId] || '/dashboard');
  };

  const handleRiskGenerated = (result) => {
    setStats((prev) => ({
      ...prev,
      recentRiskScore: `${result.score} (${result.level})`,
      highRisks: result.level === 'High' ? prev.highRisks + 1 : prev.highRisks
    }));
  };

  const handleWpGenerated = () => {
    setStats((prev) => ({
      ...prev,
      workingPapers: prev.workingPapers + 1
    }));
  };

  const handleQueryTriggered = () => {
    setStats((prev) => ({
      ...prev,
      queries: prev.queries + 1
    }));
  };

  const renderContent = () => {
    switch (page) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            setStats={setStats}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            onNavigate={(tab) => navigate(tab === 'dashboard' ? '/dashboard' : `/${tab}`)}
          />
        );
      case 'projects':
        return (
          <Dashboard
            page="projects"
            stats={stats}
            setStats={setStats}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            onNavigate={(tab) => navigate(tab === 'dashboard' ? '/dashboard' : `/${tab}`)}
          />
        );
      case 'risk-assessment':
        return <RiskAssessment activeProject={activeProject} onRiskGenerated={handleRiskGenerated} />;
      case 'financial-analyzer':
        return <FinancialAnalyzer />;
      case 'working-papers':
        return <WorkingPaperGenerator activeProject={activeProject} onWpGenerated={handleWpGenerated} />;
      case 'procedures':
        return <AuditProcedureGenerator activeProject={activeProject} />;
      case 'management-letters':
        return <ManagementLetters activeProject={activeProject} />;
      case 'planning-memo':
        return <PlanningMemo activeProject={activeProject} />;
      case 'knowledge-hub':
        return <KnowledgeHub />;
      case 'prompt-library':
        return <PromptLibrary />;
      case 'copilot':
        return <AICopilot activeProject={activeProject} onQueryTriggered={handleQueryTriggered} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <Dashboard stats={stats} setStats={setStats} activeProject={activeProject} setActiveProject={setActiveProject} onNavigate={(tab) => navigate(tab === 'dashboard' ? '/dashboard' : `/${tab}`)} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={handleSidebarNavigate} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header activeTab={activeTab} setIsOpen={setSidebarOpen} searchQuery={searchQuery} onSearch={setSearchQuery} />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="animate-fadeIn">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public routes: landing page, login, and signup stay outside the protected dashboard. */}
      <Route path="/" element={<Landing onEnterDashboard={() => navigate('/dashboard')} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes: every dashboard page is hidden behind Supabase session checks. */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardShell page="dashboard" /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><DashboardShell page="projects" /></ProtectedRoute>} />
      <Route path="/risk-assessment" element={<ProtectedRoute><DashboardShell page="risk-assessment" /></ProtectedRoute>} />
      <Route path="/financial-analyzer" element={<ProtectedRoute><DashboardShell page="financial-analyzer" /></ProtectedRoute>} />
      <Route path="/working-paper" element={<ProtectedRoute><DashboardShell page="working-papers" /></ProtectedRoute>} />
      <Route path="/working-papers" element={<ProtectedRoute><DashboardShell page="working-papers" /></ProtectedRoute>} />
      <Route path="/procedures" element={<ProtectedRoute><DashboardShell page="procedures" /></ProtectedRoute>} />
      <Route path="/management-letters" element={<ProtectedRoute><DashboardShell page="management-letters" /></ProtectedRoute>} />
      <Route path="/planning-memo" element={<ProtectedRoute><DashboardShell page="planning-memo" /></ProtectedRoute>} />
      <Route path="/knowledge-hub" element={<ProtectedRoute><DashboardShell page="knowledge-hub" /></ProtectedRoute>} />
      <Route path="/prompt-library" element={<ProtectedRoute><DashboardShell page="prompt-library" /></ProtectedRoute>} />
      <Route path="/copilot" element={<ProtectedRoute><DashboardShell page="copilot" /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardShell page="profile" /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    // Theme provider wraps everything so theme CSS variables are available globally.
    <ThemeProvider>
      {/* Auth provider wraps the whole app so session state is available to all routes. */}
      <AuthProvider>
        <BrowserRouter>
          <ProjectProvider>
            {/* Redirect behavior is handled by ProtectedRoute and the auth context. */}
            <AppRoutes />
          </ProjectProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
