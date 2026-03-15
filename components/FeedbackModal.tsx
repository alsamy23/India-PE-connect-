import React, { useState } from 'react';
import { X, MessageSquare, Star, Send, CheckCircle2, Mail, AlertTriangle, Lightbulb, Bug, Heart } from 'lucide-react';

const FEEDBACK_EMAIL = 'smartpeindia3@gmail.com';

type FeedbackType = 'suggestion' | 'bug' | 'compliment' | 'complaint';

const typeConfig: Record<FeedbackType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  suggestion: { label: 'Suggestion', icon: <Lightbulb size={16} />, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  bug: { label: 'Bug / Error', icon: <Bug size={16} />, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  compliment: { label: 'Compliment', icon: <Heart size={16} />, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200' },
  complaint: { label: 'Complaint', icon: <AlertTriangle size={16} />, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
};

const FeedbackModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState<'form' | 'sent'>('form');
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;

    const subject = `SmartPE India Feedback: ${typeConfig[type].label}${rating ? ` (${rating}/5 stars)` : ''}`;
    const body = `Type: ${typeConfig[type].label}
Rating: ${rating ? `${rating}/5 stars` : 'Not rated'}
From: ${name || 'Anonymous'}
School: ${school || 'Not specified'}

Message:
${message}

---
Sent from SmartPE India App`;

    window.open(
      `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );
    setStep('sent');
  };

  if (step === 'sent') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center animate-slide-up">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Thank You! 🙏</h3>
          <p className="text-slate-500 mb-2">Your feedback helps us improve SmartPE India for all PE teachers across India.</p>
          <p className="text-xs text-slate-400 mb-8">Your email client should have opened. If not, email us directly at <span className="text-indigo-600 font-bold">{FEEDBACK_EMAIL}</span></p>
          <button onClick={onClose} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black">Feedback & Support</h2>
              <p className="text-indigo-200 text-xs">Help us build a better platform for India's PE teachers</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Type selector */}
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">Type of Feedback</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(typeConfig) as [FeedbackType, typeof typeConfig[FeedbackType]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    type === key ? `${cfg.bg} border-current ${cfg.color}` : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className={type === key ? cfg.color : 'text-slate-400'}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">Rate the App</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-slate-500 font-medium self-center ml-2">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* Name & School */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1 block">Your Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mr. Samy" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1 block">School / City</label>
              <input value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. Chennai" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-1 block">Your Message *</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Tell us what you think, what's not working, or what you'd love to see added..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Direct email */}
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2">
            <Mail size={16} className="text-indigo-600 flex-shrink-0" />
            <p className="text-xs text-indigo-700">
              Or email us directly: <a href={`mailto:${FEEDBACK_EMAIL}`} className="font-black underline">{FEEDBACK_EMAIL}</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Send size={16} /> Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
