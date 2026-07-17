import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Paperclip, Send } from 'lucide-react';
import { useApp } from '../AppContext';
import { useToast } from '../hooks/useToast';
import { sendChatMessage } from '../lib/api';

export function ChatRoom() {
  const { state, goBack, dispatch } = useApp();
  const toast = useToast();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const threadId = state.navigationParams.threadId;
  const thread = state.chatThreads.find(t => t.id === threadId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages.length]);

  if (!thread) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center">
        <p className="text-sm" style={{ color: '#94A3B8' }}>Chat not found</p>
        <button onClick={goBack} className="mt-2 rounded-xl px-4 py-2 text-sm font-semibold selected-glow" style={{ color: '#FF6B5B', border: '1px solid rgba(255,107,91,0.35)' }}>Go Back</button>
      </div>
    );
  }

  const handleSend = () => {
    if (!inputText.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: state.user?.id || 'user-1',
      senderName: state.user?.name || 'Priya Menon',
      senderAvatar: state.user?.avatar || '/images/user-avatar.jpg',
      text: inputText.trim(),
      timestamp: timeStr,
      type: 'text' as const,
    };
    dispatch({ type: 'ADD_MESSAGE', threadId: thread.id, message: newMessage });
    void sendChatMessage(thread.id, newMessage).catch(() => undefined);
    setInputText('');
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-[100dvh] max-h-[100dvh] flex flex-col" style={{ background: '#000212' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ background: 'rgba(0, 2, 18, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={goBack} className="selected-glow tap-active rounded-xl p-2">
          <ArrowLeft size={22} color="white" />
        </button>
        <img src={thread.professionalAvatar} alt={thread.professionalName} className="w-8 h-8 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">{thread.professionalName}</h2>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" style={{ animation: 'pulse-online 2s infinite' }} />
            <span className="text-[10px]" style={{ color: '#64748B' }}>Online</span>
          </div>
        </div>
        <button onClick={() => toast.show('Call feature coming soon')} className="tap-active p-1">
          <Phone size={18} color="#94A3B8" />
        </button>
      </div>

      {/* Service Context Bar */}
      <div className="px-4 py-2 shrink-0" style={{ background: 'rgba(255, 107, 91, 0.08)' }}>
        <p className="text-[10px]" style={{ color: '#FF6B5B' }}>Regarding: {thread.serviceName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {thread.messages.map((msg, i) => {
          const isUser = msg.senderId === state.user?.id;
          const prevMsg = i > 0 ? thread.messages[i - 1] : null;
          const showAvatar = !isUser && (!prevMsg || prevMsg.senderId !== msg.senderId);
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[75%] ${isUser ? 'flex-row-reverse' : ''}`}>
                {showAvatar && (
                  <img src={msg.senderAvatar} alt={msg.senderName} className="w-6 h-6 rounded-full object-cover flex-shrink-0 self-end mb-1" />
                )}
                {!showAvatar && !isUser && <div className="w-6 flex-shrink-0" />}
                <div
                  className={`px-3.5 py-2.5 ${isUser ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'}`}
                  style={{
                    background: isUser ? '#FF6B5B' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <p className={`text-sm ${isUser ? 'text-white' : 'text-white'}`}>{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-2 flex items-center gap-2 shrink-0" style={{ background: 'rgba(0, 2, 18, 0.9)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => toast.show('File sharing coming soon')} className="tap-active p-2">
          <Paperclip size={20} color="#64748B" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 h-10 px-4 rounded-full text-sm text-white placeholder-[#64748B] outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="w-9 h-9 rounded-full flex items-center justify-center tap-active-sm disabled:opacity-40 flex-shrink-0"
          style={{ background: '#FF6B5B' }}
        >
          <Send size={14} color="white" />
        </button>
      </div>
    </div>
  );
}
