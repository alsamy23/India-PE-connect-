import React, { useState } from 'react';
import { X, ShieldAlert, Mail, MessageSquare } from 'lucide-react';

const Disclaimer: React.FC<{ onFeedback?: () => void }> = ({ onFeedback }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-slate-300 p-3 z-50 border-t border-slate-700 shadow-2xl print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <ShieldAlert className="text-orange-500 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-[11px] font-medium leading-relaxed">
            <strong className="text-white">SmartPE India</strong> is an independent educational tool and is{' '}
            <span className="text-orange-400 font-bold">NOT affiliated</span> with CBSE, NCERT, Khelo India or Ministry of Sports.
            AI content should be verified before use in schools. |{' '}
            <a href="mailto:smartpeindia3@gmail.com" className="text-indigo-400 underline hover:text-indigo-300 font-bold">smartpeindia3@gmail.com</a>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onFeedback && (
            <button
              onClick={onFeedback}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
            >
              <MessageSquare size={12} /> Feedback
            </button>
          )}
          <a
            href="mailto:smartpeindia3@gmail.com"
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
          >
            <Mail size={12} /> Write to Us
          </a>
          <button
            onClick={() => setVisible(false)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
