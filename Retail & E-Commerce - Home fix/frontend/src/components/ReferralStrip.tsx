import { Star, ArrowRight } from 'lucide-react';
import type { Professional } from '../types';

interface ReferralStripProps {
  title: string;
  professionals: Professional[];
  ctaLabel?: string;
}

export function ReferralStrip({ title, professionals, ctaLabel = 'See more' }: ReferralStripProps) {
  return (
    <div className="card-surface rounded-3xl px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#94A3B8' }}>
            Referrals
          </p>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        <button className="text-xs font-medium flex items-center gap-1" style={{ color: '#FF6B5B' }}>
          {ctaLabel}
          <ArrowRight size={12} />
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {professionals.slice(0, 4).map((pro) => (
          <div key={pro.id} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <img src={pro.avatar} alt={pro.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{pro.name}</p>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: '#94A3B8' }}>
                  <Star size={10} color="#FFD93D" fill="#FFD93D" />
                  {pro.rating}
                  <span>·</span>
                  <span className="capitalize">{pro.category}</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed" style={{ color: '#64748B' }}>
              {pro.availability}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
