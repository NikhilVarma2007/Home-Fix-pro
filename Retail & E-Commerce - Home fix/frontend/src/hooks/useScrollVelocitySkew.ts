import { useEffect, useRef } from 'react';
import gsap from '../lib/miniGsap';

const SCROLL_THRESHOLD = 200;
const MAX_SKEW = 3;
const LERP_FACTOR = 0.1;

export function useScrollVelocitySkew(containerRef: React.RefObject<HTMLElement | null>) {
  const currentSkew = useRef(0);
  const targetSkew = useRef(0);
  const lastScrollY = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const skewableElements = container.querySelectorAll('[data-skew]');

    const update = () => {
      currentSkew.current += (targetSkew.current - currentSkew.current) * LERP_FACTOR;

      if (Math.abs(currentSkew.current) > 0.01) {
        skewableElements.forEach((el) => {
          (el as HTMLElement).style.transform = `skewY(${currentSkew.current}deg)`;
        });
      }

      targetSkew.current *= 0.9;

      if (Math.abs(targetSkew.current) < 0.01) {
        targetSkew.current = 0;
      }

      rafId.current = requestAnimationFrame(update);
    };

    const onScroll = () => {
      const scrollY = container.scrollTop;
      const velocity = scrollY - lastScrollY.current;
      lastScrollY.current = scrollY;

      if (Math.abs(velocity) > SCROLL_THRESHOLD / 4) {
        const skewAmount = (velocity / 1000) * MAX_SKEW;
        targetSkew.current = gsap.utils.clamp(-MAX_SKEW, MAX_SKEW, skewAmount);
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    rafId.current = requestAnimationFrame(update);

    return () => {
      container.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [containerRef]);
}
