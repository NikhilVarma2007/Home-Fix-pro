import { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Bell,
  Bug,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Compass,
  Droplets,
  Hammer,
  HardHat,
  Headphones,
  IndianRupee,
  Languages,
  LogOut,
  MapPin,
  MessageCircle,
  Mic,
  Navigation,
  Paintbrush,
  Phone,
  Plug,
  Scissors,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  ToggleLeft,
  ToggleRight,
  Upload,
  UserRound,
  Wrench,
  Zap,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { fetchHealth, updateBooking } from '../lib/api';
import type { Booking } from '../types';

type DashboardSection = 'jobs' | 'active' | 'schedule' | 'earnings' | 'chat' | 'profile';

const workerLocation = {
  lat: 12.9321,
  lng: 77.5805,
};

const sectionItems = [
  { id: 'jobs' as const, label: 'New Jobs', icon: Bell, color: '#FF6B5B' },
  { id: 'active' as const, label: 'My Jobs', icon: ClipboardCheck, color: '#10B981' },
  { id: 'schedule' as const, label: 'Schedule', icon: CalendarDays, color: '#3B82F6' },
  { id: 'earnings' as const, label: 'Earnings', icon: IndianRupee, color: '#F59E0B' },
  { id: 'chat' as const, label: 'Chat', icon: MessageCircle, color: '#8B5CF6' },
  { id: 'profile' as const, label: 'Profile', icon: UserRound, color: '#06B6D4' },
];

const dashboardText = {
  en: {
    jobs: 'New Jobs',
    active: 'My Jobs',
    schedule: 'Schedule',
    earnings: 'Earnings',
    chat: 'Chat',
    profile: 'Profile',
    newAlert: 'New job alert',
    allClear: 'All bookings are under control',
    activeCount: 'Active',
    gps: 'GPS',
    today: 'Today',
    liveGps: 'Live GPS',
    away: 'km away',
    call: 'Call',
    messages: 'Messages',
    taskList: 'Task List',
    complete: 'Complete',
    photo: 'Photo',
    voice: 'Voice command',
    support: 'Support',
    language: 'Language',
    online: 'Online',
    offline: 'Offline',
    newBookings: 'New bookings',
    todaySchedule: 'Today schedule',
  },
  hi: {
    jobs: 'नए काम',
    active: 'मेरे काम',
    schedule: 'शेड्यूल',
    earnings: 'कमाई',
    chat: 'चैट',
    profile: 'प्रोफाइल',
    newAlert: 'नया काम अलर्ट',
    allClear: 'सभी बुकिंग नियंत्रण में हैं',
    activeCount: 'सक्रिय',
    gps: 'GPS',
    today: 'आज',
    liveGps: 'लाइव GPS',
    away: 'किमी दूर',
    call: 'कॉल',
    messages: 'संदेश',
    taskList: 'काम सूची',
    complete: 'पूरा',
    photo: 'फोटो',
    voice: 'वॉइस कमांड',
    support: 'सहायता',
    language: 'भाषा',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',
    newBookings: 'नई बुकिंग',
    todaySchedule: 'आज का शेड्यूल',
  },
  te: {
    jobs: 'కొత్త పనులు',
    active: 'నా పనులు',
    schedule: 'షెడ్యూల్',
    earnings: 'ఆదాయం',
    chat: 'చాట్',
    profile: 'ప్రొఫైల్',
    newAlert: 'కొత్త పని అలర్ట్',
    allClear: 'అన్ని బుకింగులు నియంత్రణలో ఉన్నాయి',
    activeCount: 'యాక్టివ్',
    gps: 'GPS',
    today: 'ఈ రోజు',
    liveGps: 'లైవ్ GPS',
    away: 'కి.మీ దూరం',
    call: 'కాల్',
    messages: 'సందేశాలు',
    taskList: 'పని జాబితా',
    complete: 'పూర్తి',
    photo: 'ఫోటో',
    voice: 'వాయిస్ కమాండ్',
    support: 'సపోర్ట్',
    language: 'భాష',
    online: 'ఆన్‌లైన్',
    offline: 'ఆఫ్‌లైన్',
    newBookings: 'కొత్త బుకింగులు',
    todaySchedule: 'ఈ రోజు షెడ్యూల్',
  },
};

const taskTemplates: Record<string, string[]> = {
  tailoring: ['Pickup fabric', 'Take measurements', 'Cutting done', 'Stitching done', 'Final ironing', 'Deliver order'],
  plumbing: ['Reach location', 'Diagnose issue', 'Request parts', 'Repair completed', 'Testing done', 'Before/after photos'],
  electrical: ['Reach location', 'Power safety check', 'Wiring or fitting', 'Testing done', 'Customer approval'],
  carpentry: ['Take measurements', 'Material list', 'Cutting and assembly', 'Installation', 'Final polish'],
  laundry: ['Pickup clothes', 'Sort items', 'Wash/dry clean', 'Steam iron', 'Pack and deliver'],
  'daily-labour': ['Reach location', 'Confirm work type', 'Start day work', 'Break update', 'End day photo', 'Request payment'],
  'construction-labour': ['Reach site', 'Mark attendance', 'Material movement', 'Site work update', 'Supervisor approval', 'End day report'],
  cleaning: ['Reach home', 'Inspect rooms', 'Protect delicate items', 'Deep clean zones', 'Final walkthrough', 'Upload photos'],
  'ac-repair': ['Reach location', 'Inspect AC', 'Clean filters', 'Check cooling', 'Report parts', 'Customer approval'],
  painting: ['Inspect walls', 'Cover furniture', 'Surface preparation', 'Apply coat', 'Cleanup', 'Final approval'],
  'appliance-repair': ['Reach location', 'Diagnose appliance', 'Share estimate', 'Repair or replace part', 'Test appliance', 'Collect feedback'],
  'pest-control': ['Inspect area', 'Prepare treatment', 'Apply treatment', 'Safety briefing', 'Follow-up schedule'],
};

function distanceInKm(booking: Booking, origin = workerLocation) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radius = 6371;
  const dLat = toRad(booking.address.lat - origin.lat);
  const dLng = toRad(booking.address.lng - origin.lng);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(booking.address.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.3, radius * c);
}

function getCategoryIcon(categoryId: string) {
  if (categoryId === 'tailoring') return Scissors;
  if (categoryId === 'laundry') return Droplets;
  if (categoryId === 'plumbing') return Wrench;
  if (categoryId === 'electrical') return Zap;
  if (categoryId === 'carpentry') return Hammer;
  if (categoryId === 'construction-labour') return HardHat;
  if (categoryId === 'daily-labour') return UserRound;
  if (categoryId === 'cleaning') return Sparkles;
  if (categoryId === 'ac-repair') return Snowflake;
  if (categoryId === 'painting') return Paintbrush;
  if (categoryId === 'appliance-repair') return Plug;
  if (categoryId === 'pest-control') return Bug;
  return Upload;
}

function getTasks(categoryId: string) {
  return taskTemplates[categoryId] || ['Reach location', 'Start work', 'Upload progress photo', 'Complete job'];
}

function softPanel(inset = false) {
  return {
    background: inset ? 'linear-gradient(145deg, #DFF8F2, #E0F2FE)' : 'linear-gradient(145deg, #ECFEFF, #EEF2FF)',
    border: '1px solid rgba(14, 165, 233, 0.16)',
    boxShadow: inset
      ? 'inset 7px 7px 17px rgba(37,99,235,0.14), inset -7px -7px 17px rgba(20,184,166,0.1)'
      : '14px 14px 30px rgba(99,102,241,0.15), -10px -10px 26px rgba(20,184,166,0.12)',
  };
}

function statusLabel(status: Booking['status']) {
  return status.replace('_', ' ');
}

export function ServiceDashboard() {
  const { state, dispatch, logout } = useApp();
  const [health, setHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isOnline, setIsOnline] = useState(true);
  const [activeSection, setActiveSection] = useState<DashboardSection>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(state.bookings[0]?.id || null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetchHealth()
      .then(() => setHealth('online'))
      .catch(() => setHealth('offline'));
  }, []);

  const worker = useMemo(() => {
    const profileName = state.authProfile?.name?.trim();
    const profession = state.authProfile?.profession;
    return (
      state.professionals.find((professional) => professional.name === profileName) ||
      state.professionals.find((professional) => professional.category === profession) ||
      state.professionals[0]
    );
  }, [state.authProfile?.name, state.authProfile?.profession, state.professionals]);

  const language = state.authProfile?.language || 'en';
  const t = dashboardText[language];

  const workerBookings = useMemo(() => {
    if (!worker) return state.bookings;
    const directJobs = state.bookings.filter((booking) => booking.professionalId === worker.id);
    const categoryJobs = state.bookings.filter((booking) => booking.categoryId === worker.category);
    if (directJobs.length > 0) return directJobs;
    if (categoryJobs.length > 0) return categoryJobs;
    return state.bookings;
  }, [state.bookings, worker]);

  const sortedJobs = useMemo(
    () => [...workerBookings].sort((a, b) => distanceInKm(a) - distanceInKm(b)),
    [workerBookings],
  );

  const pendingJobs = sortedJobs.filter((booking) => booking.status === 'confirmed' || booking.status === 'pending');
  const activeJobs = sortedJobs.filter((booking) => ['confirmed', 'in_progress'].includes(booking.status));
  const selectedJob = sortedJobs.find((booking) => booking.id === selectedJobId) || sortedJobs[0];
  const todayEarnings = workerBookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((total, booking) => total + booking.paymentAmount, 0);
  const monthlyEarnings = workerBookings.reduce((total, booking) => total + booking.price, 0);
  const liveLocationJobs = activeJobs.filter((booking) => distanceInKm(booking) < 5).length;

  useEffect(() => {
    if (!selectedJobId && sortedJobs[0]) {
      setSelectedJobId(sortedJobs[0].id);
    }
  }, [selectedJobId, sortedJobs]);

  const handleBookingStatus = (booking: Booking, status: Booking['status']) => {
    const updatedBooking = { ...booking, status };
    dispatch({ type: 'UPDATE_BOOKING', booking: updatedBooking });
    void updateBooking(updatedBooking).catch(() => {
      dispatch({
        type: 'SHOW_TOAST',
        message: 'Saved locally. Backend will sync when reachable.',
        toastType: 'default',
      });
    });
  };

  const toggleTask = (jobId: string, task: string) => {
    setCompletedTasks((current) => {
      const existing = current[jobId] || [];
      const nextTasks = existing.includes(task) ? existing.filter((item) => item !== task) : [...existing, task];
      return { ...current, [jobId]: nextTasks };
    });
  };

  const renderJobCard = (booking: Booking) => {
    const Icon = getCategoryIcon(booking.categoryId);
    const distance = distanceInKm(booking);
    const eta = Math.max(4, Math.round(distance * 6));
    const isSelected = selectedJob?.id === booking.id;

    return (
      <button
        key={booking.id}
        onClick={() => {
          setSelectedJobId(booking.id);
          setActiveSection(booking.status === 'pending' ? 'jobs' : 'active');
        }}
        className="w-full rounded-[1.75rem] p-4 text-left transition-transform tap-active"
        style={{
          ...softPanel(isSelected),
          border: isSelected ? '1px solid rgba(255,107,91,0.34)' : '1px solid rgba(255,255,255,0.65)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ ...softPanel(), color: '#FF6B5B' }}>
            <Icon size={25} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[17px] font-extrabold leading-tight text-[#1D2939]">{booking.serviceName}</p>
                <p className="mt-1 text-[13px] font-semibold text-[#667085]">{booking.address.label} - {booking.scheduledTime}</p>
              </div>
              <span className="rounded-full px-3 py-1 text-[11px] font-bold capitalize text-[#0F766E]" style={{ background: '#DFF8F2' }}>
                {statusLabel(booking.status)}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl px-2 py-2 text-center" style={softPanel(true)}>
                <MapPin size={15} className="mx-auto text-[#EF4444]" />
                <p className="mt-1 text-[13px] font-extrabold text-[#1D2939]">{distance.toFixed(1)} km</p>
              </div>
              <div className="rounded-2xl px-2 py-2 text-center" style={softPanel(true)}>
                <Clock3 size={15} className="mx-auto text-[#3B82F6]" />
                <p className="mt-1 text-[13px] font-extrabold text-[#1D2939]">{eta} min</p>
              </div>
              <div className="rounded-2xl px-2 py-2 text-center" style={softPanel(true)}>
                <Banknote size={15} className="mx-auto text-[#10B981]" />
                <p className="mt-1 text-[13px] font-extrabold text-[#1D2939]">Rs {booking.price}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-[13px] font-medium leading-relaxed text-[#667085]">{booking.notes || booking.address.full}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleBookingStatus(booking, 'in_progress');
                }}
                className="h-12 flex-1 rounded-2xl text-[14px] font-extrabold text-white tap-active-sm"
                style={{ background: '#10B981', boxShadow: '8px 8px 18px rgba(16,185,129,0.24), -8px -8px 18px rgba(255,255,255,0.85)' }}
              >
                Accept
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleBookingStatus(booking, 'cancelled');
                }}
                className="h-12 flex-1 rounded-2xl text-[14px] font-extrabold text-[#B42318] tap-active-sm"
                style={softPanel()}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </button>
    );
  };

  const renderMapPanel = () => {
    if (!selectedJob) return null;

    const distance = distanceInKm(selectedJob);
    const eta = Math.max(4, Math.round(distance * 6));

    return (
      <div className="rounded-[2rem] p-4" style={softPanel()}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#667085]">{t.liveGps}</p>
            <h2 className="text-xl font-black text-[#1D2939]">{distance.toFixed(1)} {t.away}</h2>
          </div>
          <button
            onClick={() => {
              const destination = `${selectedJob.address.lat},${selectedJob.address.lng}`;
              window.open(`https://www.google.com/maps/dir/?api=1&origin=${workerLocation.lat},${workerLocation.lng}&destination=${destination}&travelmode=driving`, '_blank', 'noopener,noreferrer');
            }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white tap-active-sm"
            style={{ background: '#2563EB', boxShadow: '8px 8px 18px rgba(37,99,235,0.24), -8px -8px 18px rgba(255,255,255,0.85)' }}
          >
            <Navigation size={24} />
          </button>
        </div>

        <div className="relative mt-4 h-56 overflow-hidden rounded-[1.75rem]" style={softPanel(true)}>
          <div className="absolute left-5 right-5 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#D5DFE8]" />
          <div className="absolute left-10 right-14 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#60A5FA]" />
          <div className="absolute left-[18%] top-[34%] h-24 w-24 rounded-full border border-[#CBD5E1]" />
          <div className="absolute right-[14%] top-[18%] h-32 w-32 rounded-full border border-[#CBD5E1]" />
          <div className="absolute left-8 top-[42%] flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xl">
            <Compass size={23} />
          </div>
          <div className="absolute right-10 top-[32%] flex h-16 w-16 items-center justify-center rounded-full bg-[#EF4444] text-white shadow-xl">
            <MapPin size={27} />
          </div>
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl px-4 py-3" style={{ background: 'rgba(238,243,247,0.9)', boxShadow: 'inset 5px 5px 12px rgba(151,164,178,0.24), inset -5px -5px 12px rgba(255,255,255,0.8)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-extrabold text-[#1D2939]">{selectedJob.address.label}</span>
              <span className="text-[14px] font-extrabold text-[#2563EB]">{eta} mins</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex h-14 items-center justify-center gap-2 rounded-2xl text-[14px] font-extrabold text-[#1D2939] tap-active-sm" style={softPanel()}>
            <Phone size={18} color="#10B981" />
            {t.call}
          </button>
          <button className="flex h-14 items-center justify-center gap-2 rounded-2xl text-[14px] font-extrabold text-[#1D2939] tap-active-sm" style={softPanel()}>
            <MessageCircle size={18} color="#8B5CF6" />
            {t.chat}
          </button>
        </div>
      </div>
    );
  };

  const renderChecklist = () => {
    if (!selectedJob) return null;
    const tasks = getTasks(selectedJob.categoryId);
    const done = completedTasks[selectedJob.id] || [];

    return (
      <div className="rounded-[2rem] p-4" style={softPanel()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#667085]">{t.taskList}</p>
            <h2 className="text-xl font-black text-[#1D2939]">{selectedJob.serviceName}</h2>
          </div>
          <span className="rounded-full px-3 py-1 text-[12px] font-black text-[#0F766E]" style={{ background: '#DFF8F2' }}>
            {done.length}/{tasks.length}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {tasks.map((task) => {
            const isDone = done.includes(task);
            return (
              <button
                key={task}
                onClick={() => toggleTask(selectedJob.id, task)}
                className="flex w-full items-center gap-3 rounded-2xl p-3 text-left tap-active"
                style={softPanel(isDone)}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: isDone ? '#10B981' : '#EEF3F7', boxShadow: isDone ? 'none' : softPanel().boxShadow }}>
                  {isDone ? <Check size={20} color="white" /> : <ChevronRight size={20} color="#667085" />}
                </span>
                <span className="flex-1 text-[15px] font-extrabold text-[#1D2939]">{task}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex h-14 items-center justify-center gap-2 rounded-2xl text-[14px] font-extrabold text-[#1D2939] tap-active-sm" style={softPanel()}>
            <Camera size={18} color="#FF6B5B" />
            {t.photo}
          </button>
          <button
            onClick={() => handleBookingStatus(selectedJob, 'completed')}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl text-[14px] font-extrabold text-white tap-active-sm"
            style={{ background: '#10B981', boxShadow: '8px 8px 18px rgba(16,185,129,0.24), -8px -8px 18px rgba(255,255,255,0.85)' }}
          >
            <Check size={18} />
            {t.complete}
          </button>
        </div>
      </div>
    );
  };

  const renderSection = () => {
    if (activeSection === 'jobs') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-[#1D2939]">{t.newBookings}</h2>
            <span className="rounded-full px-3 py-1 text-[12px] font-black text-[#B42318]" style={{ background: '#FFE4E0' }}>
              {pendingJobs.length} live
            </span>
          </div>
          {(pendingJobs.length ? pendingJobs : sortedJobs).map(renderJobCard)}
        </div>
      );
    }

    if (activeSection === 'active') {
      return (
        <div className="space-y-4">
          {renderMapPanel()}
          {renderChecklist()}
        </div>
      );
    }

    if (activeSection === 'schedule') {
      return (
        <div className="rounded-[2rem] p-4" style={softPanel()}>
          <h2 className="text-xl font-black text-[#1D2939]">{t.todaySchedule}</h2>
          <div className="mt-4 space-y-3">
            {sortedJobs.map((booking) => (
              <button key={booking.id} onClick={() => setSelectedJobId(booking.id)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left" style={softPanel(true)}>
                <Clock3 size={20} color="#3B82F6" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-extrabold text-[#1D2939]">{booking.scheduledTime}</p>
                  <p className="truncate text-[13px] font-semibold text-[#667085]">{booking.serviceName} - {distanceInKm(booking).toFixed(1)} km</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === 'earnings') {
      return (
        <div className="space-y-4">
          <div className="rounded-[2rem] p-5" style={softPanel()}>
            <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#667085]">Withdraw ready</p>
            <h2 className="mt-1 text-4xl font-black text-[#1D2939]">Rs {todayEarnings}</h2>
            <button className="mt-5 h-14 w-full rounded-2xl text-[15px] font-black text-white" style={{ background: '#FF6B5B', boxShadow: '8px 8px 18px rgba(255,107,91,0.24), -8px -8px 18px rgba(255,255,255,0.85)' }}>
              Withdraw to UPI
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.5rem] p-4" style={softPanel()}>
              <p className="text-[12px] font-bold text-[#667085]">This week</p>
              <p className="mt-1 text-2xl font-black text-[#1D2939]">Rs {Math.round(monthlyEarnings * 0.42)}</p>
            </div>
            <div className="rounded-[1.5rem] p-4" style={softPanel()}>
              <p className="text-[12px] font-bold text-[#667085]">This month</p>
              <p className="mt-1 text-2xl font-black text-[#1D2939]">Rs {monthlyEarnings}</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'chat') {
      return (
        <div className="rounded-[2rem] p-4" style={softPanel()}>
          <h2 className="text-xl font-black text-[#1D2939]">{t.messages}</h2>
          <div className="mt-4 space-y-3">
            {state.chatThreads.slice(0, 4).map((thread) => (
              <div key={thread.id} className="flex items-center gap-3 rounded-2xl p-3" style={softPanel(true)}>
                <img src={thread.professionalAvatar} alt={thread.professionalName} className="h-12 w-12 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-extrabold text-[#1D2939]">{thread.serviceName}</p>
                  <p className="truncate text-[13px] font-semibold text-[#667085]">{thread.lastMessage}</p>
                </div>
                {thread.unread > 0 && <span className="rounded-full bg-[#FF6B5B] px-2 py-1 text-[11px] font-black text-white">{thread.unread}</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[2rem] p-4" style={softPanel()}>
        <div className="flex items-center gap-4">
          <img src={worker?.avatar || '/images/user-avatar.jpg'} alt={worker?.name || 'Worker'} className="h-20 w-20 rounded-[1.6rem] object-cover" style={softPanel()} />
          <div className="min-w-0">
            <h2 className="text-xl font-black text-[#1D2939]">{worker?.name || state.authProfile?.name || 'Service Worker'}</h2>
            <p className="text-[14px] font-bold capitalize text-[#667085]">{worker?.category || 'all services'}</p>
            <div className="mt-2 flex items-center gap-1 text-[14px] font-black text-[#F59E0B]">
              <Star size={16} fill="#F59E0B" />
              {worker?.rating || 4.8}
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="flex h-14 items-center justify-center gap-2 rounded-2xl text-[14px] font-extrabold text-[#1D2939]" style={softPanel()}>
            <ShieldCheck size={18} color="#10B981" />
            Documents
          </button>
          <button className="flex h-14 items-center justify-center gap-2 rounded-2xl text-[14px] font-extrabold text-[#1D2939]" style={softPanel()}>
            <Headphones size={18} color="#FF6B5B" />
            Help
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-y-auto pb-24 text-[#1D2939]" style={{ background: '#EEF3F7' }}>
      <div className="sticky top-0 z-30 px-4 py-4" style={{ background: 'rgba(238, 243, 247, 0.9)', backdropFilter: 'blur(18px)' }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src={worker?.avatar || '/images/user-avatar.jpg'} alt={worker?.name || 'Worker'} className="h-14 w-14 rounded-2xl object-cover" style={softPanel()} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-black text-[#1D2939]">{state.authProfile?.businessName || 'HomeFix Pro Worker'}</h1>
                <span className="hidden rounded-full px-2 py-1 text-[11px] font-black text-[#0F766E] sm:inline" style={{ background: '#DFF8F2' }}>{health}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[13px] font-bold text-[#667085]">
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                {worker?.rating || 4.8}
                <span>Rs {todayEarnings} today</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setIsOnline((current) => !current)}
              className="flex h-12 items-center gap-2 rounded-2xl px-3 text-[13px] font-black tap-active-sm"
              style={{ ...softPanel(isOnline), color: isOnline ? '#0F766E' : '#B42318' }}
            >
              {isOnline ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              {isOnline ? t.online : t.offline}
            </button>
            <button onClick={logout} className="flex h-12 w-12 items-center justify-center rounded-2xl tap-active-sm" style={softPanel()}>
              <LogOut size={20} color="#667085" />
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4">
        <div className="rounded-[2rem] p-4" style={softPanel()}>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B5B] text-white" style={{ boxShadow: '8px 8px 18px rgba(255,107,91,0.24)' }}>
              <Bell size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-black uppercase tracking-[0.18em] text-[#B42318]">{t.newAlert}</p>
              <h2 className="truncate text-lg font-black text-[#1D2939]">
                {pendingJobs[0] ? `${pendingJobs[0].serviceName} - ${distanceInKm(pendingJobs[0]).toFixed(1)} ${t.away}` : t.allClear}
              </h2>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[1.5rem] p-4 text-center" style={softPanel()}>
            <ClipboardCheck size={22} className="mx-auto text-[#10B981]" />
            <p className="mt-2 text-2xl font-black">{activeJobs.length}</p>
            <p className="text-[12px] font-bold text-[#667085]">{t.activeCount}</p>
          </div>
          <div className="rounded-[1.5rem] p-4 text-center" style={softPanel()}>
            <Navigation size={22} className="mx-auto text-[#2563EB]" />
            <p className="mt-2 text-2xl font-black">{liveLocationJobs}</p>
            <p className="text-[12px] font-bold text-[#667085]">{t.gps}</p>
          </div>
          <div className="rounded-[1.5rem] p-4 text-center" style={softPanel()}>
            <IndianRupee size={22} className="mx-auto text-[#F59E0B]" />
            <p className="mt-2 text-2xl font-black">{todayEarnings}</p>
            <p className="text-[12px] font-bold text-[#667085]">{t.today}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sectionItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-[1.6rem] p-3 text-center tap-active"
                style={{
                  ...softPanel(active),
                  border: active ? `1px solid ${item.color}55` : '1px solid rgba(255,255,255,0.65)',
                }}
              >
                <Icon size={28} color={item.color} />
                <span className="text-[15px] font-black text-[#1D2939]">{t[item.id]}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <section className="space-y-4">{renderSection()}</section>
          <aside className="space-y-4">
            {activeSection !== 'active' && renderMapPanel()}
            <div className="rounded-[2rem] p-4" style={softPanel()}>
              <div className="flex items-center gap-3">
                <button className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6B5B] text-white tap-active-sm" style={{ boxShadow: '8px 8px 18px rgba(255,107,91,0.24)' }}>
                  <Mic size={30} />
                </button>
                <div>
                  <p className="text-[16px] font-black text-[#1D2939]">{t.voice}</p>
                  <p className="text-[13px] font-bold text-[#667085]">Hindi, Tamil, Telugu, English</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {['Accept job', 'Show location', 'Call customer', 'Upload photo'].map((command) => (
                  <span key={command} className="rounded-2xl px-3 py-2 text-center text-[12px] font-black text-[#667085]" style={softPanel(true)}>
                    {command}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex h-16 items-center justify-center gap-2 rounded-[1.5rem] text-[14px] font-black text-[#1D2939]" style={softPanel()}>
                <Languages size={18} color="#8B5CF6" />
                {t.language}
              </button>
              <button className="flex h-16 items-center justify-center gap-2 rounded-[1.5rem] text-[14px] font-black text-[#1D2939]" style={softPanel()}>
                <Headphones size={18} color="#FF6B5B" />
                {t.support}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
