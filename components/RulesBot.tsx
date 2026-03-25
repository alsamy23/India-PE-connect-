
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Book, User, Bot, Loader2 } from 'lucide-react';
import { getSportsRule } from '../services/geminiService.ts';
import { Language } from '../types.ts';

const RulesBot: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    {role: 'bot', text: 'Namaste! I am your Sports Rule Assistant. Ask me about Kabaddi, Kho-Kho, or any major sport rules.'}
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sport, setSport] = useState('Kabaddi');
  const [language, setLanguage] = useState<Language>('English');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setLoading(true);

    try {
      const response = await getSportsRule(sport, userMsg, language);
      setMessages(prev => [...prev, {role: 'bot', text: response || "I couldn't find information on that rule."}]);
    } catch (e) {
      setMessages(prev => [...prev, {role: 'bot', text: "Sorry, I couldn't verify that rule right now."}]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-indigo-900 p-6 flex justify-between items-center text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500 rounded-xl">
             <Book size={20} />
          </div>
          <div>
            <h3 className="font-black text-lg">Rule Book Engine</h3>
            <p className="text-xs text-indigo-200">Official Regulations Database</p>
          </div>
        </div>
        <div className="flex gap-2">
           <select className="bg-indigo-800 text-sm rounded-lg px-3 py-1 outline-none" value={sport} onChange={e => setSport(e.target.value)}>
             <option>Kabaddi</option>
             <option>Kho-Kho</option>
             <option>Cricket</option>
             <option>Football</option>
             <option>Volleyball</option>
           </select>
           <select className="bg-indigo-800 text-sm rounded-lg px-3 py-1 outline-none" value={language} onChange={e => setLanguage(e.target.value as any)}>
             <option value="English">ENG</option>
             <option value="Hindi">HIN</option>
             <option value="Marathi">MAR</option>
             <option value="Tamil">TAM</option>
           </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
            }`}>
               <div className="flex items-center space-x-2 mb-1 opacity-70">
                 {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                 <span className="text-[10px] font-bold uppercase">{m.role}</span>
               </div>
               <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100">
                <Loader2 className="animate-spin text-indigo-600" size={20} />
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <input 
            className="flex-1 bg-transparent px-4 py-2 outline-none font-medium text-slate-700"
            placeholder={`Ask a specific rule about ${sport}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesBot;
