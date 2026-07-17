import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const offers = [
  {
    sector: 'Tailoring',
    title: '20% off premium blouse stitching',
    description: 'Fresh designs, fast turnaround, and free alterations this week.',
    badge: 'Hot offer',
    image: '/images/service-tailoring.jpg',
  },
  {
    sector: 'Laundry',
    title: 'Free pickup on wash and fold',
    description: 'Schedule before 6 PM and get same-day pickup in selected areas.',
    badge: 'Pickup bonus',
    image: '/images/service-laundry.jpg',
  },
  {
    sector: 'Plumbing',
    title: 'Emergency leak check at no extra visit fee',
    description: 'Book today and get a priority slot with verified local plumbers.',
    badge: 'Fast response',
    image: '/images/service-plumbing.jpg',
  },
  {
    sector: 'Electrical',
    title: 'Safety inspection included with wiring jobs',
    description: 'Keep your home secure with a no-cost check on selected installations.',
    badge: 'Safety first',
    image: '/images/service-electrical.jpg',
  },
  {
    sector: 'Carpentry',
    title: 'Free measurements with furniture repair',
    description: 'Get an on-site estimate and a finishing discount for larger projects.',
    badge: 'Woodwork deal',
    image: '/images/service-carpentry.jpg',
  },
  {
    sector: 'One Day Workers',
    title: 'Daily helper bookings from Rs 699',
    description: 'Get local support for shifting, loading, shop work, and errands.',
    badge: 'Day hire',
    image: '/images/service-daily-labour.jpg',
  },
  {
    sector: 'Construction Labour',
    title: 'Site teams available for urgent work',
    description: 'Book masons, helpers, tile support, and painting prep workers.',
    badge: 'Site ready',
    image: '/images/service-construction-labour.jpg',
  },
  {
    sector: 'Cleaning',
    title: 'Kitchen and bathroom deep clean bundle',
    description: 'Save on full-home cleaning with sofa, tiles, and move-in add-ons.',
    badge: 'Deep clean',
    image: '/images/service-cleaning.jpg',
  },
  {
    sector: 'AC Repair',
    title: 'Cooling check with every AC service',
    description: 'Filter cleaning, gas refill support, and installation slots near you.',
    badge: 'Cool deal',
    image: '/images/service-ac-repair.jpg',
  },
  {
    sector: 'Painting',
    title: 'Free wall inspection before painting',
    description: 'Get surface prep, texture, waterproofing, and color guidance.',
    badge: 'Color offer',
    image: '/images/service-painting.jpg',
  },
  {
    sector: 'Appliance Repair',
    title: 'Same-day diagnosis for home appliances',
    description: 'Washing machine, fridge, microwave, chimney, and kitchen repairs.',
    badge: 'Same day',
    image: '/images/service-appliance-repair.jpg',
  },
  {
    sector: 'Pest Control',
    title: 'Safe treatment plans for every room',
    description: 'Cockroach, termite, mosquito, and general pest control packages.',
    badge: 'Protected',
    image: '/images/service-pest-control.jpg',
  },
];

export function OfferFrame() {
  const [index, setIndex] = useState(0);
  const offer = offers[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % offers.length);
    }, 20000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="card-surface relative overflow-hidden rounded-3xl px-4 py-4"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03)), radial-gradient(circle at top left, rgba(255,107,91,0.25), transparent 55%)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} color="#FFD93D" />
          <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: '#94A3B8' }}>
            Live offers
          </p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(255,217,61,0.14)', color: '#FFD93D' }}>
          {offer.badge}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-[96px_1fr] gap-3">
        <img
          src={offer.image}
          alt={offer.sector}
          className="h-24 w-24 rounded-2xl object-cover"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.25em]" style={{ color: '#FF6B5B' }}>
            {offer.sector}
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">{offer.title}</h3>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
            {offer.description}
          </p>
        </div>
      </div>
      <button
        className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
        style={{ background: '#FF6B5B', color: 'white', boxShadow: '0 8px 24px rgba(255,107,91,0.25)' }}
      >
        Book now
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
