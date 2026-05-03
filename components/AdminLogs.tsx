
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppErrorLog } from '../services/logService';
import { Terminal, AlertCircle, Clock, Globe, User, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AppErrorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'system_logs'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const docs = snapshot.docs.map(doc => {
          const data = doc.data();
          // Ensure we don't crash if data is corrupted
          return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp
          };
        }) as any[];
        setLogs(docs);
      } catch (err) {
        console.error("Error processing logs snapshot:", err);
      }
      setLoading(false);
    }, (error) => {
      console.warn("Log monitor failed to connect:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'react_error': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'promise_rejection': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
            <Terminal size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">System Monitoring</h1>
            <p className="text-slate-500 font-medium text-sm">Real-time error logs from users</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 animate-pulse">
          Monitoring {logs.length} Total Logs
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl font-black uppercase tracking-tight">How to use this Monitor</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              This panel captures errors from <strong>all users</strong> in real-time. Use it to verify if your teachers are facing issues. 
              If you see many "Quota" errors, it means your AI keys need upgrading. 
              If you see "Permission Denied", please check your School Admin settings.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/5 text-center">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Teacher Reports</span>
              <span className="text-2xl font-black">{logs.filter(l => l.userEmail).length}</span>
            </div>
            <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/5 text-center">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Errors</span>
              <span className="text-2xl font-black text-rose-400">{logs.filter(l => l.type === 'react_error').length}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center">
          <p className="text-slate-400 font-bold">No errors reported yet. Everything looks smooth!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {logs.map((log: any) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getTypeColor(log.type)}`}>
                      {log.type?.replace('_', ' ')}
                    </span>
                    <div className="flex items-center text-slate-400 text-xs font-medium">
                      <Clock size={12} className="mr-1.5" />
                      {log.timestamp && typeof log.timestamp.toDate === 'function' 
                        ? log.timestamp.toDate().toLocaleString() 
                        : log.timestamp 
                          ? new Date(log.timestamp).toLocaleString()
                          : 'Just now'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">
                    <Globe size={10} />
                    <span className="truncate max-w-[200px]">{log.url}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertCircle size={20} className="text-rose-500 shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{log.message}</h3>
                    {log.userEmail && (
                      <div className="flex items-center text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-2">
                        <User size={10} className="mr-1" />
                        User: {log.userEmail}
                      </div>
                    )}
                    {log.stack && (
                      <div className="mt-3 bg-slate-900 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-[10px] font-mono text-slate-300 leading-relaxed">
                          {log.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
