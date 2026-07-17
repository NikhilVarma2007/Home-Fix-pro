import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, RouteStateSync, useApp } from './AppContext';
import { Toast } from './components/Toast';
import { BottomNav } from './components/BottomNav';
import { SOSModal } from './components/SOSModal';
import { VignetteTunnel } from './components/VignetteTunnel';
import { DashboardControls } from './components/DashboardControls';
import { AiSupportBubble } from './components/AiSupportBubble';
import { Login } from './views/Login';
import { Home } from './views/Home';
import { Explore } from './views/Explore';
import { ProProfile } from './views/ProProfile';
import { BookingFlow } from './views/BookingFlow';
import { MyBookings } from './views/MyBookings';
import { BookingDetail } from './views/BookingDetail';
import { ChatList } from './views/ChatList';
import { ChatRoom } from './views/ChatRoom';
import { Profile } from './views/Profile';
import { ServiceDashboard } from './views/ServiceDashboard';
import { AdminPanel } from './views/AdminPanel';
const tabViews = ['home', 'explore', 'mybookings', 'chatlist', 'profile'];

function CustomerDashboard() {
  const { state, dispatch } = useApp();
  const [showTunnel, setShowTunnel] = useState(!state.isLaunchAnimationComplete);

  useEffect(() => {
    if (!state.isLaunchAnimationComplete) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_LAUNCH_COMPLETE' });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.isLaunchAnimationComplete, dispatch]);

  const showNav = tabViews.includes(state.currentView);

  return (
    <div className="min-h-[100dvh] w-full relative scroll-frame app-frame-bg">
      <main className="min-h-[100dvh] w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/professionals/:professionalId" element={<ProProfile />} />
          <Route path="/professionals/:professionalId/book" element={<BookingFlow />} />
          <Route path="/book" element={<BookingFlow />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/bookings/:bookingId" element={<BookingDetail />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:threadId" element={<ChatRoom />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Toast />
      <SOSModal />

      {showTunnel && (
        <VignetteTunnel
          isActive={showTunnel}
          onComplete={() => setShowTunnel(false)}
          duration={2}
        />
      )}

      {showNav && <BottomNav />}
    </div>
  );
}

function AppGate() {
  const { state } = useApp();

  useEffect(() => {
    document.documentElement.dataset.theme = state.themeMode;
  }, [state.themeMode]);

  if (!state.isAuthenticated || state.currentView === 'login') {
    return (
      <>
        <Login />
        <Toast />
      </>
    );
  }

  if (state.authRole === 'service') {
    return (
      <>
        <DashboardControls />
        <ServiceDashboard />
        <Toast />
        <AiSupportBubble />
      </>
    );
  }

  if (state.authRole === 'admin') {
    return (
      <>
        <DashboardControls />
        <AdminPanel />
        <Toast />
        <AiSupportBubble />
      </>
    );
  }

  return (
    <div className="min-h-[100dvh] w-screen app-frame-bg flex justify-center items-stretch overflow-y-auto">
      <div className="w-full max-w-[430px] sm:max-w-[720px] lg:max-w-[1080px] min-h-[100dvh] relative overflow-hidden" style={{ boxShadow: '0 0 100px rgba(30, 58, 95, 0.2)' }}>
        <CustomerDashboard />
      </div>
      <AiSupportBubble />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <RouteStateSync>
          <AppGate />
        </RouteStateSync>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
