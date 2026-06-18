import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { axiosInstance } from '../api/axiosInstance';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [hasUnread, setHasUnread] = useState(false);

  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const chatbotRef = useRef(null);

  // Suggestions for empty state
  const suggestions = [
    "🏖️ Beach resorts",
    "💰 Budget stays",
    "🏊 Hotels with pool",
    "🌄 Hill stations"
  ];

  // Initialize Session ID
  useEffect(() => {
    setSessionId(crypto.randomUUID());
  }, []);

  // Auto Scroll to Bottom when messages or loading state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle Unread status logic
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  // Close chatbot when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/chat/message', {
        message: textToSend,
        sessionId: sessionId
      });

      const aiMessage = {
        id: crypto.randomUUID(),
        text: response.data.reply,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: crypto.randomUUID(),
        text: "Oops! I'm having trouble connecting. Please try again. 🔄",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <>
      {/* Self-contained CSS Animations */}
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.4; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes bounceDot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-heartbeat {
          animation: heartbeat 2s infinite ease-out;
        }
        .animate-blink {
          animation: blink 4s infinite ease-in-out;
        }
        .animate-bounce-dot {
          animation: bounceDot 1.2s infinite ease-in-out;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Floating Chat Button */}
      <div ref={chatbotRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Chat Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mb-4 w-[380px] h-[520px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden border border-gray-100 max-md:fixed max-md:bottom-0 max-md:right-0 max-md:w-screen max-md:max-w-none max-md:h-[85vh] max-md:max-h-none max-md:rounded-t-[24px] max-md:rounded-b-none max-md:mb-0"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#FF385C] to-[#7C3AED] p-4 text-white flex items-center justify-between shadow-lg relative z-10">
                <div className="flex items-center space-x-3">
                  {/* Animated AI Bot Face */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-200 to-indigo-100 flex items-center justify-center relative shadow-inner">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-blink origin-center"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-blink origin-center"></div>
                    </div>
                    <div className="w-3.5 h-1.5 border-b-2 border-[#7C3AED] rounded-b-full absolute bottom-2.5"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight flex items-center">
                      StayEase AI <Sparkles className="w-3 h-3 ml-1 text-yellow-300 fill-yellow-300 animate-pulse" />
                    </h3>
                    <p className="text-xs text-white/70">Your travel assistant</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Body Guarded by Auth */}
              <div className="flex-grow flex flex-col min-h-0 bg-gray-55/50">
                {!accessToken ? (
                  /* Auth Required State */
                  <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#FF385C]/10 flex items-center justify-center text-[#FF385C]">
                      <Bot className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-base">Please login to chat with our AI assistant 🤖</h3>
                    <p className="text-xs text-gray-500 max-w-[240px]">
                      Log in to ask about active hotels, room details, amenities, and current pricing estimates.
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/login');
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#FF385C] to-[#7C3AED] text-white rounded-xl font-medium text-xs hover:opacity-90 active:scale-95 transition-all shadow-md"
                    >
                      Login Now
                    </button>
                  </div>
                ) : (
                  /* Chat Messages Area */
                  <div className="flex-grow flex flex-col min-h-0">
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        /* Staggered Animated Empty/Suggestions State */
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="show"
                          className="flex flex-col items-center justify-center min-h-full text-center p-6 space-y-6"
                        >
                          {/* Large Animated Bot Avatar */}
                          <motion.div
                            variants={itemVariants}
                            className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#FF385C] flex items-center justify-center relative shadow-lg"
                          >
                            <div className="flex gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-white animate-blink origin-center shadow-sm"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-white animate-blink origin-center shadow-sm"></div>
                            </div>
                            <div className="w-6 h-2 border-b-2 border-white rounded-b-full absolute bottom-4"></div>
                          </motion.div>

                          {/* Text & Subtext */}
                          <motion.div variants={itemVariants}>
                            <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-tight">
                              Hi! I'm your StayEase AI 👋
                            </h3>
                            <p className="text-xs text-gray-550 mt-2 max-w-[240px] leading-relaxed">
                              Ask me to find hotels, compare options, or plan your trip!
                            </p>
                          </motion.div>

                          {/* Quick suggestion chips: horizontal scroll on mobile, 2x2 grid on desktop */}
                          <motion.div
                            variants={itemVariants}
                            className="flex md:grid md:grid-cols-2 gap-2 w-full overflow-x-auto md:overflow-x-visible whitespace-nowrap pb-2 md:pb-0 scrollbar-none"
                          >
                            {suggestions.map((s) => (
                              <motion.button
                                key={s}
                                whileHover={{ scale: 1.05, borderColor: '#7C3AED' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSuggestionClick(s)}
                                className="px-3 py-2 bg-white hover:bg-purple-50 border border-gray-150 hover:border-purple-200 rounded-xl text-xs text-gray-700 hover:text-[#7C3AED] font-semibold transition-all text-left shadow-sm truncate flex-shrink-0 cursor-pointer"
                              >
                                {s}
                              </motion.button>
                            ))}
                          </motion.div>
                        </motion.div>
                      ) : (
                        /* Message List */
                        messages.map((msg) => {
                          const isUser = msg.sender === 'user';
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
                              animate={{ opacity: 1, x: 0, y: 0 }}
                              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`px-4 py-2.5 text-sm shadow-sm ${
                                  isUser
                                    ? 'bg-[#FF385C] text-white rounded-[18px_18px_4px_18px]'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-[18px_18px_18px_4px]'
                                } max-w-[80%] break-words`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                            </motion.div>
                          );
                        })
                      )}

                      {/* Typing Indicator */}
                      {isLoading && (
                        <div className="flex justify-start items-start">
                          <div className="bg-white border border-gray-100 px-4 py-3 rounded-[18px_18px_18px_4px] flex items-center space-x-1 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-dot" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 flex items-end space-x-2">
                      <textarea
                        rows={1}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        disabled={isLoading}
                        className="flex-grow resize-none max-h-24 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all disabled:opacity-50 min-h-[40px]"
                        style={{ height: 'auto' }}
                      />
                      <button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={isLoading || !inputValue.trim()}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF385C] to-[#7C3AED] flex items-center justify-center text-white cursor-pointer hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 bg-gradient-to-br from-[#FF385C] to-[#7C3AED] text-white z-50 focus:outline-none"
        >
          {/* Heartbeat pulse rings */}
          {!isOpen && (
            <>
              <div className="w-full h-full rounded-full absolute top-0 left-0 bg-[#FF385C]/40 animate-heartbeat -z-10"></div>
              <div className="w-full h-full rounded-full absolute top-0 left-0 bg-[#7C3AED]/30 animate-heartbeat -z-10" style={{ animationDelay: '0.5s' }}></div>
            </>
          )}

          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
          ) : (
            <Bot className="w-6 h-6 transition-transform duration-300" />
          )}

          {/* Unread dot indicator */}
          {hasUnread && !isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>
    </>
  );
}
