import { useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Bell, Search, Star, Shield, Lock, CreditCard } from 'lucide-react';
import { useApp } from '../AppContext';
import { useScrollVelocitySkew } from '../hooks/useScrollVelocitySkew';
import gsap from '../lib/miniGsap';
import { OfferFrame } from '../components/OfferFrame';
import { ReferralStrip } from '../components/ReferralStrip';
import { LocationActions } from '../components/LocationActions';

const categoryIcons: Record<string, string> = {
  tailoring: '\u2702',
  laundry: '\ud83e\uddfc',
  plumbing: '\ud83d\udd28',
  electrical: '\u26a1',
  carpentry: '\ud83d\udd28',
  'daily-labour': '\ud83d\udcbc',
  'construction-labour': '\ud83d\udc77',
  cleaning: '\ud83e\uddf9',
  'ac-repair': '\u2744',
  painting: '\ud83c\udfa8',
  'appliance-repair': '\ud83d\udd0c',
  'pest-control': '\ud83d\udc1e',
};

const categoryNames: Record<string, string> = {
  tailoring: 'Tailoring',
  laundry: 'Laundry',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  carpentry: 'Carpentry',
  'daily-labour': 'One Day Workers',
  'construction-labour': 'Construction Labour',
  cleaning: 'Cleaning',
  'ac-repair': 'AC Repair',
  painting: 'Painting',
  'appliance-repair': 'Appliance Repair',
  'pest-control': 'Pest Control',
};

const categoryColors: Record<string, string> = {
  tailoring: '#FF6B5B',
  laundry: '#3B82F6',
  plumbing: '#06B6D4',
  electrical: '#F59E0B',
  carpentry: '#8B5CF6',
  'daily-labour': '#10B981',
  'construction-labour': '#F97316',
  cleaning: '#10B981',
  'ac-repair': '#06B6D4',
  painting: '#F97316',
  'appliance-repair': '#6366F1',
  'pest-control': '#84CC16',
};

const categoryImages: Record<string, string> = {
  tailoring: '/images/service-tailoring.jpg',
  laundry: '/images/service-laundry.jpg',
  plumbing: '/images/service-plumbing.jpg',
  electrical: '/images/service-electrical.jpg',
  carpentry: '/images/service-carpentry.jpg',
  'daily-labour': '/images/service-daily-labour.jpg',
  'construction-labour': '/images/service-construction-labour.jpg',
  cleaning: '/images/service-cleaning.jpg',
  'ac-repair': '/images/service-ac-repair.jpg',
  painting: '/images/service-painting.jpg',
  'appliance-repair': '/images/service-appliance-repair.jpg',
  'pest-control': '/images/service-pest-control.jpg',
};

const trustItems = [
  { icon: Shield, label: 'Verified Pros' },
  { icon: Lock, label: 'Insurance Cover' },
  { icon: CreditCard, label: 'Secure Pay' },
];

export function Home() {
  const { state, navigate, dispatch } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  useScrollVelocitySkew(scrollRef);

  const featuredPros = [...state.professionals]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 10);
  const activeBookings = state.bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).slice(0, 2);

  useEffect(() => {
    if (heroRef.current && state.isLaunchAnimationComplete) {
      gsap.fromTo(
        heroRef.current,
        { rotateX: 15, rotateY: -10, y: 50, opacity: 0 },
        { rotateX: 0, rotateY: 0, y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.2 }
      );
    }
  }, [state.isLaunchAnimationComplete]);

  return (
    <div ref={scrollRef} className="scroll-frame pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0, 2, 18, 0.85)', backdropFilter: 'blur(16px)' }}>
        <button className="flex min-w-0 items-center gap-1.5 px-3 py-1.5 rounded-full tap-active" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <MapPin size={14} color="#FF6B5B" />
          <span className="truncate text-xs font-medium" style={{ color: '#94A3B8' }}>{state.user?.addresses[0]?.label || 'Select location'}</span>
          <ChevronDown size={12} color="#64748B" />
        </button>
        <button className="relative tap-active p-1">
          <Bell size={22} color="#94A3B8" />
          <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>

      <div data-skew className="px-4 pt-2 space-y-6">
        {/* Search Bar */}
        <button
          onClick={() => { dispatch({ type: 'SET_SEARCH_QUERY', query: '' }); navigate('explore'); }}
          className="w-full h-12 rounded-xl flex items-center gap-3 px-4 tap-active text-left"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search size={18} color="#64748B" />
          <span className="text-sm" style={{ color: '#64748B' }}>Search for services, professionals...</span>
        </button>

        <OfferFrame />

        <LocationActions compact selectedAddress={state.user?.addresses[0]} />

        {/* Hero Banner */}
        <div
          ref={heroRef}
          className="relative w-full h-[200px] rounded-2xl overflow-hidden"
          style={{
            perspective: '800px',
            transformStyle: 'preserve-3d',
            opacity: state.isLaunchAnimationComplete ? 1 : 0,
          }}
        >
          <img
            src="/images/hero-banner.jpg"
            alt="Summer Special"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,2,18,0) 0%, rgba(0,2,18,0.85) 100%)' }} />
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md" style={{ background: 'rgba(255, 217, 61, 0.15)' }}>
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#FFD93D' }}>Summer Special</span>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-semibold text-base" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              20% OFF on all Saree Stitching
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Book before July 15</p>
          </div>
        </div>

        {/* Categories Grid */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Services</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Object.entries(categoryNames).slice(0, 12).map(([id, name]) => (
              <button
                key={id}
                onClick={() => {
                  dispatch({ type: 'SET_SELECTED_CATEGORY', categoryId: id });
                  navigate('explore');
                }}
                data-active={state.selectedCategory === id}
                className="flex min-h-[128px] flex-col items-center justify-between gap-2 rounded-2xl p-2 tap-active-sm"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <img
                  src={categoryImages[id]}
                  alt={name}
                  className="h-20 w-full rounded-xl object-cover"
                  style={{ border: `1px solid ${categoryColors[id] || '#FF6B5B'}44` }}
                />
                <span className="flex items-center gap-1 text-center text-[10px] font-semibold leading-tight" style={{ color: '#DCE6F2' }}>
                  <span aria-hidden="true">{categoryIcons[id]}</span>
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Kinetic Typography Divider */}
        <div className="relative overflow-hidden py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex whitespace-nowrap" style={{ animation: 'none' }}>
            <KineticText />
          </div>
        </div>

        {/* Featured Professionals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Top Rated Near You</h2>
            <button onClick={() => navigate('explore')} className="text-xs font-medium tap-active" style={{ color: '#FF6B5B' }}>See All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">
            {featuredPros.map((pro) => (
              <button
                key={pro.id}
                onClick={() => navigate('proprofile', { professionalId: pro.id })}
                className="flex-shrink-0 w-[280px] rounded-2xl overflow-hidden text-left snap-start tap-active"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                }}
              >
                <div className="relative h-[140px]">
                  <img src={pro.avatar} alt={pro.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 30%, rgba(0,2,18,0.9) 100%)' }} />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                    style={{
                      background: pro.tier === 'platinum' ? 'rgba(192,192,192,0.2)' : pro.tier === 'gold' ? 'rgba(255,217,61,0.15)' : 'rgba(205,127,50,0.15)',
                      border: `1px solid ${pro.tier === 'platinum' ? 'rgba(192,192,192,0.4)' : pro.tier === 'gold' ? 'rgba(255,217,61,0.4)' : 'rgba(205,127,50,0.4)'}`,
                      color: pro.tier === 'platinum' ? '#C0C0C0' : pro.tier === 'gold' ? '#FFD93D' : '#CD7F32',
                    }}
                  >
                    {pro.tier}
                  </div>
                  {pro.verified && (
                    <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#4ECDC4' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white">{pro.name}</h3>
                  <div className="flex gap-1.5 mt-1.5">
                    {pro.services.slice(0, 2).map((s) => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}>
                        {s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={12} color="#FFD93D" fill="#FFD93D" />
                    <span className="text-xs text-white font-medium">{pro.rating}</span>
                    <span className="text-[10px]" style={{ color: '#64748B' }}>({pro.reviewCount})</span>
                  </div>
                  <p className="text-xs font-semibold mt-1.5" style={{ color: '#FF6B5B' }}>From {pro.priceRange}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: pro.availability === 'Available today' ? '#10B981' : '#64748B' }} />
                    <span className="text-[10px]" style={{ color: pro.availability === 'Available today' ? '#10B981' : '#64748B' }}>{pro.availability}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <ReferralStrip
          title="More booking referrals"
          professionals={state.professionals}
          ctaLabel="Explore"
        />

        {/* Recent Bookings */}
        {activeBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Ongoing Jobs</h2>
            <div className="space-y-3">
              {activeBookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => navigate('bookingdetail', { bookingId: booking.id })}
                  className="w-full p-4 rounded-xl text-left tap-active"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img src={booking.professionalAvatar} alt={booking.professionalName} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{booking.serviceName}</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>{booking.professionalName}</p>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{
                        background: booking.status === 'in_progress' ? 'rgba(78, 205, 196, 0.15)' : booking.status === 'confirmed' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: booking.status === 'in_progress' ? '#4ECDC4' : booking.status === 'confirmed' ? '#3B82F6' : '#F59E0B',
                      }}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => navigate('mybookings')} className="w-full mt-3 text-center text-xs font-medium tap-active" style={{ color: '#FF6B5B' }}>
              View All Bookings
            </button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex items-center justify-around p-3 rounded-xl" style={{ background: 'rgba(78, 205, 196, 0.05)' }}>
          {trustItems.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <item.icon size={18} color="#4ECDC4" />
              <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}

function KineticText() {
  const text = 'TAILORING • LAUNDRY • PLUMBING • ELECTRICAL • CARPENTRY • ONE DAY WORKERS • CONSTRUCTION LABOUR • CLEANING • AC REPAIR • PAINTING • APPLIANCES • PEST CONTROL • ';
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    
    const totalWidth = track.scrollWidth / 2;
    
    const tween = gsap.to(track, {
      x: -totalWidth,
      duration: 20,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: number) => x % totalWidth)
      }
    });

    return () => { tween.kill(); };
  }, []);

  return (
    <div ref={trackRef} className="flex whitespace-nowrap">
      {[0, 1].map((idx) => (
        <span key={idx} className="flex-shrink-0 pr-8">
          {text.split('').map((char, j) => (
            <span
              key={`${idx}-${j}`}
              className="inline-block font-display text-4xl font-bold tracking-tight"
              style={{
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255, 107, 91, 0.3)',
                letterSpacing: 0,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </span>
      ))}
    </div>
  );
}
