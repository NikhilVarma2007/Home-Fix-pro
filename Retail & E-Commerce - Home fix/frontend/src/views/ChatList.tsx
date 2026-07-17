import { useRef } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { useApp } from '../AppContext';
import { useScrollVelocitySkew } from '../hooks/useScrollVelocitySkew';

export function ChatList() {
  const { state, navigate } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollVelocitySkew(scrollRef);

  return (
    <div ref={scrollRef} className="scroll-frame pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0, 2, 18, 0.85)', backdropFilter: 'blur(16px)' }}>
        <h1 className="text-xl font-bold text-white">Messages</h1>
        <button className="tap-active p-1">
          <Search size={20} color="#94A3B8" />
        </button>
      </div>

      <div data-skew className="pt-2">
        {state.chatThreads.length > 0 ? (
          <div>
            {state.chatThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => navigate('chatroom', { threadId: thread.id })}
                className="w-full px-4 py-3 flex items-start gap-3 text-left tap-active"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="relative flex-shrink-0 self-center">
                  <img src={thread.professionalAvatar} alt={thread.professionalName} className="w-12 h-12 rounded-full object-cover" />
                  {thread.unread > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm ${thread.unread > 0 ? 'font-semibold text-white' : 'font-medium text-white'}`}>{thread.professionalName}</h3>
                    <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#64748B' }}>{thread.lastMessageTime}</span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>{thread.serviceName}</p>
                  <p className={`text-xs mt-0.5 truncate ${thread.unread > 0 ? 'text-white font-medium' : ''}`} style={{ color: thread.unread > 0 ? undefined : '#94A3B8' }}>
                    {thread.lastMessage}
                  </p>
                </div>
                {thread.unread > 0 && (
                  <div className="flex-shrink-0 self-center w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: '#FF6B5B' }}>
                    {thread.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <MessageSquare size={48} color="#64748B" />
            <p className="text-base font-semibold mt-4" style={{ color: '#94A3B8' }}>No messages yet</p>
            <p className="text-sm mt-1" style={{ color: '#64748B' }}>Start chatting after booking a service</p>
          </div>
        )}
      </div>
    </div>
  );
}
