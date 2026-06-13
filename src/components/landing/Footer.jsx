import { ArrowUp, ExternalLink, Mail } from 'lucide-react';

function GithubIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const footerLinks = {
  quickLinks: [
    { label: 'Features', href: '#features' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'AI Copilot', href: '#ai-copilot' },
    { label: 'Login', href: '/login' },
  ],
  resources: [
    { label: 'Documentation', href: '#', external: true },
    { label: 'Privacy Policy', href: '#', external: true },
    { label: 'Terms of Use', href: '#', external: true },
  ],
  social: [
    { icon: GithubIcon, href: '#', label: 'GitHub' },
    { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hello@auditiqpro.com', label: 'Email' },
  ],
};

function BackToTop() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className="group fixed bottom-6 right-6 z-50 rounded-full border border-white/10 bg-white/6 p-3 text-cyan-100 shadow-lg shadow-black/30 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:shadow-cyan-400/10"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/80 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Footer() {
  return (
    <>
      <BackToTop />

      <footer className="relative border-t border-white/10 bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Section 1: Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                <span className="text-lg font-bold text-white">AuditIQ Pro</span>
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">AI-Powered Audit Copilot</p>
              <p className="mt-4 text-sm text-slate-300/80 leading-relaxed max-w-xs">
                Helping auditors assess risk, analyze financial data, generate documentation, and improve audit productivity with AI assistance.
              </p>
            </div>

            {/* Section 2: Quick Links */}
            <FooterColumn title="Quick Links">
              <ul className="space-y-3 text-sm">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-1.5 text-slate-300/80 transition-colors hover:text-cyan-100"
                    >
                      {link.label}
                      {link.href.startsWith('#') && (
                        <ArrowUp className="h-3 w-3 rotate-45 opacity-50" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Section 3: Resources */}
            <FooterColumn title="Resources">
              <ul className="space-y-3 text-sm">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-1.5 text-slate-300/80 transition-colors hover:text-cyan-100"
                    >
                      {link.label}
                      {link.external && <ExternalLink className="h-3 w-3 opacity-50" />}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Section 4: Connect */}
            <FooterColumn title="Connect">
              <div className="flex items-center gap-3">
                {footerLinks.social.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300/80 transition-all hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </FooterColumn>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-[11px] text-slate-400/80 leading-relaxed backdrop-blur-sm">
            AI-generated audit outputs are for assistance only and must be reviewed by a qualified auditor.
          </div>

          {/* Bottom bar */}
          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>&copy; 2026 AuditIQ Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
