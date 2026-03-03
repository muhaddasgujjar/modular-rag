import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, MessageSquare, Plus, Send, RefreshCw, Cpu, Database, CloudRain, Github, ShieldAlert, PanelLeftClose, PanelLeftOpen, Settings, Zap, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '../hooks/useChat';

// Helper function to render the correct subtle tool icon
const renderToolIcon = (toolName) => {
  if (!toolName || toolName === 'none') return null;

  const iconProps = { size: 14, className: "text-slate-400 ml-2" };

  switch (toolName) {
    case 'rag_tool':
      return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400"><Database {...iconProps} className="text-blue-500" size={12} /> Salesforce RAG</div>;
    case 'weather_tool':
      return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-medium text-sky-400"><CloudRain {...iconProps} className="text-sky-500" size={12} /> Weather API</div>;
    case 'github_tool':
      return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-[10px] font-medium text-slate-300"><Github {...iconProps} className="text-slate-400" size={12} /> GitHub API</div>;
    case 'out_of_bounds':
      return <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-medium text-rose-400"><ShieldAlert {...iconProps} className="text-rose-500" size={12} /> Guardrail Triggered</div>;
    default:
      return null;
  }
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const { messages, isLoading, sendMessage, newChat, sessionId } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  // Chat session history — stores past sessions
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Auto-close sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scrolling logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // When messages change and we have some, update the active session preview
  useEffect(() => {
    if (messages.length > 0 && sessionId) {
      const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'New conversation';
      const preview = firstUserMsg.slice(0, 45) + (firstUserMsg.length > 45 ? '...' : '');
      setChatSessions(prev => {
        const exists = prev.find(s => s.id === sessionId);
        if (exists) {
          return prev.map(s => s.id === sessionId ? { ...s, preview, updatedAt: new Date() } : s);
        } else {
          return [{ id: sessionId, preview, createdAt: new Date(), updatedAt: new Date() }, ...prev];
        }
      });
      setActiveSessionId(sessionId);
    }
  }, [messages, sessionId]);

  const handleNewChat = () => {
    newChat();
    setInputValue('');
    // On mobile, close sidebar after starting new chat
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[5] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Aesthetic */}
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:relative md:translate-x-0 z-10 ${sidebarOpen ? 'md:w-[260px]' : 'md:w-0'
          } w-[260px] h-full transition-all duration-300 ease-in-out bg-[#020617] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/50`}
      >
        <div className="p-3 flex items-center justify-between gap-1">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-200 hover:bg-[#1e293b] rounded-lg transition shrink-0"
            title="Close sidebar"
          >
            <PanelLeftClose size={20} />
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 flex-1 px-3 py-2 bg-transparent hover:bg-[#1e293b] rounded-lg transition text-sm text-left group border border-transparent hover:border-slate-800 shadow-sm"
            title="New chat"
          >
            <span className="font-medium truncate text-slate-200 flex-1">New chat</span>
            <Plus size={18} className="text-slate-500 group-hover:text-indigo-400 transition shrink-0" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 mt-2 sidebar-scrollbar">
          {chatSessions.length === 0 ? (
            <div className="px-2 py-8 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <MessageCircle size={18} className="text-slate-500" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">No chats yet.<br />Send a message to get started.</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-slate-500 px-2 mb-2 tracking-wide uppercase">Recent</p>
              <div className="space-y-1">
                {chatSessions.map((session) => (
                  <button
                    key={session.id}
                    className={`flex items-start gap-2 w-full px-3 py-2.5 rounded-lg text-left transition text-sm ${session.id === activeSessionId
                        ? 'bg-[#1e293b] border border-slate-800 text-indigo-300'
                        : 'hover:bg-[#1e293b] text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                  >
                    <MessageSquare size={14} className="shrink-0 mt-0.5 opacity-60" />
                    <span className="truncate leading-snug">{session.preview}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800/50">
          <button className="flex items-center gap-3 w-full px-2 py-2.5 rounded-xl hover:bg-[#1e293b] transition text-left group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md ring-2 ring-indigo-500/20">
              S
            </div>
            <div className="flex-1 truncate relative">
              <span className="text-sm font-semibold text-slate-200 block truncate leading-tight">Salesforce Admin</span>
              <span className="text-[11px] text-indigo-400 font-medium block truncate mt-0.5 flex items-center gap-1">
                <Zap size={10} className="text-yellow-400" /> Enterprise Plan
              </span>
            </div>
            <Settings size={16} className="text-slate-500 shrink-0 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a] z-10 transition-all duration-300 relative">

        {/* Minimalist Header */}
        <header className="h-14 flex items-center px-4 shrink-0 select-none absolute top-0 left-0 right-0 z-20 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800/50 shadow-sm">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#1e293b] transition"
              title="Open sidebar"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 -ml-2 mr-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-[#1e293b] transition md:hidden"
              title="Close sidebar"
            >
              <PanelLeftClose size={20} />
            </button>
          )}
          <div className="flex-1 flex justify-center items-center gap-2">
            <span className="font-semibold text-slate-300 text-sm">Modular RAG <span className="text-indigo-400/80 font-normal">Salesforce Architect</span></span>
          </div>
        </header>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto w-full pt-14 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-500/20 border border-indigo-400/30">
                <Cpu size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-8 max-w-md text-center">How can I help with your Salesforce architecture today?</h2>
            </div>
          ) : (
            <div className="w-full">
              {messages.map((msg, index) => (
                <div key={index} className={`w-full ${msg.role === 'ai' ? 'bg-[#1e293b]/30 border-y border-slate-800/50' : 'bg-transparent'}`}>
                  <div className="max-w-3xl mx-auto flex gap-4 md:gap-6 px-4 py-6 md:py-8">

                    {/* Avatar */}
                    <div className="shrink-0 pt-1">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                          <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 border border-indigo-400/30">
                          <Cpu size={18} />
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 flex flex-col items-start">

                      {/* Optional Name Header for AI */}
                      {msg.role === 'ai' && (
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-slate-200 text-sm">Modular RAG</span>
                          {renderToolIcon(msg.tool_used)}
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="font-semibold text-slate-300 text-sm">You</span>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className={`prose prose-sm md:prose-base prose-invert prose-slate max-w-none text-slate-300 leading-relaxed ${msg.role === 'user' ? 'whitespace-pre-wrap text-slate-200' : ''}`}>
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="w-full bg-[#1e293b]/30 border-y border-slate-800/50">
                  <div className="max-w-3xl mx-auto flex gap-4 md:gap-6 px-4 py-6 md:py-8">
                    <div className="shrink-0 pt-1">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md border border-indigo-400/30">
                        <Cpu size={18} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex items-center">
                      <div className="flex gap-1.5 items-center justify-center h-6 pl-1">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-24 md:h-32" />
            </div>
          )}
        </div>

        {/* Input Area - Absolute positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 pt-6 pb-6 px-4 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent">
          <div className="max-w-3xl mx-auto relative group">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="w-full max-h-48 min-h-[56px] bg-[#1e293b] border border-slate-700 rounded-2xl pl-5 pr-14 py-4 resize-none shadow-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-200 transition-all disabled:bg-[#1e293b]/50 disabled:text-slate-500 placeholder-slate-500"
              placeholder="Message Modular RAG..."
              rows="1"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`absolute right-2.5 bottom-2.5 p-2 rounded-xl transition-all flex items-center justify-center
                ${!inputValue.trim() || isLoading
                  ? 'bg-slate-800 text-slate-600'
                  : 'bg-indigo-600 shadow-md shadow-indigo-500/25 text-white hover:bg-indigo-500 hover:-translate-y-0.5'
                }`}
            >
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} className={`${inputValue.trim() && !isLoading ? 'ml-0.5' : ''}`} />}
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-500 mt-3 font-medium tracking-wide">
            Modular RAG can make mistakes. Consider verifying critical architecture choices.
          </p>
        </div>

      </div>
    </div>
  );
}

export default App;
