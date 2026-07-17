import { useRef } from 'react';
import { ArrowLeft, MoreVertical, MessageCircle, Navigation } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../hooks/useToast';
import { useScrollVelocitySkew } from '../hooks/useScrollVelocitySkew';
import { updateBooking } from '../lib/api';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', label: 'Pending' },
  confirmed: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', label: 'Confirmed' },
  in_progress: { color: '#4ECDC4', bg: 'rgba(78, 205, 196, 0.1)', label: 'In Progress' },
  completed: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Completed' },
  cancelled: { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Cancelled' },
};

const progressSteps = [
  { key: 'booked', label: 'Booked' },
  { key: 'started', label: 'Started' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

export function BookingDetail() {
  const { state, goBack, navigate, dispatch } = useApp();
  const toast = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollVelocitySkew(scrollRef);

  const bookingId = state.navigationParams.bookingId;
  const booking = state.bookings.find(b => b.id === bookingId);

  if (!booking) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center">
        <p className="text-sm" style={{ color: '#94A3B8' }}>Booking not found</p>
        <button onClick={goBack} className="mt-2 rounded-xl px-4 py-2 text-sm font-semibold selected-glow" style={{ color: '#FF6B5B', border: '1px solid rgba(255,107,91,0.35)' }}>Go Back</button>
      </div>
    );
  }

  const cfg = statusConfig[booking.status];
  const pro = state.professionals.find(p => p.id === booking.professionalId);

  const getStepStatus = (stepKey: string) => {
    if (stepKey === 'booked') return true;
    if (booking.status === 'cancelled') return false;
    if (stepKey === 'started') return booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed';
    if (stepKey === 'in_progress') return booking.status === 'in_progress' || booking.status === 'completed';
    if (stepKey === 'completed') return booking.status === 'completed';
    return false;
  };

  const isCurrentStep = (stepKey: string) => {
    if (booking.status === 'in_progress' && stepKey === 'in_progress') return true;
    if (booking.status === 'confirmed' && stepKey === 'started') return true;
    if (booking.status === 'pending' && stepKey === 'booked') return true;
    return false;
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const cancelledBooking = { ...booking, status: 'cancelled' as const };
      dispatch({
        type: 'UPDATE_BOOKING',
        booking: cancelledBooking,
      });
      void updateBooking(cancelledBooking).catch(() => undefined);
      toast.show('Booking cancelled', 'error');
    }
  };

  return (
    <div ref={scrollRef} className="scroll-frame pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0, 2, 18, 0.85)', backdropFilter: 'blur(16px)' }}>
        <button onClick={goBack} className="selected-glow tap-active rounded-xl p-2">
          <ArrowLeft size={22} color="white" />
        </button>
        <h1 className="text-sm font-semibold text-white">Booking Details</h1>
        <button className="tap-active p-1">
          <MoreVertical size={18} color="#94A3B8" />
        </button>
      </div>

      <div data-skew>
        {/* Status Banner */}
        <div className="mx-4 mt-2 p-4 rounded-2xl" style={{ background: cfg.bg }}>
          <h2 className="text-lg font-bold capitalize" style={{ color: cfg.color }}>{cfg.label}</h2>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
            {booking.status === 'in_progress' ? 'Estimated completion: Today by 6 PM' : booking.status === 'confirmed' ? 'Professional will arrive at scheduled time' : booking.status === 'pending' ? 'Waiting for professional confirmation' : booking.status === 'completed' ? 'Service completed successfully' : 'This booking has been cancelled'}
          </p>
        </div>

        {/* Progress Tracker */}
        {booking.status !== 'cancelled' && (
          <div className="px-4 mt-6">
            <div className="flex items-center">
              {progressSteps.map((s, i) => {
                const done = getStepStatus(s.key);
                const current = isCurrentStep(s.key);
                return (
                  <div key={s.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: done ? '#4ECDC4' : current ? '#FF6B5B' : 'transparent',
                          border: `2px solid ${done ? '#4ECDC4' : current ? '#FF6B5B' : 'rgba(255,255,255,0.15)'}`,
                          boxShadow: current ? '0 0 0 0 rgba(255,107,91,0.4)' : 'none',
                          animation: current ? 'pulse-glow 1.5s infinite' : 'none',
                        }}
                      >
                        {done && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        {current && !done && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-[9px] mt-1 font-medium" style={{ color: done ? '#4ECDC4' : current ? '#FF6B5B' : '#64748B' }}>{s.label}</span>
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div className="flex-1 h-0.5 mx-1 mb-4" style={{ background: done ? '#4ECDC4' : 'rgba(255,255,255,0.08)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress Photos */}
        {booking.progressPhotos.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-white px-4">Progress Photos</h3>
            <div className="flex gap-3 overflow-x-auto mt-3 px-4 pb-1">
              {booking.progressPhotos.map((photo) => (
                <div key={photo.id} className="flex-shrink-0 w-[160px] rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={photo.image} alt={photo.caption} className="w-full h-[120px] object-cover" />
                  <div className="p-2">
                    <p className="text-[10px] font-semibold uppercase" style={{ color: '#FF6B5B' }}>{photo.stage}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>{photo.caption}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: '#64748B' }}>{photo.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Info */}
        <div className="px-4 mt-6">
          <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="text-sm font-semibold text-white">Service Details</h3>
            <div className="space-y-3 mt-3">
              <div>
                <span className="text-[10px]" style={{ color: '#64748B' }}>Service</span>
                <p className="text-sm text-white">{booking.serviceName}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: '#64748B' }}>Professional</span>
                <div className="flex items-center gap-1.5">
                  <img src={booking.professionalAvatar} alt={booking.professionalName} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs text-white">{booking.professionalName}</span>
                  {pro?.verified && (
                    <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ background: '#4ECDC4' }}>
                      <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px]" style={{ color: '#64748B' }}>Date & Time</span>
                <p className="text-sm text-white">{booking.scheduledDate} at {booking.scheduledTime}</p>
              </div>
              <div>
                <span className="text-[10px]" style={{ color: '#64748B' }}>Address</span>
                <p className="text-sm text-white">{booking.address.label} - {booking.address.full}</p>
              </div>
              {booking.notes && (
                <div>
                  <span className="text-[10px]" style={{ color: '#64748B' }}>Instructions</span>
                  <p className="text-sm text-white">{booking.notes}</p>
                </div>
              )}
            </div>

            <div className="h-px my-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

            <h3 className="text-sm font-semibold text-white">Payment</h3>
            <div className="mt-2">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#64748B' }}>Total Amount</span>
                <span className="text-sm font-bold text-white">\u20b9{booking.price}</span>
              </div>
              <div className="mt-2">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: booking.paymentStatus === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: booking.paymentStatus === 'completed' ? '#10B981' : '#3B82F6',
                  }}
                >
                  {booking.paymentStatus === 'completed' ? 'Paid' : 'Advance Paid'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 mt-6 space-y-3">
          <button
            onClick={() => {
              const destination = `${booking.address.lat},${booking.address.lng}`;
              window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank', 'noopener,noreferrer');
            }}
            className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tap-active-sm"
            style={{ background: '#3B82F6', color: 'white' }}
          >
            <Navigation size={14} /> Open in Google Maps
          </button>
          <button
            onClick={() => {
              const thread = state.chatThreads.find(t => t.professionalId === booking.professionalId);
              if (thread) {
                navigate('chatroom', { threadId: thread.id });
              } else {
                toast.show('Chat will be available after booking');
              }
            }}
            className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tap-active-sm"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
          >
            <MessageCircle size={14} /> Chat with Professional
          </button>
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <button
              onClick={handleCancel}
              className="w-full py-2 text-center text-xs font-medium tap-active"
              style={{ color: '#DC2626' }}
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
