import { useState, useRef, useMemo } from 'react';
import { Search, Star, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../AppContext';
import { useScrollVelocitySkew } from '../hooks/useScrollVelocitySkew';
import { allServices } from '../data';
import { OfferFrame } from '../components/OfferFrame';
import { ReferralStrip } from '../components/ReferralStrip';
import { LocationActions } from '../components/LocationActions';

const exploreCategories = [
  { id: null, key: 'all' },
  { id: 'tailoring', key: 'tailoring' },
  { id: 'laundry', key: 'laundry' },
  { id: 'plumbing', key: 'plumbing' },
  { id: 'electrical', key: 'electrical' },
  { id: 'carpentry', key: 'carpentry' },
  { id: 'daily-labour', key: 'dailyLabour' },
  { id: 'construction-labour', key: 'constructionLabour' },
  { id: 'cleaning', key: 'cleaning' },
  { id: 'ac-repair', key: 'acRepair' },
  { id: 'painting', key: 'painting' },
  { id: 'appliance-repair', key: 'applianceRepair' },
  { id: 'pest-control', key: 'pestControl' },
];

const categoryLabelFallbacks: Record<string, string> = {
  all: 'All',
  tailoring: 'Tailoring',
  laundry: 'Laundry',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  carpentry: 'Carpentry',
  dailyLabour: 'One Day Workers',
  constructionLabour: 'Construction Labour',
  cleaning: 'Cleaning',
  acRepair: 'AC Repair',
  painting: 'Painting',
  applianceRepair: 'Appliance Repair',
  pestControl: 'Pest Control',
};

const filterChips = [
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating-4', label: 'Rating 4+' },
  { id: 'available', label: 'Available Today' },
];

const exploreText = {
  en: {
    title: 'Explore Services',
    search: 'Search for services, professionals...',
    all: 'All',
    tailoring: 'Tailoring',
    laundry: 'Laundry',
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    carpentry: 'Carpentry',
    dailyLabour: 'One Day Workers',
    constructionLabour: 'Construction Labour',
    book: 'Book Now',
    empty: 'No professionals found',
    emptyHint: 'Try adjusting your filters',
  },
  hi: {
    title: 'सेवाएं खोजें',
    search: 'सेवा या प्रोफेशनल खोजें...',
    all: 'सभी',
    tailoring: 'टेलर',
    laundry: 'लॉन्ड्री',
    plumbing: 'प्लंबर',
    electrical: 'इलेक्ट्रीशियन',
    carpentry: 'कारपेंटर',
    dailyLabour: 'एक दिन मजदूर',
    constructionLabour: 'निर्माण मजदूर',
    book: 'बुक करें',
    empty: 'कोई प्रोफेशनल नहीं मिला',
    emptyHint: 'फिल्टर बदलकर देखें',
  },
  te: {
    title: 'సేవలు చూడండి',
    search: 'సేవలు లేదా ప్రొఫెషనల్స్ వెతకండి...',
    all: 'అన్నీ',
    tailoring: 'టైలర్',
    laundry: 'లాండ్రీ',
    plumbing: 'ప్లంబర్',
    electrical: 'ఎలక్ట్రిషియన్',
    carpentry: 'కార్పెంటర్',
    dailyLabour: 'ఒక రోజు వర్కర్',
    constructionLabour: 'కన్స్ట్రక్షన్ లేబర్',
    book: 'బుక్ చేయండి',
    empty: 'ప్రొఫెషనల్స్ దొరకలేదు',
    emptyHint: 'ఫిల్టర్లు మార్చి చూడండి',
  },
};

export function Explore() {
  const { state, navigate } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollVelocitySkew(scrollRef);
  const [activeCategory, setActiveCategory] = useState<string | null>(state.selectedCategory);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState(state.searchQuery);
  const t = exploreText[state.authProfile?.language || 'en'];

  const filteredPros = useMemo(() => {
    let pros = [...state.professionals];

    if (activeCategory) {
      pros = pros.filter(p => p.category === activeCategory);
    }

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      pros = pros.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.services.some(s => s.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }

    if (activeFilter === 'rating-4') {
      pros = pros.filter(p => p.rating >= 4);
    }
    if (activeFilter === 'available') {
      pros = pros.filter(p => p.availability === 'Available today');
    }
    if (activeFilter === 'price-low') {
      pros.sort((a, b) => {
        const aMin = parseInt(a.priceRange.replace(/[^0-9]/g, '').slice(0, 3)) || 0;
        const bMin = parseInt(b.priceRange.replace(/[^0-9]/g, '').slice(0, 3)) || 0;
        return aMin - bMin;
      });
    }
    if (activeFilter === 'price-high') {
      pros.sort((a, b) => {
        const aMax = parseInt(a.priceRange.replace(/[^0-9]/g, '').slice(-3)) || 0;
        const bMax = parseInt(b.priceRange.replace(/[^0-9]/g, '').slice(-3)) || 0;
        return bMax - aMax;
      });
    }

    return pros;
  }, [state.professionals, activeCategory, searchText, activeFilter]);

  return (
    <div ref={scrollRef} className="scroll-frame pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0, 2, 18, 0.85)', backdropFilter: 'blur(16px)' }}>
        <h1 className="text-xl font-bold text-white">{t.title}</h1>
        <button className="tap-active p-1">
          <SlidersHorizontal size={20} color="#94A3B8" />
        </button>
      </div>

      <div data-skew className="px-4 pt-2 space-y-4">
        {/* Search Bar */}
        <div
          className="w-full h-12 rounded-xl flex items-center gap-3 px-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search size={18} color="#64748B" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t.search}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#64748B] outline-none"
            autoFocus
          />
        </div>

        <OfferFrame />

        <LocationActions compact selectedAddress={state.user?.addresses[0]} />

        <ReferralStrip
          title="Top referrals this week"
          professionals={state.professionals}
          ctaLabel="Book now"
        />

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {exploreCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.id)}
              data-active={activeCategory === cat.id}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium tap-active-sm"
              style={{
                background: activeCategory === cat.id ? 'rgba(255, 107, 91, 0.15)' : 'transparent',
                color: activeCategory === cat.id ? '#FF6B5B' : '#94A3B8',
                border: `1px solid ${activeCategory === cat.id ? 'rgba(255, 107, 91, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
              }}
            >
              {t[cat.key as keyof typeof t] || categoryLabelFallbacks[cat.key]}
            </button>
          ))}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(activeFilter === chip.id ? null : chip.id)}
              data-active={activeFilter === chip.id}
              className="flex-shrink-0 px-3 py-1.5 rounded-2xl text-[11px] font-medium tap-active-sm"
              style={{
                background: activeFilter === chip.id ? 'rgba(255, 107, 91, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                color: activeFilter === chip.id ? '#FF6B5B' : '#94A3B8',
                border: `1px solid ${activeFilter === chip.id ? 'rgba(255, 107, 91, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Professional Cards */}
        {filteredPros.length > 0 ? (
          <div className="space-y-4">
            {filteredPros.map((pro) => {
              const proServices = allServices.filter(s => pro.services.includes(s.id)).slice(0, 2);
              return (
                <div
                  key={pro.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <button
                    onClick={() => navigate('proprofile', { professionalId: pro.id })}
                    className="w-full p-4 flex gap-3 text-left"
                  >
                    <div className="flex-shrink-0">
                      <img src={pro.avatar} alt={pro.name} className="w-16 h-16 rounded-full object-cover" style={{ border: '2px solid rgba(255,255,255,0.08)' }} />
                      <div
                        className="mt-1.5 text-center text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                        style={{
                          background: pro.tier === 'platinum' ? 'rgba(192,192,192,0.2)' : pro.tier === 'gold' ? 'rgba(255,217,61,0.15)' : 'rgba(205,127,50,0.15)',
                          color: pro.tier === 'platinum' ? '#C0C0C0' : pro.tier === 'gold' ? '#FFD93D' : '#CD7F32',
                        }}
                      >
                        {pro.tier}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-semibold text-white">{pro.name}</h3>
                          {pro.verified && (
                            <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#4ECDC4' }}>
                              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] flex-shrink-0" style={{ color: '#64748B' }}>{pro.distance}</span>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        {proServices.map(s => (
                          <span key={s.id} className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', color: '#94A3B8' }}>
                            {s.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star size={11} color="#FFD93D" fill="#FFD93D" />
                        <span className="text-xs text-white font-medium">{pro.rating}</span>
                        <span className="text-[10px]" style={{ color: '#64748B' }}>({pro.reviewCount})</span>
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: '#64748B' }}>{pro.experience} yrs exp &bull; {pro.location}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#FF6B5B' }}>From {pro.priceRange}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: pro.availability === 'Available today' ? '#10B981' : '#64748B' }} />
                          <span className="text-[10px]" style={{ color: pro.availability === 'Available today' ? '#10B981' : '#64748B' }}>{pro.availability}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => navigate('bookingflow', { professionalId: pro.id })}
                      className="w-full py-2 rounded-lg text-xs font-semibold text-white tap-active-sm"
                      style={{ background: '#FF6B5B', boxShadow: '0 2px 12px rgba(255, 107, 91, 0.3)' }}
                    >
                      {t.book}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Search size={48} color="#64748B" />
            <p className="text-base font-semibold mt-4" style={{ color: '#94A3B8' }}>{t.empty}</p>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>{t.emptyHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
