import { useEffect } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useLenis() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // Lenis gives the landing page physics-based smooth scrolling.
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8
    });

    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    // Keep ScrollTrigger in sync with Lenis updates.
    lenis.on('scroll', () => ScrollTrigger.update());

    ScrollTrigger.refresh();

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, []);
}
