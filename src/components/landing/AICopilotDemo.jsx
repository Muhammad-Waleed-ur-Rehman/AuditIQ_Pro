import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const botResponses = [
  [
    'Obtain inventory listing by location and valuation method.',
    'Test inventory costing methodology (FIFO, weighted average).',
    'Select sample items based on materiality and risk.',
    'Recalculate inventory valuation for sampled items.',
    'Compare calculated values to general ledger and supporting docs.',
    'Investigate unusual variances and obtain explanations.',
  ],
  [
    { label: 'Observation', text: 'Inadequate segregation of duties identified within the procurement cycle.' },
    { label: 'Risk', text: 'Unauthorized transactions may occur without detection.' },
    { label: 'Recommendation', text: 'Implement approval hierarchies and periodic supervisory reviews.' },
  ],
];

const userMessages = [
  'Generate audit procedures for inventory valuation.',
  'Draft a management letter point for segregation of duties weakness.',
];

export default function AICopilotDemo() {
  const sectionRef = useRef(null);
  const chatRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [userText, setUserText] = useState({ 0: '', 1: '' });
  const [botVisible, setBotVisible] = useState({ 0: [], 1: [] });
  const [showCursor, setShowCursor] = useState(true);
  const [botDone, setBotDone] = useState({ 0: false, 1: false });
  const [demoStarted, setDemoStarted] = useState(false);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(interval);
  }, []);

  // ScrollTrigger to start demo
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 75%',
        once: true,
        onEnter: () => setDemoStarted(true),
      });

      gsap.fromTo(
        '[data-copilot-heading]',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        }
      );

      gsap.fromTo(
        '[data-copilot-chat]',
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 70%', once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  // Type first user message
  useEffect(() => {
    if (!demoStarted || phase !== 0) return;
    let i = 0;
    const msg = userMessages[0];
    const timer = setInterval(() => {
      i++;
      setUserText((prev) => ({ ...prev, 0: msg.slice(0, i) }));
      if (i >= msg.length) {
        clearInterval(timer);
        setTimeout(() => setPhase(1), 400);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [demoStarted, phase]);

  // Stream first bot response
  useEffect(() => {
    if (phase !== 1) return;
    const lines = botResponses[0];
    let idx = 0;
    const timer = setInterval(() => {
      setBotVisible((prev) => ({ ...prev, 0: [...prev[0], idx] }));
      idx++;
      if (idx >= lines.length) {
        clearInterval(timer);
        setBotDone((prev) => ({ ...prev, 0: true }));
        setTimeout(() => setPhase(2), 1200);
      }
    }, 350);
    return () => clearInterval(timer);
  }, [phase]);

  // Type second user message
  useEffect(() => {
    if (phase !== 2) return;
    let i = 0;
    const msg = userMessages[1];
    const timer = setInterval(() => {
      i++;
      setUserText((prev) => ({ ...prev, 1: msg.slice(0, i) }));
      if (i >= msg.length) {
        clearInterval(timer);
        setTimeout(() => setPhase(3), 400);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [phase]);

  // Stream second bot response
  useEffect(() => {
    if (phase !== 3) return;
    const lines = botResponses[1];
    let idx = 0;
    const timer = setInterval(() => {
      setBotVisible((prev) => ({ ...prev, 1: [...prev[1], idx] }));
      idx++;
      if (idx >= lines.length) {
        clearInterval(timer);
        setBotDone((prev) => ({ ...prev, 1: true }));
      }
    }, 500);
    return () => clearInterval(timer);
  }, [phase]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => scrollToBottom(), [userText, botVisible, phase, scrollToBottom]);

  const showCursor0 = phase === 0 && demoStarted;
  const showCursor1 = phase === 2;

  return (
    <section ref={sectionRef} className="rounded-[32px] border border-white/10 bg-gradient-to-r from-cyan-500/10 via-slate-900 to-indigo-500/10 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl md:p-10">
      <div className="mb-8 text-center" data-copilot-heading>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">AI Copilot</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Meet Your AI Audit Copilot
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300/80">
          Ask audit questions, draft procedures, summarize findings, and generate audit-ready content in seconds.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start" data-copilot-chat>
        {/* Left: Marketing copy */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-cyan-100">Natural Language Queries</h3>
            <p className="mt-2 text-xs text-slate-300/80 leading-relaxed">
              Ask audit questions in plain English. The copilot understands audit terminology and returns structured, reference-ready responses.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-cyan-100">Procedure & Document Generation</h3>
            <p className="mt-2 text-xs text-slate-300/80 leading-relaxed">
              Generate working papers, audit procedures, management letter points, and planning memos directly from natural language prompts.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-cyan-100">Context-Aware Responses</h3>
            <p className="mt-2 text-xs text-slate-300/80 leading-relaxed">
              The copilot tailors responses based on your engagement details, assessed risks, and financial analysis data.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-400/10 bg-amber-400/5 p-3 text-center text-[10px] text-amber-200/60">
            AI outputs require professional review.
          </div>
        </div>

        {/* Right: Chat mockup */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/30 backdrop-blur-sm">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-white/8 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">Audit Copilot</span>
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-400/15 px-2 py-0.5 text-[9px] text-green-300">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Online
              </span>
            </div>
          </div>

          {/* Chat messages */}
          <div ref={chatRef} className="flex h-[420px] flex-col gap-4 overflow-y-auto px-5 py-4 scroll-smooth">
            {/* Message 1: User */}
            {(demoStarted || userText[0].length > 0) && (
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-2.5 border border-cyan-400/10">
                  <p className="text-xs text-slate-100">
                    {userText[0]}
                    {showCursor0 && <span className={`ml-px inline-block h-3.5 w-[2px] bg-cyan-300 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />}
                  </p>
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/20">
                  <User className="h-3.5 w-3.5 text-cyan-200" />
                </div>
              </div>
            )}

            {/* Response 1: Bot */}
            {botVisible[0].length > 0 && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3">
                  <div className="space-y-1.5">
                    {botResponses[0].slice(0, botVisible[0].length + 1).map((line, i) => (
                      <p
                        key={i}
                        className={`text-xs text-slate-200/90 transition-opacity duration-300 ${botVisible[0].includes(i) ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <span className="text-cyan-400/60">{i + 1}.</span> {line}
                      </p>
                    ))}
                    {botDone[0] && (
                      <div className="flex items-center gap-1 pt-1 text-[9px] text-cyan-400/50">
                        <span className="h-1 w-1 rounded-full bg-cyan-400/50 animate-pulse" />
                        Generated
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Message 2: User */}
            {phase >= 2 && userText[1].length > 0 && (
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-4 py-2.5 border border-cyan-400/10">
                  <p className="text-xs text-slate-100">
                    {userText[1]}
                    {showCursor1 && <span className={`ml-px inline-block h-3.5 w-[2px] bg-cyan-300 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />}
                  </p>
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/20">
                  <User className="h-3.5 w-3.5 text-cyan-200" />
                </div>
              </div>
            )}

            {/* Response 2: Bot */}
            {botVisible[1].length > 0 && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3">
                  <div className="space-y-2">
                    {botResponses[1].slice(0, botVisible[1].length + 1).map((item, i) => (
                      <div
                        key={i}
                        className={`transition-opacity duration-300 ${botVisible[1].includes(i) ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300/80">{item.label}:</span>
                        <p className="mt-0.5 text-xs text-slate-200/90">{item.text}</p>
                      </div>
                    ))}
                    {botDone[1] && (
                      <div className="flex items-center gap-1 pt-1 text-[9px] text-cyan-400/50">
                        <span className="h-1 w-1 rounded-full bg-cyan-400/50 animate-pulse" />
                        Generated
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state before demo starts */}
            {!demoStarted && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <Bot className="mx-auto h-8 w-8 text-slate-600" />
                  <p className="mt-2 text-xs text-slate-500">Scroll to see the copilot in action</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="border-t border-white/8 px-5 py-3">
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:scale-[1.02] hover:shadow-cyan-400/30"
            >
              Launch Audit Console
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
