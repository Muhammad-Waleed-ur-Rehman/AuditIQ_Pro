import { useState, useRef, useEffect, useId } from 'react';
import { generateCopilotResponse } from '../lib/auditEngine';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { invokeGemini } from '../lib/invokeGemini';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, AlertCircle, HelpCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import AlertMessage from './AlertMessage';

export default function AICopilot({ activeProject = null, onQueryTriggered }) {
  const { user } = useAuth();
  // Message history
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `### Hello, I am your AuditIQ Copilot
I am trained on standard auditing regulations (IFRS, US GAAP, ISA, PCAOB). Ask me any technical audit questions, or use the quick templates below.

**Try asking me about:**
1. IFRS 16 lease valuation testing
2. IFRS 15 revenue checklists
3. ISA 530 sampling guidelines
4. Inventory count procedures`,
      suggestions: ['Check IFRS 16 lease guidelines', 'Check IFRS 15 Revenue checklist', 'Audit sampling guidelines (ISA 530)']
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const messagesEndRef = useRef(null);
  const idPrefix = useId();
  const msgCounter = useRef(0);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const safeText = textToSend.trim();

    if (!safeText) {
      setErrorMessage('Please enter a question before sending it to the AI copilot.');
      return;
    }

    msgCounter.current += 1;
    const userMsg = {
      id: `${idPrefix}-${msgCounter.current}`,
      sender: 'user',
      text: safeText,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setErrorMessage('');

    if (onQueryTriggered) {
      onQueryTriggered();
    }

    try {
      if (isSupabaseConfigured && supabase) {
        const result = await invokeGemini({
          mode: 'audit_chat',
          prompt: safeText,
          projectContext: activeProject || null,
        });

        const responseText = (result || '').trim() || 'I could not generate a response right now.';

        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: responseText,
          },
        ]);

        if (activeProject && supabase && user?.id) {
          await supabase.from('ai_chat_logs').insert([
            {
              user_id: user.id,
              project_id: activeProject.id,
              user_question: safeText,
              ai_response: responseText,
            },
          ]);
        }
      } else {
        const response = generateCopilotResponse(safeText);
        setMessages(prev => [...prev, { id: Date.now() + 1, ...response }]);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to generate a Gemini response.');
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'I could not generate a response from the AI service. Please check your Supabase Gemini setup and try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  // Inline markdown formatter for premium visual appearance
  const formatResponseText = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-display font-bold text-sm text-slate-800 mt-3 mb-1.5 first:mt-0 border-l-2 border-brand-500 pl-2">
            {line.slice(4)}
          </h4>
        );
      }
      
      if (line.match(/^\d+\.\s/)) {
        const match = line.match(/^(\d+\.)\s(.*)/);
        if (match) {
          return (
            <div key={idx} className="flex gap-2 pl-2 my-1 text-xs text-slate-600">
              <span className="font-bold text-brand-600">{match[1]}</span>
              <span>
                {match[2].split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={pIdx} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                })}
              </span>
            </div>
          );
        }
      }
      
      // Inline bold replacement
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="text-xs text-slate-600 leading-relaxed my-1">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col justify-between">
      {/* Messaging thread panel */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        {/* Panel header */}
        <div className="border-b border-slate-100 px-4 py-3 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand-50 p-1.5 text-brand-600">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">AuditIQ Research Agent</p>
              <p className="text-[10px] text-slate-400">Trained on IFRS / ISA • Simulation Active</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
            <AlertCircle className="h-3 w-3" /> {isSupabaseConfigured ? 'Gemini Edge' : 'Sandbox Mode'}
          </span>
        </div>

        {/* Message Feed list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AlertMessage
            type="warning"
            title="AI-generated audit output"
            message="AI-generated audit outputs are for assistance only and must be reviewed by a qualified auditor before use."
            className="mb-4"
          />
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Profile icon */}
              <div className={`
                flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm
                ${msg.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-brand-50 text-brand-600 border border-brand-100'}
              `}>
                {msg.sender === 'user' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
              </div>

              {/* Message text bubble */}
              <div className="space-y-3">
                <div className={`
                  rounded-2xl px-4 py-3 shadow-sm border
                  ${msg.sender === 'user' 
                    ? 'bg-slate-800 text-slate-100 border-slate-700 rounded-tr-none' 
                    : 'bg-slate-50 text-slate-800 border-slate-200/60 rounded-tl-none'
                  }
                `}>
                  {msg.sender === 'user' ? (
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="space-y-1">{formatResponseText(msg.text)}</div>
                  )}
                </div>

                {/* Suggestions triggers */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-1.5">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:border-brand-500 hover:text-brand-700 transition-all shadow-sm"
                      >
                        <HelpCircle className="h-3 w-3 text-slate-400" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shadow-sm">
                <Bot className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-slate-50 border border-slate-200/60 px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {errorMessage && (
          <AlertMessage type="error" title="AI Copilot Validation" message={errorMessage} className="border-b-0 rounded-none" />
        )}

        {/* Input form */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Copilot (e.g. 'sampling rules' or 'IFRS 16 lease checks')..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-xs outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm"
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={isTyping}
              className="absolute right-2.5 rounded-lg bg-brand-600 p-1.5 text-white shadow hover:bg-brand-700 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isTyping ? <LoadingSpinner label="" className="text-white" /> : <Send className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
