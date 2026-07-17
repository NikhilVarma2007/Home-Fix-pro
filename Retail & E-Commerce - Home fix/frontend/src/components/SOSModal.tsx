import { X, Phone, MapPin } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../hooks/useToast';

export function SOSModal() {
  const { state, dispatch } = useApp();
  const toast = useToast();

  if (!state.showSOS) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => dispatch({ type: 'TOGGLE_SOS', show: false })}
      />
      <div
        className="relative w-full max-w-[430px] liquid-glass rounded-t-3xl p-6"
        style={{ animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Emergency Services</h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SOS', show: false })}
            className="tap-active p-1"
          >
            <X size={22} color="#94A3B8" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => toast.show('Emergency call feature coming soon', 'error')}
            className="w-full flex items-center gap-4 p-4 rounded-xl tap-active"
            style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.3)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#DC2626' }}>
              <Phone size={18} color="white" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Call Emergency</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Connect to emergency helpline</p>
            </div>
          </button>

          <button
            onClick={() => {
              dispatch({ type: 'TOGGLE_SOS', show: false });
              dispatch({ type: 'SET_SELECTED_CATEGORY', categoryId: 'plumbing' });
              dispatch({ type: 'NAVIGATE', view: 'explore' });
            }}
            className="w-full flex items-center gap-4 p-4 rounded-xl card-surface tap-active"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(6, 182, 212, 0.2)' }}>
              <MapPin size={18} color="#06B6D4" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Nearby 24/7 Services</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Find emergency plumbers & electricians</p>
            </div>
          </button>

          <button
            onClick={() => dispatch({ type: 'TOGGLE_SOS', show: false })}
            className="w-full py-3 text-center text-sm font-medium tap-active"
            style={{ color: '#64748B' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
