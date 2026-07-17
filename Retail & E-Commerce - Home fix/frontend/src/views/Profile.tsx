import { useRef } from 'react';
import { Settings, Home, CreditCard, Heart, Bell, Globe, HelpCircle, Star, LogOut } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../hooks/useToast';
import { useScrollVelocitySkew } from '../hooks/useScrollVelocitySkew';
import { LocationActions } from '../components/LocationActions';

const menuItems = [
  { icon: Home, label: 'My Addresses', value: '3 saved' },
  { icon: CreditCard, label: 'Payment Methods', value: '2 cards' },
  { icon: Heart, label: 'Saved Professionals', value: '5 pros' },
  { icon: Bell, label: 'Notifications', value: null },
  { icon: Globe, label: 'Language', value: 'English' },
  { icon: HelpCircle, label: 'Help & Support', value: null },
  { icon: Star, label: 'Rate the App', value: null },
];

export function Profile() {
  const { state, logout } = useApp();
  const toast = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollVelocitySkew(scrollRef);

  const user = state.user;
  const bookingCount = state.bookings.length;
  const reviewCount = state.bookings.filter(b => b.status === 'completed').length;
  const addressCount = user?.addresses.length || 0;

  return (
    <div ref={scrollRef} className="scroll-frame pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0, 2, 18, 0.85)', backdropFilter: 'blur(16px)' }}>
        <h1 className="text-xl font-bold text-white">My Profile</h1>
        <button onClick={() => toast.show('Settings coming soon')} className="tap-active p-1">
          <Settings size={20} color="#94A3B8" />
        </button>
      </div>

      <div data-skew className="pt-2">
        {/* User Info */}
        <div className="flex flex-col items-center py-6">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-20 h-20 rounded-full object-cover"
            style={{ border: '3px solid rgba(255,255,255,0.1)' }}
          />
          <h2 className="text-lg font-semibold text-white mt-3">{user?.name}</h2>
          <p className="text-sm" style={{ color: '#94A3B8' }}>{user?.phone}</p>
          <button onClick={() => toast.show('Edit profile coming soon')} className="mt-2 text-xs font-medium tap-active" style={{ color: '#FF6B5B' }}>
            Edit Profile
          </button>
        </div>

        {/* Stats */}
        <div className="mx-4 p-4 rounded-xl flex items-center justify-around" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold" style={{ color: '#FF6B5B' }}>{bookingCount}</span>
            <span className="text-[10px]" style={{ color: '#64748B' }}>Bookings</span>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold" style={{ color: '#FF6B5B' }}>{reviewCount}</span>
            <span className="text-[10px]" style={{ color: '#64748B' }}>Reviews</span>
          </div>
          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold" style={{ color: '#FF6B5B' }}>{addressCount}</span>
            <span className="text-[10px]" style={{ color: '#64748B' }}>Addresses</span>
          </div>
        </div>

        {/* Menu List */}
        <div className="mt-6 px-4">
          <div className="mb-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="mb-3 text-xs font-semibold" style={{ color: '#94A3B8' }}>Location</p>
            <LocationActions selectedAddress={user?.addresses[0]} />
          </div>
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => toast.show(`${item.label} coming soon`)}
              className="w-full py-4 flex items-center gap-3 text-left tap-active"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <item.icon size={18} color="#94A3B8" />
              <span className="text-sm text-white flex-1">{item.label}</span>
              {item.value && <span className="text-xs" style={{ color: '#64748B' }}>{item.value}</span>}
            </button>
          ))}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
            className="w-full py-4 flex items-center gap-3 text-left tap-active"
          >
            <LogOut size={18} color="#DC2626" />
            <span className="text-sm font-medium" style={{ color: '#DC2626' }}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
