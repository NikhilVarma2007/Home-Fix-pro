import { useRef, useEffect } from 'react';
import { ArrowLeft, Share2, Star, MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../hooks/useToast';
import { useScrollVelocitySkew } from '../hooks/useScrollVelocitySkew';
import { allServices } from '../data';
import gsap from '../lib/miniGsap';
import { OfferFrame } from '../components/OfferFrame';
import { ReferralStrip } from '../components/ReferralStrip';

export function ProProfile() {
  const { state, goBack, navigate } = useApp();
  const toast = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  useScrollVelocitySkew(scrollRef);

  const proId = state.navigationParams.professionalId || state.selectedProfessional;
  const pro = state.professionals.find(p => p.id === proId);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { rotateX: 10, y: 30, opacity: 0 },
        { rotateX: 0, y: 0, opacity: 1, duration: 1, ease: 'expo.out' }
      );
    }
  }, [proId]);

  if (!pro) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-sm" style={{ color: '#94A3B8' }}>Professional not found</p>
        <button onClick={goBack} className="mt-2 rounded-xl px-4 py-2 text-sm font-semibold selected-glow" style={{ color: '#FF6B5B', border: '1px solid rgba(255,107,91,0.35)' }}>Go Back</button>
      </div>
    );
  }

  const proServices = allServices.filter(s => pro.services.includes(s.id));
  const filledStars = Math.floor(pro.rating);

  return (
    <div ref={scrollRef} className="scroll-frame pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0, 2, 18, 0.85)', backdropFilter: 'blur(16px)' }}>
        <button onClick={goBack} className="selected-glow tap-active rounded-xl p-2">
          <ArrowLeft size={24} color="white" />
        </button>
        <h1 className="text-sm font-semibold text-white">Professional Profile</h1>
        <button onClick={() => toast.show('Share feature coming soon')} className="tap-active p-1">
          <Share2 size={18} color="#94A3B8" />
        </button>
      </div>

      <div data-skew>
        {/* Hero */}
        <div
          ref={heroRef}
          className="relative w-full h-[240px] mx-4 mt-2 rounded-2xl overflow-hidden"
          style={{ width: 'calc(100% - 32px)', perspective: '800px' }}
        >
          <img src={pro.avatar} alt={pro.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,2,18,0.1) 0%, rgba(0,2,18,0.9) 100%)' }} />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white font-display" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>{pro.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs capitalize px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>{pro.category}</span>
              <span
                className="text-[10px] capitalize px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: pro.tier === 'platinum' ? 'rgba(192,192,192,0.2)' : pro.tier === 'gold' ? 'rgba(255,217,61,0.15)' : 'rgba(205,127,50,0.15)',
                  color: pro.tier === 'platinum' ? '#C0C0C0' : pro.tier === 'gold' ? '#FFD93D' : '#CD7F32',
                }}
              >
                {pro.tier}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} color={i <= filledStars ? '#FFD93D' : '#64748B'} fill={i <= filledStars ? '#FFD93D' : 'none'} />
              ))}
              <span className="text-xs text-white font-medium ml-1">{pro.rating} ({pro.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 px-4 mt-4">
          <button
            onClick={() => navigate('bookingflow', { professionalId: pro.id })}
            className="flex-1 h-11 rounded-xl text-xs font-semibold text-white tap-active-sm"
            style={{ background: '#FF6B5B', boxShadow: '0 2px 12px rgba(255, 107, 91, 0.3)' }}
          >
            Book Now
          </button>
          <button
            onClick={() => {
              const thread = state.chatThreads.find(t => t.professionalId === pro.id);
              if (thread) {
                navigate('chatroom', { threadId: thread.id });
              } else {
                toast.show('Chat will be available after booking');
              }
            }}
            className="flex-1 h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 tap-active-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
          >
            <MessageCircle size={14} /> Chat
          </button>
          <button
            onClick={() => toast.show('Call feature coming soon')}
            className="flex-1 h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 tap-active-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
          >
            <Phone size={14} /> Call
          </button>
        </div>

        <div className="px-4 mt-4">
          <OfferFrame />
        </div>

        {/* About */}
        <div className="px-4 mt-6">
          <h3 className="text-base font-semibold text-white">About</h3>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: '#94A3B8' }}>{pro.about}</p>
          <div className="flex gap-4 mt-3">
            <span className="text-xs" style={{ color: '#64748B' }}>Experience: {pro.experience} years</span>
            <span className="text-xs" style={{ color: '#64748B' }}>&bull;</span>
            <span className="text-xs" style={{ color: '#64748B' }}>Jobs completed: 5000+</span>
          </div>
        </div>

        {/* Services */}
        <div className="px-4 mt-6">
          <h3 className="text-base font-semibold text-white">Services</h3>
          <div className="space-y-2 mt-3">
            {proServices.map((service) => (
              <button
                key={service.id}
                onClick={() => navigate('bookingflow', { professionalId: pro.id, serviceId: service.id })}
                className="w-full p-3.5 rounded-xl flex items-center justify-between text-left tap-active"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-sm text-white">{service.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: '#FF6B5B' }}>\u20b9{service.price}</span>
                  <span className="text-xs font-medium" style={{ color: '#FF6B5B' }}>Book</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        {pro.portfolio.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-white px-4">Portfolio</h3>
            <div className="flex gap-2 overflow-x-auto mt-3 px-4 pb-1">
              {pro.portfolio.map((img, i) => (
                <button key={i} className="flex-shrink-0 tap-active">
                  <img src={img} alt={`Portfolio ${i + 1}`} className="w-[120px] h-[120px] rounded-lg object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 mt-6">
          <ReferralStrip title="Similar trusted referrals" professionals={state.professionals.filter((professional) => professional.category === pro.category)} ctaLabel="Compare" />
        </div>

        {/* Reviews */}
        {pro.reviews.length > 0 && (
          <div className="px-4 mt-6">
            <h3 className="text-base font-semibold text-white">Reviews ({pro.reviewCount})</h3>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-3xl font-bold font-display" style={{ color: '#FFD93D' }}>{pro.rating}</span>
              <div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={14} color={i <= filledStars ? '#FFD93D' : '#64748B'} fill={i <= filledStars ? '#FFD93D' : 'none'} />
                  ))}
                </div>
                <span className="text-xs" style={{ color: '#64748B' }}>{pro.reviewCount} reviews</span>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {pro.reviews.slice(0, 3).map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: 'rgba(255,107,91,0.2)', color: '#FF6B5B' }}>
                        {review.userName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">{review.userName}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: '#64748B' }}>{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={10} color={i <= review.rating ? '#FFD93D' : '#64748B'} fill={i <= review.rating ? '#FFD93D' : 'none'} />
                    ))}
                  </div>
                  <p className="text-xs mt-2 leading-relaxed line-clamp-3" style={{ color: '#94A3B8' }}>{review.text}</p>
                  {review.beforeImage && review.afterImage && (
                    <div className="flex gap-2 mt-3">
                      <img src={review.beforeImage} alt="Before" className="w-20 h-20 rounded-lg object-cover" />
                      <img src={review.afterImage} alt="After" className="w-20 h-20 rounded-lg object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {pro.reviews.length > 3 && (
              <button className="w-full mt-3 text-center text-xs font-medium tap-active" style={{ color: '#FF6B5B' }}>
                See All Reviews
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
