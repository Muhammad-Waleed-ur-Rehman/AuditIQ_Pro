import { 
  LayoutDashboard, 
  ShieldAlert, 
  BarChart3, 
  FileSpreadsheet, 
  ClipboardCheck, 
  MessageSquareCode,
  BookOpen,
  FileText,
  Sparkles,
  X,
  TrendingUp,
  PenSquare,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const { user, profile, signOut } = useAuth();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayRole = profile?.role || 'Auditor';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  // Navigation tabs config
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'risk-assessment', name: 'Risk Assessment', icon: ShieldAlert },
    { id: 'financial-analyzer', name: 'Financial Analyzer', icon: BarChart3 },
    { id: 'working-paper', name: 'Working Paper Gen', icon: FileSpreadsheet },
    { id: 'procedure-generator', name: 'Procedure Program', icon: ClipboardCheck },
    { id: 'management-letters', name: 'Management Letters', icon: FileText },
    { id: 'planning-memo', name: 'Planning Memo', icon: PenSquare },
    { id: 'knowledge-hub', name: 'Knowledge Hub', icon: BookOpen },
    { id: 'prompt-library', name: 'Prompt Library', icon: Sparkles },
    { id: 'ai-copilot', name: 'AI Audit Copilot', icon: MessageSquareCode },
    { id: 'profile', name: 'My Profile', icon: User }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed bottom-0 top-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-300 transition-transform duration-300 md:sticky md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white shadow-md glow-brand">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-white">AuditIQ Pro</span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">AI Auditor Hub</span>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="rounded-lg p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); // Close sidebar on mobile after clicking
                }}
                className={`
                  flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-700/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }
                `}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/40 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-brand-100 font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{displayName}</p>
              <p className="truncate text-[10px] text-slate-500">{displayRole}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/50 px-3 py-2 text-[10px] font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-600">v1.0.0 • Local Simulation</p>
          </div>
        </div>
      </aside>
    </>
  );
}
