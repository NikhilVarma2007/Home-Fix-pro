import { Home, Search, ClipboardList, MessageCircle, User } from 'lucide-react';
import { useApp } from '../AppContext';

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore', icon: Search },
  { id: 'mybookings', label: 'Bookings', icon: ClipboardList },
  { id: 'chatlist', label: 'Chat', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const { state, navigate } = useApp();

  const isTabActive = (tabId: string) => {
    const viewToTab: Record<string, string> = {
      home: 'home',
      explore: 'explore',
      proprofile: 'explore',
      bookingflow: 'explore',
      mybookings: 'mybookings',
      bookingdetail: 'mybookings',
      chatlist: 'chatlist',
      chatroom: 'chatlist',
      profile: 'profile',
    };
    return viewToTab[state.currentView] === tabId;
  };

  return (
    <>
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 liquid-glass-strong" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                data-active={active}
                className="flex h-full w-16 flex-col items-center justify-center gap-1 rounded-2xl tap-active relative"
              >
                {active && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{
                      background: '#FF6B5B',
                      boxShadow: '0 -2px 8px rgba(255, 107, 91, 0.4)',
                    }}
                  />
                )}
                <Icon
                  size={22}
                  color={active ? '#FF6B5B' : '#64748B'}
                  strokeWidth={active ? 2.5 : 1.5}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? '#FF6B5B' : '#64748B' }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
