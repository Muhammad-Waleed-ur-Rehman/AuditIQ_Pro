import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What is AuditIQ Pro?',
    a: 'AuditIQ Pro is an AI-powered audit copilot that helps auditors manage engagements, assess risks, analyze financial data, generate audit documentation, and access audit knowledge in one workspace.',
  },
  {
    q: 'Does AuditIQ Pro replace auditors?',
    a: 'No. AuditIQ Pro assists auditors by improving productivity and documentation support. Professional judgment and auditor review remain essential.',
  },
  {
    q: 'What audit areas does it support?',
    a: 'It supports risk assessment, financial analysis, working papers, audit procedures, management letters, planning memos, audit checklists, and AI-assisted audit Q&A.',
  },
  {
    q: 'Is AI output final audit evidence?',
    a: 'No. AI-generated outputs are drafts and support materials only. They must be reviewed, verified, and approved by a qualified auditor.',
  },
  {
    q: 'What technology powers the app?',
    a: 'The app uses React, Supabase, PostgreSQL, Supabase Edge Functions, and Groq API.',
  },
  {
    q: 'Is user data protected?',
    a: 'The app uses Supabase Authentication and Row Level Security so users can access only their own audit projects and related records.',
  },
];

function AccordionItem({ faq, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors hover:border-white/15">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-100 transition-colors hover:text-cyan-100"
      >
        <span>{faq.q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-cyan-300' : ''
          }`}
        />
      </button>
      <div
        ref={contentRef}
        style={{ height }}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
      >
        <div className="border-t border-white/8 px-5 py-4 text-sm text-slate-300/80 leading-relaxed">
          {faq.a}
        </div>
      </div>
    </div>
  );
}

function AccordionGroup() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <AccordionItem
          key={i}
          faq={faq}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section>
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Support</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="mx-auto max-w-3xl">
        <AccordionGroup />
      </div>
    </section>
  );
}
