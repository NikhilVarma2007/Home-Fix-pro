import { useMemo, useState } from 'react';
import { Languages, MapPin, Mic, Send, Volume2, X } from 'lucide-react';
import { useApp } from '../AppContext';

type AssistantLanguage = 'en' | 'hi' | 'te';

type SpeechRecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null;
  onerror: (() => void) | null;
};

const speechLanguage: Record<AssistantLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

const assistantText = {
  en: {
    title: 'AI Service Guide',
    intro: 'Tell me your problem. I will suggest the best nearby service.',
    placeholder: 'Leak, blouse design, AC not cooling...',
    nearest: 'Nearest best match',
    trends: 'Tailoring trend ideas',
    speak: 'Speak',
    send: 'Ask AI',
    fallback: 'I can help with service choice, nearest worker, price range, and booking notes.',
  },
  hi: {
    title: 'AI सेवा गाइड',
    intro: 'अपनी समस्या बताएं. मैं नजदीकी अच्छी सेवा सुझाऊंगा.',
    placeholder: 'लीक, ब्लाउज डिजाइन, AC ठंडा नहीं...',
    nearest: 'नजदीकी बेहतर विकल्प',
    trends: 'टेलरिंग ट्रेंड आइडिया',
    speak: 'बोलें',
    send: 'AI से पूछें',
    fallback: 'मैं सेवा चुनने, नजदीकी वर्कर, कीमत और बुकिंग नोट्स में मदद कर सकता हूं.',
  },
  te: {
    title: 'AI సర్వీస్ గైడ్',
    intro: 'మీ సమస్య చెప్పండి. దగ్గరలో మంచి సర్వీస్ సూచిస్తాను.',
    placeholder: 'లీక్, బ్లౌజ్ డిజైన్, AC కూల్ కాదు...',
    nearest: 'దగ్గరలో బెస్ట్ మ్యాచ్',
    trends: 'టైలరింగ్ ట్రెండ్ ఐడియాస్',
    speak: 'మాట్లాడండి',
    send: 'AI అడగండి',
    fallback: 'సర్వీస్ ఎంపిక, దగ్గరి వర్కర్, ధర, బుకింగ్ నోట్స్ లో సహాయం చేస్తాను.',
  },
};

const tailoringIdeas = [
  'Boat neck blouse with contrast piping and elbow sleeves',
  'Maggam border with lightweight mirror work for silk sarees',
  'Princess-cut padded blouse with deep back tie-up',
  'Simple office-wear alteration with clean fall and steam finish',
];

function getNumericDistance(distance: string) {
  return Number(distance.replace(/[^0-9.]/g, '')) || 99;
}

function categoryFromProblem(problem: string) {
  const query = problem.toLowerCase();
  if (/(blouse|saree|stitch|tailor|design|dress|alter)/.test(query)) return 'tailoring';
  if (/(wash|laundry|iron|dry clean|shirt)/.test(query)) return 'laundry';
  if (/(leak|tap|pipe|drain|water)/.test(query)) return 'plumbing';
  if (/(wire|fan|light|switch|power|electric)/.test(query)) return 'electrical';
  if (/(wood|door|shelf|furniture|kitchen)/.test(query)) return 'carpentry';
  if (/(clean|bathroom|kitchen|sofa)/.test(query)) return 'cleaning';
  if (/(ac|cool|gas|air)/.test(query)) return 'ac-repair';
  if (/(paint|wall|texture|waterproof)/.test(query)) return 'painting';
  if (/(fridge|washing|machine|microwave|appliance)/.test(query)) return 'appliance-repair';
  if (/(pest|termite|cockroach|mosquito)/.test(query)) return 'pest-control';
  if (/(worker|helper|loading|shop|shift)/.test(query)) return 'daily-labour';
  if (/(construction|mason|tile|site|plaster)/.test(query)) return 'construction-labour';
  return null;
}

export function AiSupportBubble() {
  const { state, navigate } = useApp();
  const [open, setOpen] = useState(false);
  const [problem, setProblem] = useState('');
  const [language, setLanguage] = useState<AssistantLanguage>(state.authProfile?.language || 'en');
  const [answer, setAnswer] = useState('');
  const t = assistantText[language];

  const recommended = useMemo(() => {
    const category = categoryFromProblem(problem) || state.selectedCategory || 'tailoring';
    return [...state.professionals]
      .filter((professional) => professional.category === category)
      .sort((a, b) => (b.rating - a.rating) || (getNumericDistance(a.distance) - getNumericDistance(b.distance)))
      .slice(0, 3);
  }, [problem, state.professionals, state.selectedCategory]);

  const buildAnswer = () => {
    const top = recommended[0];
    if (!top) {
      setAnswer(t.fallback);
      return;
    }

    const category = state.categories.find((item) => item.id === top.category)?.name || top.category;
    const note = top.category === 'tailoring'
      ? ` Trending design: ${tailoringIdeas[Math.floor(Math.random() * tailoringIdeas.length)]}.`
      : '';
    const nextAnswer = `${t.nearest}: ${top.name}, ${category}, ${top.rating} stars, ${top.distance}, ${top.availability}.${note}`;
    setAnswer(nextAnswer);

    if ('speechSynthesis' in window) {
      const voice = new SpeechSynthesisUtterance(nextAnswer);
      voice.lang = speechLanguage[language];
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(voice);
    }
  };

  const startListening = () => {
    const Recognition = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!Recognition) {
      setAnswer('Voice input is not supported in this browser. Please type your problem.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = speechLanguage[language];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => setProblem(event.results[0][0].transcript);
    recognition.onerror = () => setAnswer('Could not hear clearly. Please try again.');
    recognition.start();
  };

  return (
    <div className="fixed bottom-24 right-4 z-[80] sm:bottom-6 sm:right-6">
      {open && (
        <div className="ai-assistant-panel mb-3 w-[min(92vw,360px)] rounded-3xl border border-white/10 bg-[#06111f]/95 p-4 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="ai-mini-mark">
                  <img src="/images/homefix-ai-orb.svg" alt="" className="h-full w-full object-contain" />
                </span>
                <h2 className="text-base font-black">{t.title}</h2>
              </div>
              <p className="mt-1 text-xs font-semibold text-[#94A3B8]">{t.intro}</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 text-[#94A3B8] tap-active-sm">
              <X size={17} />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            {(['en', 'hi', 'te'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setLanguage(item)}
                data-active={language === item}
                className="flex h-9 flex-1 items-center justify-center gap-1 rounded-full border border-white/10 text-xs font-black tap-active-sm"
                style={{ background: language === item ? 'rgba(78,205,196,0.18)' : 'rgba(255,255,255,0.04)' }}
              >
                <Languages size={13} />
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <textarea
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            placeholder={t.placeholder}
            className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white outline-none placeholder:text-[#64748B]"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={startListening} className="flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 text-xs font-black tap-active-sm">
              <Mic size={16} />
              {t.speak}
            </button>
            <button onClick={buildAnswer} className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#10B981] text-xs font-black tap-active-sm">
              <Send size={16} />
              {t.send}
            </button>
          </div>

          {answer && (
            <div className="mt-3 rounded-2xl border border-[#4ECDC4]/20 bg-[#4ECDC4]/10 p-3">
              <div className="flex items-start gap-2">
                <Volume2 size={16} color="#4ECDC4" />
                <p className="text-xs font-semibold leading-relaxed text-[#DDFCF8]">{answer}</p>
              </div>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">{t.nearest}</p>
            {recommended.map((professional) => (
              <button
                key={professional.id}
                onClick={() => navigate('proprofile', { professionalId: professional.id })}
                className="flex w-full items-center gap-3 rounded-2xl bg-white/5 p-2 text-left tap-active-sm"
              >
                <img src={professional.avatar} alt={professional.name} className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{professional.name}</p>
                  <p className="truncate text-[11px] text-[#94A3B8]">{professional.rating} stars - {professional.distance} - {professional.availability}</p>
                </div>
                <MapPin size={15} color="#4ECDC4" />
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        className="ai-orbit-button flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl tap-active-sm"
        title="Talk to AI support"
      >
        <img src="/images/homefix-ai-orb.svg" alt="AI support" className="relative z-10 h-12 w-12 object-contain" />
      </button>
    </div>
  );
}
