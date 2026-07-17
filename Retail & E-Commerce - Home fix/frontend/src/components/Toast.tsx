import { useApp } from '../AppContext';

export function Toast() {
  const { state } = useApp();
  if (!state.toast) return null;

  const borderColor = state.toast.type === 'success' ? '#4ECDC4' : state.toast.type === 'error' ? '#DC2626' : 'transparent';

  return (
    <div
      className="fixed top-4 left-4 right-4 z-[100] flex justify-center"
      style={{ animation: 'fadeInUp 0.3s ease-out' }}
    >
      <div
        className="liquid-glass px-4 py-3 rounded-xl max-w-[90%]"
        style={{ borderLeft: `3px solid ${borderColor}` }}
      >
        <p className="text-sm text-white font-medium">{state.toast.message}</p>
      </div>
    </div>
  );
}
