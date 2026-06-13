import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Briefcase, ShieldCheck, Building2, GraduationCap, Users, ClipboardCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const audiences = [
  {
    icon: Briefcase,
    title: 'External Auditors',
    description:
      'Manage engagements, assess risks, and generate audit documentation faster.',
    accent: 'from-cyan-400 to-blue-500',
  },
  {
    icon: ShieldCheck,
    title: 'Internal Auditors',
    description:
      'Track risks, findings, controls, and remediation activities.',
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    icon: Building2,
    title: 'Risk & Compliance Professionals',
    description:
      'Visualize risk exposure and document risk responses.',
    accent: 'from-violet-400 to-purple-500',
  },
  {
    icon: Users,
    title: 'Accounting Firms',
    description:
      'Standardize audit workflows across multiple clients.',
    accent: 'from-rose-400 to-orange-500',
  },
  {
    icon: ClipboardCheck,
    title: 'Audit Managers',
    description:
      'Improve planning, supervision, and documentation quality.',
    accent: 'from-amber-400 to-orange-500',
  },
  {
    icon: GraduationCap,
    title: 'Audit Students & Trainees',
    description:
      'Learn structured audit workflows using guided AI assistance.',
    accent: 'from-sky-400 to-indigo-500',
  },
];

function AudienceCard({ audience, index }) {
  const cardRef = useRef(null);

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
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-400/5"
    >
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${audience.accent} shadow-lg`}>
        <audience.icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-sm font-semibold text-white">{audience.title}</h3>
      <p className="mt-2 text-xs text-slate-300/80 leading-relaxed">{audience.description}</p>
    </div>
  );
}

export default function WhoItsFor() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-who-heading]',
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
      <div className="mb-10 text-center" data-who-heading>
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">Target Audience</p>
        <h2 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
          Built for Modern Audit Teams
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300/80">
          Whether you&apos;re leading engagements, performing fieldwork, or learning audit methodologies, AuditIQ Pro provides structured AI-assisted support.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {audiences.map((audience, index) => (
          <AudienceCard key={audience.title} audience={audience} index={index} />
        ))}
      </div>
    </section>
  );
}
