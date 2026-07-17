import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, CircleCheckBig, Copy, Database, Gauge, Github, LogOut, ServerCog } from 'lucide-react';
import { useApp } from '../AppContext';
import { fetchAppStats, fetchHealth } from '../lib/api';

type Stats = Awaited<ReturnType<typeof fetchAppStats>>;

const adminText = {
  en: {
    title: 'Admin Control Panel',
    monitoring: 'Monitoring',
    appHealth: 'App health',
    liveStatus: 'Live status',
    bookings: 'Bookings',
    professionals: 'Professionals',
    active: 'Active',
    sectors: 'Sectors',
    systemCheck: 'System Check',
    notes: 'Monitoring Notes',
    noteCustomer: 'Customer users start in Explore Services.',
    noteService: 'Service providers see a dedicated work dashboard.',
    noteOffers: 'Offers rotate every 20 seconds across the main workspaces.',
  },
  hi: {
    title: 'एडमिन कंट्रोल पैनल',
    monitoring: 'मॉनिटरिंग',
    appHealth: 'ऐप हेल्थ',
    liveStatus: 'लाइव स्थिति',
    bookings: 'बुकिंग',
    professionals: 'प्रोफेशनल',
    active: 'सक्रिय',
    sectors: 'सेक्टर',
    systemCheck: 'सिस्टम चेक',
    notes: 'मॉनिटरिंग नोट्स',
    noteCustomer: 'ग्राहक Explore Services से शुरू करते हैं।',
    noteService: 'सेवा प्रदाताओं को अलग वर्क डैशबोर्ड मिलता है।',
    noteOffers: 'ऑफर मुख्य वर्कस्पेस में हर 20 सेकंड में बदलते हैं।',
  },
  te: {
    title: 'అడ్మిన్ కంట్రోల్ ప్యానెల్',
    monitoring: 'మానిటరింగ్',
    appHealth: 'యాప్ హెల్త్',
    liveStatus: 'లైవ్ స్థితి',
    bookings: 'బుకింగులు',
    professionals: 'ప్రొఫెషనల్స్',
    active: 'యాక్టివ్',
    sectors: 'సెక్టర్లు',
    systemCheck: 'సిస్టమ్ చెక్',
    notes: 'మానిటరింగ్ నోట్స్',
    noteCustomer: 'కస్టమర్లు Explore Services నుండి మొదలుపెడతారు.',
    noteService: 'సర్వీస్ ప్రొవైడర్లకు ప్రత్యేక వర్క్ డ్యాష్‌బోర్డ్ ఉంటుంది.',
    noteOffers: 'ఆఫర్లు ప్రధాన వర్క్‌స్పేస్‌లలో ప్రతి 20 సెకండ్లకు మారుతాయి.',
  },
};

export function AdminPanel() {
  const { state, logout } = useApp();
  const [health, setHealth] = useState('checking');
  const [stats, setStats] = useState<Stats | null>(null);
  const [repoUrl, setRepoUrl] = useState('https://github.com/your-name/homefix-pro.git');
  const t = adminText[state.authProfile?.language || 'en'];
  const gitCommands = `git remote add origin ${repoUrl}\ngit branch -M main\ngit push -u origin main`;

  useEffect(() => {
    fetchHealth()
      .then((result) => setHealth(result.source === 'supabase' ? 'supabase online' : 'local online'))
      .catch(() => setHealth('offline'));

    fetchAppStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="scroll-frame pb-28" style={{ background: 'radial-gradient(circle at top, rgba(78,205,196,0.08), transparent 36%), #000212' }}>
      <div className="sticky top-0 z-30 px-4 py-3" style={{ background: 'rgba(0, 2, 18, 0.86)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: '#64748B' }}>
              {t.title}
            </p>
            <h1 className="text-xl font-bold text-white">{t.monitoring}</h1>
          </div>
          <button onClick={logout} className="selected-glow flex h-12 w-12 items-center justify-center rounded-full text-white tap-active-sm" style={{ background: '#334155' }} title="Back to main login">
            <LogOut size={24} color="white" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-4">
        <div className="card-surface rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#94A3B8' }}>{t.appHealth}</p>
              <h2 className="text-base font-semibold text-white">{t.liveStatus}</h2>
            </div>
            <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
              {health}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Database size={16} color="#4ECDC4" />
              <p className="mt-2 text-lg font-bold text-white">{stats?.totalBookings ?? 0}</p>
              <p className="text-[10px]" style={{ color: '#64748B' }}>{t.bookings}</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <ServerCog size={16} color="#FF6B5B" />
              <p className="mt-2 text-lg font-bold text-white">{stats?.totalProfessionals ?? 0}</p>
              <p className="text-[10px]" style={{ color: '#64748B' }}>{t.professionals}</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Gauge size={16} color="#FFD93D" />
              <p className="mt-2 text-lg font-bold text-white">{stats?.activeBookings ?? 0}</p>
              <p className="text-[10px]" style={{ color: '#64748B' }}>{t.active}</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Activity size={16} color="#A78BFA" />
              <p className="mt-2 text-lg font-bold text-white">{stats?.totalCategories ?? 0}</p>
              <p className="text-[10px]" style={{ color: '#64748B' }}>{t.sectors}</p>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-3xl p-4">
          <div className="flex items-center gap-2">
            <CircleCheckBig size={16} color="#4ECDC4" />
            <h2 className="text-base font-semibold text-white">{t.systemCheck}</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
            {stats ? `Backend source: ${stats.source}. Last sync: ${stats.lastUpdated}.` : 'The backend is reachable, and the control panel is ready to monitor the app.'}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <ArrowUpRight size={14} color="#FF6B5B" />
            <span className="text-xs" style={{ color: '#94A3B8' }}>
              Health checks and counters update from the live backend.
            </span>
          </div>
        </div>

        <div className="card-surface rounded-3xl p-4">
          <div className="flex items-center gap-2">
            <Github size={17} color="#4ECDC4" />
            <h2 className="text-base font-semibold text-white">GitHub connection</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: '#94A3B8' }}>
            Add your GitHub repository URL, copy the commands, and run them from the project folder to connect this app to GitHub.
          </p>
          <input
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white outline-none"
          />
          <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-[#DDFCF8]">{gitCommands}</pre>
          <button
            onClick={() => navigator.clipboard?.writeText(gitCommands)}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#10B981] text-xs font-black text-white tap-active-sm"
          >
            <Copy size={15} />
            Copy Git commands
          </button>
        </div>

        <div className="card-surface rounded-3xl p-4">
          <h2 className="text-base font-semibold text-white">{t.notes}</h2>
          <ul className="mt-3 space-y-2 text-sm" style={{ color: '#94A3B8' }}>
            <li>{t.noteCustomer}</li>
            <li>{t.noteService}</li>
            <li>{t.noteOffers}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
