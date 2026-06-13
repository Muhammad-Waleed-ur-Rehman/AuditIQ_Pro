import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initLandingAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Fade-in reveal for section headings and feature cards.
  gsap.utils.toArray('[data-reveal]').forEach((element, index) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay: index * 0.03,
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          once: true
        }
      }
    );
  });

  gsap.utils.toArray('.feature-card').forEach((card) => {
    gsap.fromTo(
      card,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          once: true
        }
      }
    );
  });

  return () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.killTweensOf('[data-reveal]');
  };
}
