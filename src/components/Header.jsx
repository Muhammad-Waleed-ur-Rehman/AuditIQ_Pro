import { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, Cpu, Database, X, CheckCircle2, AlertTriangle, Info, Sun, Moon, Monitor } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { useTheme } from '../context/ThemeContext';

const mockNotifications = [
  { id: 1, type: 'success', text: 'Working paper for Apex Tech Group has been generated.', time: '2 min ago' },
  { id: 2, type: 'warning', text: 'Risk assessment for Beacon Health is overdue.', time: '1 hour ago' },
  { id: 3, type: 'info', text: 'New IFRS 16 lease guidance update available in Knowledge Hub.', time: '3 hours ago' },
  { id: 4, type: 'success', text: 'Management letter draft for Crestview Manufacturing completed.', time: '1 day ago' },
];

function NotificationIcon({ type }) {
  switch (type) {
    case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    default: return <Info className="h-4 w-4 text-blue-500" />;
  }
}

export default function Header({ activeTab, setIsOpen, searchQuery = '', onSearch }) {
  const { theme, cycleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState(mockNotifications);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Title mapping
  const titleMap = {
    'dashboard': 'Executive Audit Dashboard',
    'risk-assessment': 'Dynamic Risk Assessment Engine',
    'financial-analyzer': 'Automated Financial Statement Analyzer',
    'working-paper': 'Audit Working Paper Generator',
    'procedure-generator': 'Custom Audit Procedure Generator',
    'management-letters': 'Management Letter Generator',
    'planning-memo': 'Planning Memo Assistant',
    'knowledge-hub': 'Knowledge Hub & Guidance',
    'prompt-library': 'Prompt Library',
    'ai-copilot': 'AuditIQ AI Copilot & Research Assistant'
  };

  const getTitle = () => {
    return titleMap[activeTab] || 'AuditIQ Pro';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/85 px-4 shadow-sm backdrop-blur-md md:px-6">
      {/* Left items */}
      <div className="flex items-center gap-3">
        {/* Hamburger menu for mobile */}
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 hover:bg-slate-100 text-slate-600 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-display text-lg font-bold text-slate-800 md:text-xl">{getTitle()}</h1>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Bar (Desktop) */}
        <div className="relative hidden w-64 lg:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search projects, clients..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs outline-none transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch?.('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Integration Status Badges */}
        <div className="flex items-center gap-2">
          {/* Supabase Status */}
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border ${
            isSupabaseConfigured 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <Database className={`h-3 w-3 ${isSupabaseConfigured ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="hidden sm:inline">Supabase:</span>
            <span className="font-semibold">{isSupabaseConfigured ? 'Connected' : 'Simulation'}</span>
          </div>

          {/* AI Copilot Status */}
          <div className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-medium text-amber-700">
            <Cpu className="h-3 w-3 text-amber-500" />
            <span className="hidden sm:inline">AI:</span>
            <span className="font-semibold">Simulation</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${theme} (click to cycle)`}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {theme === 'light' ? <Sun className="h-4 w-4" /> : theme === 'dim' ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Notifications</h3>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="mt-0.5 shrink-0">
                        <NotificationIcon type={n.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-700 leading-relaxed">{n.text}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
