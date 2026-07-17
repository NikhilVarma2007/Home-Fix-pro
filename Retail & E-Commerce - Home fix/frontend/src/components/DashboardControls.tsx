import { MapPinned, Moon, Navigation, Sun } from 'lucide-react';
import { useApp } from '../AppContext';
import { addOrUpdateAddress, getCurrentAddress, openGoogleMapsCurrentPin, openGoogleMapsPicker } from '../lib/location';

export function DashboardControls() {
  const { state, dispatch } = useApp();
  const isDay = state.themeMode === 'day';

  const useCurrentLocation = () => {
    getCurrentAddress(
      (currentAddress) => {
        if (state.user) {
          dispatch({ type: 'SET_USER', user: addOrUpdateAddress(state.user, currentAddress) });
        }
        openGoogleMapsCurrentPin(currentAddress);
        dispatch({ type: 'SHOW_TOAST', message: 'Current GPS location added.', toastType: 'success' });
      },
      (message) => dispatch({ type: 'SHOW_TOAST', message, toastType: 'error' }),
    );
  };

  const openManualMap = () => {
    openGoogleMapsPicker(state.user?.addresses[0]?.full || state.authProfile?.serviceArea || 'Bangalore');
  };

  return (
    <div className="fixed right-3 top-3 z-[70] flex flex-col gap-2 sm:right-5 sm:top-5">
      <button
        onClick={() => dispatch({ type: 'SET_THEME_MODE', themeMode: isDay ? 'night' : 'day' })}
        aria-selected
        className="selected-glow flex h-11 w-11 items-center justify-center rounded-full text-white tap-active-sm sm:h-12 sm:w-12"
        style={{ background: isDay ? '#0F172A' : '#F59E0B' }}
        title={isDay ? 'Night vision' : 'Day vision'}
      >
        {isDay ? <Moon size={21} /> : <Sun size={21} />}
      </button>
      <button
        onClick={useCurrentLocation}
        className="selected-glow flex h-11 w-11 items-center justify-center rounded-full text-white tap-active-sm sm:h-12 sm:w-12"
        style={{ background: '#10B981' }}
        title="Use current GPS location"
      >
        <Navigation size={20} />
      </button>
      <button
        onClick={openManualMap}
        className="selected-glow flex h-11 w-11 items-center justify-center rounded-full text-white tap-active-sm sm:h-12 sm:w-12"
        style={{ background: '#2563EB' }}
        title="Select manually in Google Maps"
      >
        <MapPinned size={20} />
      </button>
    </div>
  );
}
