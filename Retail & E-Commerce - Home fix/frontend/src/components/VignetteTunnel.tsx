import { useRef, useEffect } from 'react';
import gsap from '../lib/miniGsap';

interface VignetteTunnelProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function VignetteTunnel({ isActive, onComplete, duration = 2 }: VignetteTunnelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const rings = ringsRef.current.filter(Boolean);
    const content = contentRef.current;

    gsap.set(rings, { scale: 1.5, opacity: 0, rotateZ: 0 });
    if (content) gsap.set(content, { opacity: 0, scale: 0.8 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (containerRef.current) containerRef.current.style.pointerEvents = 'none';
        if (onComplete) onComplete();
      },
    });

    tl.to(rings, {
      opacity: (i: number) => 0.2 + i * 0.1,
      scale: 1,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power2.out',
    });

    tl.to(rings, {
      rotateZ: 360,
      duration: duration || 2,
      ease: 'none',
      stagger: { each: 0.1, from: 'end' },
    }, 0.3);

    if (content) {
      tl.to(content, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.5);
    }

    tl.to(rings, {
      scale: 0,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.in',
      stagger: 0.05,
    }, (duration || 2) - 0.5);

    if (content) {
      tl.to(content, { opacity: 0, scale: 1.5, duration: 0.5, ease: 'power2.in' }, (duration || 2) - 0.4);
    }

    return () => { tl.kill(); };
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ pointerEvents: 'all' }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          ref={(el) => { if (el) ringsRef.current[i - 1] = el; }}
          className="absolute rounded-full"
          style={{
            width: `${120 - (i - 1) * 20}vw`,
            height: `${120 - (i - 1) * 20}vw`,
            border: '2px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 0 60px rgba(255, 107, 91, 0.08), 0 0 60px rgba(78, 205, 196, 0.04)',
          }}
        />
      ))}
      <div ref={contentRef} className="relative z-10 text-center">
        <img
          src="/images/homefix-pro-logo.svg"
          alt="HomeFix Pro"
          className="mx-auto h-44 w-72 object-contain"
          style={{ filter: 'drop-shadow(0 0 34px rgba(255,107,91,0.35))' }}
        />
        <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>One app for every home need</p>
      </div>
    </div>
  );
}
