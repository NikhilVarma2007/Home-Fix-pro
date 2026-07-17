import { MapPinned, Navigation } from 'lucide-react';
import { useApp } from '../AppContext';
import { addOrUpdateAddress, getCurrentAddress, openGoogleMapsCurrentPin, openGoogleMapsPicker } from '../lib/location';
import type { Address } from '../types';

type LocationActionsProps = {
  selectedAddress?: Address | null;
  onAddressSelected?: (address: Address) => void;
  compact?: boolean;
};

export function LocationActions({ selectedAddress, onAddressSelected, compact = false }: LocationActionsProps) {
  const { state, dispatch } = useApp();

  const handleCurrentLocation = () => {
    getCurrentAddress(
      (address) => {
        if (state.user) {
          dispatch({ type: 'SET_USER', user: addOrUpdateAddress(state.user, address) });
        }
        onAddressSelected?.(address);
        openGoogleMapsCurrentPin(address);
        dispatch({ type: 'SHOW_TOAST', message: 'Current GPS location added.', toastType: 'success' });
      },
      (message) => dispatch({ type: 'SHOW_TOAST', message, toastType: 'error' }),
    );
  };

  const labelClass = compact ? 'hidden sm:inline' : '';

  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
      <button
        onClick={handleCurrentLocation}
        className="selected-glow flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-white tap-active-sm"
        style={{ background: '#10B981' }}
      >
        <Navigation size={17} />
        <span className={labelClass}>Use GPS</span>
      </button>
      <button
        onClick={() => openGoogleMapsPicker(selectedAddress?.full || state.authProfile?.serviceArea || 'Bangalore')}
        className="selected-glow flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-white tap-active-sm"
        style={{ background: '#2563EB' }}
      >
        <MapPinned size={17} />
        <span className={labelClass}>Pick in Maps</span>
      </button>
    </div>
  );
}
