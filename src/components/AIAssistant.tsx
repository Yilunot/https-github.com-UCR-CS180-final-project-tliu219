import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, X, MessageSquare, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getArrowAdvice, Message } from '../services/geminiService';

interface AIAssistantProps {
  config: {
    bow_type: string;
    draw_weight: number;
    draw_length: number;
    arrow_length: number;
    point_weight: number;
    spine: number;
  };
}

export default function AIAssistant({ config }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your Archery AI Coach. Ask me anything about your current arrow setup or how to improve your consistency." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const response = await getArrowAdvice(userMessage, messages, config);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#151619] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#dcfc44] flex items-center justify-center">
            <Bot size={18} className="text-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">Archery AI Coach</h3>
            <span className="text-[10px] font-mono text-[#dcfc44] uppercase tracking-wider">Online & Analyzing</span>
          </div>
        </div>
        <Sparkles size={16} className="text-[#dcfc44]/50" />
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide scroll-smooth"
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${message.role === 'user' ? 'bg-white/10' : 'bg-[#dcfc44]/10 border border-[#dcfc44]/20'}`}>
                {message.role === 'user' ? <User size={14} className="text-gray-400" /> : <Bot size={14} className="text-[#dcfc44]" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm ${
                message.role === 'user' 
                  ? 'bg-white/5 border border-white/10 text-gray-200 rounded-tr-none' 
                  : 'bg-white/[0.02] border border-white/5 text-gray-300 rounded-tl-none'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#dcfc44]/10 border border-[#dcfc44]/20 flex items-center justify-center">
                <Loader2 size={14} className="text-[#dcfc44] animate-spin" />
              </div>
              <div className="px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1 h-1 bg-[#dcfc44] rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1 h-1 bg-[#dcfc44] rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1 h-1 bg-[#dcfc44] rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 pt-0">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your coach..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#dcfc44]/50 focus:ring-1 focus:ring-[#dcfc44]/20 transition-all group-hover:border-white/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1.5 p-2.5 rounded-xl bg-[#dcfc44] text-black hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] font-mono text-gray-500 mt-3 text-center uppercase tracking-widest opacity-50">
          Powered by Gemini AI • Contextual Analysis Active
        </p>
      </div>
    </div>
  );
}
