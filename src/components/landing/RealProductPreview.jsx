import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Camera, X, Maximize2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const previews = [
  {
    title: 'Dashboard',
    description: 'Central audit workspace with risk stats, project status, and quick actions.',
    gradient: 'from-cyan-600/30 via-blue-600/20 to-indigo-600/30',
    gradientBg: 'from-cyan-500/15 via-blue-500/10 to-indigo-500/15',
    accent: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
    image: '/screenshots/dashboard.png',
  },
  {
    title: 'Audit Projects',
    description: 'Manage engagements, track progress, and access project-level audit data.',
    gradient: 'from-violet-600/30 via-purple-600/20 to-pink-600/30',
    gradientBg: 'from-violet-500/15 via-purple-500/10 to-pink-500/15',
    accent: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
    image: '/screenshots/Audit projects.png',
  },
  {
    title: 'Risk Assessment',
    description: 'ISA 315-aligned risk heatmap with inherent and residual risk scoring.',
    gradient: 'from-emerald-600/30 via-teal-600/20 to-cyan-600/30',
    gradientBg: 'from-emerald-500/15 via-teal-500/10 to-cyan-500/15',
    accent: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    image: '/screenshots/risk assessment.png',
  },
  {
    title: 'Financial Analyzer',
    description: 'Automated ratio analysis, trend detection, and anomaly flagging.',
    gradient: 'from-rose-600/30 via-orange-600/20 to-amber-600/30',
    gradientBg: 'from-rose-500/15 via-orange-500/10 to-amber-500/15',
    accent: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    images: ['/screenshots/Financial analyser 1.png', '/screenshots/Financial analyser 2.png'],
  },
  {
    title: 'AI Copilot',
    description: 'Natural language Q&A for audit procedures, risks, and framework guidance.',
    gradient: 'from-sky-600/30 via-blue-600/20 to-indigo-600/30',
    gradientBg: 'from-sky-500/15 via-blue-500/10 to-indigo-500/15',
    accent: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    image: '/screenshots/AI copilot.png',
  },
  {
    title: 'Planning Memo Generator',
    description: 'AI-drafted planning memos with engagement scope, risks, and team details.',
    gradient: 'from-teal-600/30 via-cyan-600/20 to-blue-600/30',
    gradientBg: 'from-teal-500/15 via-cyan-500/10 to-blue-500/15',
    accent: 'border-teal-400/30 bg-teal-400/10 text-teal-200',
    image: '/screenshots/Planning memo.png',
  },
];

function Skeleton() {
  return (
    <div className="absolute inset-0 animate-pulse rounded-xl bg-white/5" />
  );
}

function MediaContent({ preview }) {
  if (preview.images) {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-1">
        {preview.images.map((src, i) => (
          <SingleImage key={i} src={src} alt={`${preview.title} ${i + 1}`} />
        ))}
      </div>
    );
  }

  if (preview.image) {
    return <SingleImage src={preview.image} alt={preview.title} />;
  }

  return <PlaceholderImage gradient={preview.gradient} gradientBg={preview.gradientBg} />;
}

function SingleImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <div className="relative h-full w-full">
      {!loaded && <Skeleton />}
      <img
        src={src}
        alt={alt}
        className={`h-full w-full rounded-lg object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}

function ModalMedia({ preview }) {
  if (preview.images) {
    return (
      <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-slate-800 p-1">
        {preview.images.map((src, i) => (
          <ModalSingleImage key={i} src={src} alt={`${preview.title} ${i + 1}`} />
        ))}
      </div>
    );
  }

  if (preview.image) {
    return <ModalSingleImage src={preview.image} alt={preview.title} />;
  }

  return (
    <div className={`aspect-video w-full rounded-xl bg-gradient-to-br ${preview.gradientBg} flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-3">
        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border bg-white/5 backdrop-blur-sm ${preview.gradient}`}>
          <Camera className="h-9 w-9 text-white/60" />
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-wider text-slate-400/80">
          Screenshot Coming Soon
        </span>
      </div>
    </div>
  );
}

function ModalSingleImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="aspect-video w-full rounded-lg bg-slate-700 flex items-center justify-center">
        <Camera className="h-8 w-8 text-slate-500" />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-lg bg-slate-800 flex items-center justify-center">
      {!loaded && <Skeleton />}
      <img
        src={src}
        alt={alt}
        className={`max-h-full max-w-full rounded-lg object-contain transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

function PlaceholderImage({ gradient, gradientBg }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br ${gradientBg}`}>
      {!loaded && <Skeleton />}
      <div className={`flex flex-col items-center gap-3 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border bg-white/5 backdrop-blur-sm ${gradient}`}>
          <Camera className="h-7 w-7 text-white/60" />
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400/80">
          Screenshot Coming Soon
        </span>
      </div>
    </div>
  );
}

function PreviewModal({ preview, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-slate-300 shadow-lg transition hover:bg-slate-700 hover:text-white"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-1">
          <ModalMedia preview={preview} />
        </div>

        <div className="px-6 py-4 border-t border-white/8">
          <h3 className="text-sm font-semibold text-white">{preview.title}</h3>
          <p className="mt-1 text-xs text-slate-400/80">{preview.description}</p>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ preview, index }) {
  const cardRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: index * 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [index]);

  return (
    <>
      <div
        ref={cardRef}
        className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/50 p-3 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-400/5"
        onClick={() => setModalOpen(true)}
      >
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <MediaContent preview={preview} />

          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl">
            <Maximize2 className="h-5 w-5 text-white" />
            <span className="text-xs font-medium text-white">Preview</span>
          </div>
        </div>

        <div className="mt-3 px-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-white">{preview.title}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider ${preview.accent}`}>
              Preview
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400/70 leading-relaxed">{preview.description}</p>
        </div>
      </div>

      {modalOpen && (
        <PreviewModal preview={preview} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

export default function RealProductPreview() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-rpp-heading]',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef}>
      <div className="mb-10 text-center" data-rpp-heading>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Product Preview</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          See the Actual Audit Workspace
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300/80">
          AuditIQ Pro combines engagement management, risk assessment, AI generation, and audit intelligence in one integrated platform.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {previews.map((preview, index) => (
          <PreviewCard key={preview.title} preview={preview} index={index} />
        ))}
      </div>
    </section>
  );
}
