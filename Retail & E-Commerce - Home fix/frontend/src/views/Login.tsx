import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  Bug,
  Building2,
  Download,
  Droplets,
  Hammer,
  Languages,
  Paintbrush,
  Plug,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Sparkles,
  UserRound,
  Wrench,
  Zap,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { getCurrentAddress, openGoogleMapsCurrentPin, openGoogleMapsPicker } from '../lib/location';

type Language = 'en' | 'hi' | 'te';
type Role = 'customer' | 'service' | 'admin';
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const text = {
  en: {
    app: 'HomeFix Pro',
    welcome: 'Choose language',
    subtitle: 'Book trusted workers or manage your service jobs.',
    customer: 'Customer',
    service: 'Service Provider',
    admin: 'Control Panel',
    name: 'Name',
    phone: 'Phone',
    profession: 'Profession',
    business: 'Business Name',
    experience: 'Experience',
    area: 'Service Area',
    continue: 'Continue',
    next: 'Next',
    back: 'Back',
    download: 'Download app',
    android: 'Android',
    iphone: 'iPhone',
    pickMaps: 'Pick in Google Maps',
    useGps: 'Use current location',
    professionStep: 'Tell us your work',
  },
  hi: {
    app: 'होमफिक्स प्रो',
    welcome: 'भाषा चुनें',
    subtitle: 'सेवा बुक करें या अपना काम संभालें।',
    customer: 'ग्राहक',
    service: 'सेवा प्रदाता',
    admin: 'कंट्रोल पैनल',
    name: 'नाम',
    phone: 'फोन',
    profession: 'काम',
    business: 'व्यवसाय नाम',
    experience: 'अनुभव',
    area: 'सेवा क्षेत्र',
    continue: 'जारी रखें',
    next: 'आगे',
    back: 'पीछे',
    download: 'ऐप डाउनलोड',
    android: 'एंड्रॉयड',
    iphone: 'आईफोन',
    professionStep: 'अपने काम की जानकारी दें',
  },
  te: {
    app: 'హోమ్ ఫిక్స్ ప్రో',
    welcome: 'భాష ఎంచుకోండి',
    subtitle: 'సేవలు బుక్ చేయండి లేదా మీ పనులు నిర్వహించండి.',
    customer: 'కస్టమర్',
    service: 'సర్వీస్ ప్రొవైడర్',
    admin: 'కంట్రోల్ ప్యానెల్',
    name: 'పేరు',
    phone: 'ఫోన్',
    profession: 'వృత్తి',
    business: 'బిజినెస్ పేరు',
    experience: 'అనుభవం',
    area: 'సేవ ప్రాంతం',
    continue: 'కొనసాగించండి',
    next: 'తర్వాత',
    back: 'వెనుకకు',
    download: 'యాప్ డౌన్లోడ్',
    android: 'ఆండ్రాయిడ్',
    iphone: 'ఐఫోన్',
    professionStep: 'మీ పని వివరాలు చెప్పండి',
  },
};

const languages = [
  { id: 'en' as const, label: 'English' },
  { id: 'hi' as const, label: 'हिन्दी' },
  { id: 'te' as const, label: 'తెలుగు' },
];

const roleCards = [
  { role: 'customer' as const, icon: UserRound },
  { role: 'service' as const, icon: Wrench },
  { role: 'admin' as const, icon: ShieldCheck },
];

const professions = [
  { id: 'tailoring', label: 'Tailor', icon: Paintbrush },
  { id: 'laundry', label: 'Laundry Pro', icon: Droplets },
  { id: 'cleaning', label: 'Cleaning Pro', icon: Sparkles },
  { id: 'ac-repair', label: 'AC Technician', icon: Snowflake },
  { id: 'painting', label: 'Painter', icon: Paintbrush },
  { id: 'appliance-repair', label: 'Appliance Repair', icon: Plug },
  { id: 'pest-control', label: 'Pest Control', icon: Bug },
  { id: 'carpentry', label: 'Carpenter', icon: Hammer },
  { id: 'daily-labour', label: 'Daily Labour', icon: BriefcaseBusiness },
  { id: 'construction-labour', label: 'Construction Labour', icon: Building2 },
  { id: 'plumbing', label: 'Plumber', icon: Wrench },
  { id: 'electrical', label: 'Electrician', icon: Zap },
];

const softCard = {
  background: 'linear-gradient(145deg, #ECFEFF, #EEF2FF)',
  border: '1px solid rgba(14, 165, 233, 0.16)',
  boxShadow: '14px 14px 30px rgba(99, 102, 241, 0.15), -10px -10px 26px rgba(20, 184, 166, 0.12)',
};

const pressedCard = {
  background: 'linear-gradient(145deg, #DFF8F2, #E0F2FE)',
  border: '1px solid rgba(255, 107, 91, 0.18)',
  boxShadow: 'inset 7px 7px 17px rgba(37,99,235,0.14), inset -7px -7px 17px rgba(20,184,166,0.1), 0 0 20px rgba(255,107,91,0.18)',
};

export function Login() {
  const { login, dispatch } = useApp();
  const [language, setLanguage] = useState<Language>('en');
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>('customer');
  const [name, setName] = useState('Priya Menon');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [profession, setProfession] = useState('tailoring');
  const [businessName, setBusinessName] = useState('Lakshmi Tailor');
  const [experience, setExperience] = useState('5 years');
  const [serviceArea, setServiceArea] = useState('Jayanagar, Bangalore');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const t = text[language];
  const selectedProfession = useMemo(() => professions.find((item) => item.id === profession), [profession]);

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleContinue = async () => {
    if (role === 'service' && step === 1) {
      setStep(2);
      return;
    }

    await login(
      role,
      name.trim() || 'Guest User',
      phone.trim() || '+91 00000 00000',
      role === 'service' ? businessName.trim() || selectedProfession?.label || 'Service Worker' : undefined,
      {
        language,
        profession: role === 'service' ? profession : undefined,
        experience: role === 'service' ? experience : undefined,
        serviceArea: role === 'service' ? serviceArea : undefined,
      },
    );
  };

  const handleCurrentServiceArea = () => {
    getCurrentAddress(
      (address) => {
        setServiceArea(address.full);
        openGoogleMapsCurrentPin(address);
        dispatch({ type: 'SHOW_TOAST', message: 'Current service area selected.', toastType: 'success' });
      },
      (message) => dispatch({ type: 'SHOW_TOAST', message, toastType: 'error' }),
    );
  };

  const handleDownload = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }

    const appLink = `${window.location.origin}/`;
    const file = new Blob(
      [`<!doctype html><meta http-equiv="refresh" content="0;url=${appLink}"><title>HomeFix Pro</title><a href="${appLink}">Open HomeFix Pro</a>`],
      { type: 'text/html' },
    );
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'HomeFix-Pro-App.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto text-[#1D2939]" style={{ background: 'linear-gradient(135deg, #ECFEFF 0%, #F0FDFA 48%, #EEF2FF 100%)' }}>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-8">
        <div className="mb-5 rounded-[2rem] p-6 text-center" style={softCard}>
          <img
            src="/images/homefix-pro-logo.svg"
            alt="HomeFix Pro"
            className="mx-auto h-48 w-full object-contain"
          />
          <h1 className="sr-only">{t.app}</h1>
          <p className="mt-2 text-sm font-semibold text-[#667085]">{t.subtitle}</p>
        </div>

        <div className="rounded-[2rem] p-5" style={softCard}>
          <div className="mb-4 flex items-center gap-2">
            <Languages size={18} color="#8B5CF6" />
            <h2 className="text-lg font-black">{t.welcome}</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {languages.map((item) => (
              <button
                key={item.id}
                onClick={() => setLanguage(item.id)}
                data-active={language === item.id}
                className="h-12 rounded-2xl text-sm font-black tap-active-sm"
                style={language === item.id ? pressedCard : softCard}
              >
                {item.label}
              </button>
            ))}
          </div>

          {step === 1 ? (
            <>
              <div className="mt-5 grid grid-cols-1 gap-3">
                {roleCards.map((card) => {
                  const Icon = card.icon;
                  const active = role === card.role;
                  return (
                    <button
                      key={card.role}
                      onClick={() => setRole(card.role)}
                      data-active={active}
                      className="rounded-[1.5rem] p-4 text-left tap-active"
                      style={active ? pressedCard : softCard}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={active ? softCard : pressedCard}>
                          <Icon size={22} color={active ? '#FF6B5B' : '#667085'} />
                        </span>
                        <span className="text-base font-black">{t[card.role]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                <Field label={t.name} value={name} onChange={setName} />
                <Field label={t.phone} value={phone} onChange={setPhone} />
              </div>
            </>
          ) : (
            <>
              <div className="mt-5">
                <h2 className="text-lg font-black">{t.professionStep}</h2>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {professions.map((item) => {
                    const Icon = item.icon;
                    const active = profession === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setProfession(item.id);
                          setBusinessName(item.label);
                        }}
                        data-active={active}
                        className="min-h-[104px] rounded-[1.5rem] p-3 text-center tap-active"
                        style={active ? pressedCard : softCard}
                      >
                        <Icon size={27} className="mx-auto" color={active ? '#FF6B5B' : '#667085'} />
                        <span className="mt-2 block text-sm font-black">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Field label={t.business} value={businessName} onChange={setBusinessName} />
                <Field label={t.experience} value={experience} onChange={setExperience} />
                <Field label={t.area} value={serviceArea} onChange={setServiceArea} />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openGoogleMapsPicker(serviceArea || 'Bangalore')}
                    className="flex min-h-12 items-center justify-center rounded-2xl px-3 text-xs font-black tap-active-sm"
                    style={pressedCard}
                  >
                    Pick in Google Maps
                  </button>
                  <button
                    onClick={handleCurrentServiceArea}
                    className="flex min-h-12 items-center justify-center rounded-2xl px-3 text-xs font-black tap-active-sm"
                    style={pressedCard}
                  >
                    Use current location
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="mt-5 flex gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="h-13 rounded-2xl px-5 text-sm font-black tap-active-sm" style={softCard}>
                {t.back}
              </button>
            )}
            <button
              onClick={handleContinue}
              className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white tap-active-sm"
              style={{ background: '#FF6B5B', boxShadow: '10px 10px 24px rgba(255,107,91,0.25), -10px -10px 24px rgba(255,255,255,0.85)' }}
            >
              {role === 'service' && step === 1 ? t.next : t.continue}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] p-4" style={softCard}>
          <div className="flex items-center gap-2">
            <Download size={17} color="#10B981" />
            <p className="text-sm font-black">{t.download}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={handleDownload} className="flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-black" style={pressedCard}>
              <Smartphone size={17} color="#10B981" />
              {t.android}
            </button>
            <button onClick={handleDownload} className="flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-black" style={pressedCard}>
              <Smartphone size={17} color="#2563EB" />
              {t.iphone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-black uppercase tracking-[0.18em] text-[#667085]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-13 w-full rounded-2xl border-0 px-4 py-4 text-sm font-bold text-[#1D2939] outline-none"
        style={pressedCard}
      />
    </label>
  );
}
