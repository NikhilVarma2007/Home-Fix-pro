import { useState, useRef } from 'react';
import { SlidersHorizontal, ClipboardList } from 'lucide-react';
import { useApp } from '../AppContext';
import { useScrollVelocitySkew } from '../hooks/useScrollVelocitySkew';

const statusTabs = [
  { id: 'active', label: 'Active', statuses: ['pending', 'confirmed', 'in_progress'] },
  { id: 'completed', label: 'Completed', statuses: ['completed'] },
  { id: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
  { id: 'all', label: 'All', statuses: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', label: 'Pending' },
  confirmed: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Confirmed' },
  in_progress: { color: '#4ECDC4', bg: 'rgba(78, 205, 196, 0.15)', label: 'In Progress' },
  completed: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Completed' },
  cancelled: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Cancelled' },
};

export function MyBookings() {
  const { state, navigate } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollVelocitySkew(scrollRef);
  const [activeTab, setActiveTab] = useState('active');

  const currentTab = statusTabs.find(t => t.id === activeTab) || statusTabs[0];
  const filteredBookings = state.bookings.filter(b => currentTab.statuses.includes(b.status));

  return (
    <div ref={scrollRef} className="scroll-frame pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0, 2, 18, 0.85)', backdropFilter: 'blur(16px)' }}>
        <h1 className="text-xl font-bold text-white">My Bookings</h1>
        <button className="tap-active p-1">
          <SlidersHorizontal size={20} color="#94A3B8" />
        </button>
      </div>

      <div data-skew className="px-4 pt-2">
        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-active={activeTab === tab.id}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium tap-active-sm"
              style={{
                background: activeTab === tab.id ? 'rgba(255, 107, 91, 0.15)' : 'transparent',
                color: activeTab === tab.id ? '#FF6B5B' : '#94A3B8',
                border: `1px solid ${activeTab === tab.id ? 'rgba(255, 107, 91, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Booking Cards */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const cfg = statusConfig[booking.status];
              return (
                <button
                  key={booking.id}
                  onClick={() => navigate('bookingdetail', { bookingId: booking.id })}
                  className="w-full rounded-2xl overflow-hidden text-left tap-active"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
                  }}
                >
                  {/* Status strip */}
                  <div className="h-1" style={{ background: cfg.color }} />
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">{booking.serviceName}</h3>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <img src={booking.professionalAvatar} alt={booking.professionalName} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs" style={{ color: '#94A3B8' }}>{booking.professionalName}</span>
                      <span style={{ color: '#64748B' }}>&bull;</span>
                      <span className="text-[10px]" style={{ color: '#64748B' }}>{booking.scheduledDate} at {booking.scheduledTime}</span>
                    </div>
                    <p className="text-sm font-bold mt-2" style={{ color: '#FF6B5B' }}>\u20b9{booking.price}</p>

                    {/* Mini Progress Tracker for active bookings */}
                    {['pending', 'confirmed', 'in_progress'].includes(booking.status) && (
                      <div className="flex items-center mt-3 gap-1">
                        {[
                          { key: 'booked', label: 'Booked', done: true },
                          { key: 'started', label: 'Started', done: booking.status !== 'pending' },
                          { key: 'progress', label: 'In Progress', done: booking.status === 'in_progress' },
                          { key: 'completed', label: 'Done', done: false },
                        ].map((s, i, arr) => (
                          <div key={s.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center"
                                style={{
                                  background: s.done ? '#4ECDC4' : booking.status === 'in_progress' && s.key === 'progress' ? '#FF6B5B' : 'transparent',
                                  border: `2px solid ${s.done ? '#4ECDC4' : booking.status === 'in_progress' && s.key === 'progress' ? '#FF6B5B' : 'rgba(255,255,255,0.15)'}`,
                                }}
                              >
                                {s.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                {booking.status === 'in_progress' && s.key === 'progress' && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: 'pulse-glow 1.5s infinite' }} />
                                )}
                              </div>
                              <span className="text-[8px] mt-0.5" style={{ color: s.done ? '#4ECDC4' : '#64748B' }}>{s.label}</span>
                            </div>
                            {i < arr.length - 1 && (
                              <div className="flex-1 h-0.5 mx-0.5" style={{ background: s.done ? '#4ECDC4' : 'rgba(255,255,255,0.08)' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      {booking.status === 'in_progress' && (
                        <>
                          <span className="flex-1 py-1.5 rounded-lg text-[10px] font-medium text-center" style={{ border: '1px solid rgba(255,107,91,0.3)', color: '#FF6B5B' }}>Track</span>
                          <span className="flex-1 py-1.5 rounded-lg text-[10px] font-medium text-center" style={{ border: '1px solid rgba(78,205,196,0.3)', color: '#4ECDC4' }}>Chat</span>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <>
                          <span className="flex-1 py-1.5 rounded-lg text-[10px] font-medium text-center" style={{ border: '1px solid rgba(255,217,61,0.3)', color: '#FFD93D' }}>Rate</span>
                          <span className="flex-1 py-1.5 rounded-lg text-[10px] font-medium text-center" style={{ border: '1px solid rgba(255,107,91,0.3)', color: '#FF6B5B' }}>Rebook</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <ClipboardList size={48} color="#64748B" />
            <p className="text-base font-semibold mt-4" style={{ color: '#94A3B8' }}>No bookings yet</p>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>Book your first service now</p>
            <button
              onClick={() => navigate('explore')}
              className="mt-4 px-5 py-2.5 rounded-xl text-xs font-semibold text-white tap-active-sm"
              style={{ background: '#FF6B5B' }}
            >
              Explore Services
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
