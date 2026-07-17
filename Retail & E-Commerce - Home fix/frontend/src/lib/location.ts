import type { Address, User } from '../types';

export function openGoogleMapsPicker(query = 'Bangalore') {
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    '_blank',
    'noopener,noreferrer',
  );
}

export function openGoogleMapsCurrentPin(address: Address) {
  openGoogleMapsPicker(`${address.lat},${address.lng}`);
}

export function openGoogleMapsDirections(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  window.open(
    `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`,
    '_blank',
    'noopener,noreferrer',
  );
}

export function getCurrentAddress(
  onSuccess: (address: Address) => void,
  onError: (message: string) => void,
) {
  if (!navigator.geolocation) {
    onError('GPS is not available on this device.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      onSuccess({
        id: 'addr-current',
        label: 'Current GPS',
        full: `Current location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        lat,
        lng,
      });
    },
    (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? 'Please allow location access to use GPS.'
        : error.code === error.TIMEOUT
          ? 'GPS timed out. Move near a window and try again.'
          : 'Unable to find current GPS location.';
      onError(message);
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 },
  );
}

export function addOrUpdateAddress(user: User, address: Address): User {
  return {
    ...user,
    addresses: [address, ...user.addresses.filter((item) => item.id !== address.id)],
  };
}
