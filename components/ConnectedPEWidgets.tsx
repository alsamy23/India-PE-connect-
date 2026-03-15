
import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardCheck, RotateCcw, Timer, Dumbbell, Shuffle, Monitor, Trophy, Clock,
  Play, Pause, RotateCw, ChevronLeft, Plus, Trash2, Users, X, Check, Zap,
  Edit3, Layout, Calendar, Star, Save, Download
} from 'lucide-react';

// ─── Shared back button ───────────────────────────────────────────────────────
const BackBtn: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = 'Back to Widgets' }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 text-slate-400 hover:text-indigo-600 font-bold uppercase text-xs tracking-widest mb-6 transition-colors"
  >
    <ChevronLeft size={16} />
    <span>{label}</span>
  </button>
);

// ─── 1. Station Timer ─────────────────────────────────────────────────────────
const StationTimer: React.FC = () => {
  const [stations, setStations] = useState(6);
  const [workSec, setWorkSec] = useState(45);
  const [restSec, setRestSec] = useState(15);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (isWork) {
              setIsWork(false);
              return restSec;
            } else {
              const next = current + 1;
              if (next >= stations) { setRunning(false); setDone(true); return 0; }
              setCurrent(next);
              setIsWork(true);
              return workSec;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, isWork, current, stations, workSec, restSec]);

  const reset = () => { setRunning(false); setCurrent(0); setTimeLeft(workSec); setIsWork(true); setDone(false); };
  const start = () => { setTimeLeft(isWork ? workSec : restSec); setRunning(true); setDone(false); };

  return (
    <div className="space-y-6">
      {!running && !done ? (
        <div className="space-y-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">Configure Station Timer</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '# Stations', val: stations, set: setStations, min: 2, max: 20 },
              { label: 'Work (sec)', val: workSec, set: setWorkSec, min: 10, max: 300 },
              { label: 'Rest (sec)', val: restSec, set: setRestSec, min: 5, max: 120 },
            ].map(({ label, val, set, min, max }) => (
              <div key={label}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
                <input
                  type="number" min={min} max={max} value={val}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-xl text-center outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
          <button onClick={start} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
            <Play size={20} /> Start Timer
          </button>
        </div>
      ) : done ? (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[2rem] p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-3xl font-black text-emerald-800 mb-2">All Stations Done!</h3>
          <p className="text-emerald-600 mb-6 font-medium">{stations} stations completed</p>
          <button onClick={reset} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 mx-auto hover:bg-emerald-700 transition-all">
            <RotateCw size={18} /> Reset
          </button>
        </div>
      ) : (
        <div className={`rounded-[2rem] p-12 text-center text-white shadow-2xl ${isWork ? 'bg-indigo-600' : 'bg-orange-500'}`}>
          <p className="text-sm font-black uppercase tracking-widest mb-2 opacity-80">{isWork ? '🏃 WORK' : '😤 REST'}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-6 opacity-60">Station {current + 1} of {stations}</p>
          <div className="text-8xl font-black mb-8 tabular-nums">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setRunning(!running)} className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2">
              {running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Resume</>}
            </button>
            <button onClick={reset} className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <RotateCw size={18} /> Reset
            </button>
          </div>
          <div className="mt-8 flex gap-2 justify-center flex-wrap">
            {Array.from({ length: stations }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < current ? 'bg-white' : i === current ? 'bg-white ring-2 ring-white ring-offset-2 ring-offset-indigo-600' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 2. Workout Timer (HIIT) ──────────────────────────────────────────────────
const WorkoutTimer: React.FC = () => {
  const [rounds, setRounds] = useState(8);
  const [workSec, setWorkSec] = useState(40);
  const [restSec, setRestSec] = useState(20);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [isWork, setIsWork] = useState(true);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (isWork) { setIsWork(false); return restSec; }
            const next = currentRound + 1;
            if (next >= rounds) { setRunning(false); setDone(true); return 0; }
            setCurrentRound(next); setIsWork(true); return workSec;
          }
          return prev - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, isWork, currentRound, rounds, workSec, restSec]);

  const reset = () => { setRunning(false); setCurrentRound(0); setTimeLeft(workSec); setIsWork(true); setDone(false); };
  const percent = isWork ? ((workSec - timeLeft) / workSec) * 100 : ((restSec - timeLeft) / restSec) * 100;

  return (
    <div className="space-y-6">
      {!running && !done ? (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-slate-800 mb-6">HIIT / Workout Timer</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Rounds', val: rounds, set: setRounds, min: 1, max: 50 },
              { label: 'Work (sec)', val: workSec, set: setWorkSec, min: 5, max: 600 },
              { label: 'Rest (sec)', val: restSec, set: setRestSec, min: 0, max: 300 },
            ].map(({ label, val, set, min, max }) => (
              <div key={label}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
                <input type="number" min={min} max={max} value={val} onChange={e => set(Number(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-xl text-center outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            ))}
          </div>
          <button onClick={() => { setRunning(true); }} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all">
            <Zap size={20} /> Start HIIT
          </button>
        </div>
      ) : done ? (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-[2rem] p-12 text-center">
          <div className="text-6xl mb-4">💪</div>
          <h3 className="text-3xl font-black text-orange-800 mb-2">Workout Complete!</h3>
          <p className="text-orange-600 mb-6 font-medium">{rounds} rounds done! Great work!</p>
          <button onClick={reset} className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest mx-auto flex items-center gap-2 hover:bg-orange-700 transition-all"><RotateCw size={18} /> Reset</button>
        </div>
      ) : (
        <div className={`rounded-[2rem] p-12 text-center text-white ${isWork ? 'bg-orange-500' : 'bg-slate-700'}`}>
          <p className="text-sm font-black uppercase tracking-widest mb-1 opacity-80">{isWork ? '💥 WORK' : '😮‍💨 REST'}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-60">Round {currentRound + 1} / {rounds}</p>
          <div className="text-8xl font-black mb-4 tabular-nums">{timeLeft}</div>
          <div className="w-64 h-3 bg-white/20 rounded-full mx-auto mb-6 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setRunning(!running)} className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2">{running ? <><Pause size={18} />Pause</> : <><Play size={18} />Resume</>}</button>
            <button onClick={reset} className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2"><RotateCw size={18} />Reset</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 3. Run Lap Tap ───────────────────────────────────────────────────────────
const RunLapTap: React.FC = () => {
  const [runners, setRunners] = useState<{ name: string; laps: number[]; lastTap: number | null }[]>([
    { name: 'Runner 1', laps: [], lastTap: null },
    { name: 'Runner 2', laps: [], lastTap: null },
  ]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (running && startTime) {
      intervalRef.current = setInterval(() => setElapsed(Date.now() - startTime), 100);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running, startTime]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${String(Math.floor((ms % 1000) / 100))}`;
  };

  const tapRunner = (idx: number) => {
    if (!running) return;
    const now = Date.now();
    const lapTime = startTime ? now - startTime : 0;
    setRunners(prev => prev.map((r, i) => i === idx ? { ...r, laps: [...r.laps, lapTime], lastTap: lapTime } : r));
  };

  const addRunner = () => setRunners(prev => [...prev, { name: `Runner ${prev.length + 1}`, laps: [], lastTap: null }]);
  const removeRunner = (idx: number) => setRunners(prev => prev.filter((_, i) => i !== idx));
  const startStop = () => {
    if (!running) { setStartTime(Date.now() - elapsed); setRunning(true); }
    else setRunning(false);
  };
  const reset = () => { setRunning(false); setElapsed(0); setStartTime(null); setRunners(prev => prev.map(r => ({ ...r, laps: [], lastTap: null }))); };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-[2rem] p-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Elapsed Time</p>
        <div className="text-6xl font-black mb-6 tabular-nums text-emerald-400">{formatTime(elapsed)}</div>
        <div className="flex gap-3 justify-center">
          <button onClick={startStop} className={`px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 ${running ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'} transition-all`}>
            {running ? <><Pause size={18} />Stop</> : <><Play size={18} />Start</>}
          </button>
          <button onClick={reset} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all"><RotateCw size={18} />Reset</button>
          <button onClick={addRunner} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all"><Plus size={18} />Add Runner</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {runners.map((runner, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
              <input
                className="font-black text-indigo-900 bg-transparent outline-none flex-1 text-sm"
                value={runner.name}
                onChange={e => setRunners(prev => prev.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))}
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600">{runner.laps.length} laps</span>
                <button onClick={() => removeRunner(idx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <button
              onClick={() => tapRunner(idx)}
              disabled={!running}
              className="w-full py-8 text-center font-black text-2xl text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              TAP LAP
            </button>
            <div className="max-h-32 overflow-y-auto px-4 pb-4 space-y-1">
              {runner.laps.map((lap, i) => (
                <div key={i} className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Lap {i + 1}</span>
                  <span className="font-bold text-slate-800">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── 4. Spin It (Random Picker) ───────────────────────────────────────────────
const SpinIt: React.FC = () => {
  const [items, setItems] = useState(['Student 1', 'Student 2', 'Student 3', 'Student 4', 'Student 5']);
  const [newItem, setNewItem] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const COLORS = ['#6366f1', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  useEffect(() => {
    drawWheel();
  }, [items, rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const slice = (2 * Math.PI) / items.length;
    items.forEach((item, i) => {
      const start = rotation + i * slice;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + slice);
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(start + slice / 2);
      ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.min(14, 80 / items.length)}px Inter`;
      ctx.fillText(item.length > 12 ? item.substring(0, 12) + '…' : item, r - 10, 5);
      ctx.restore();
    });
    // Center
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff'; ctx.fill();
  };

  const spin = () => {
    if (spinning || items.length < 2) return;
    setSpinning(true); setResult(null);
    const extra = 5 * 2 * Math.PI + Math.random() * 2 * Math.PI;
    let start: number | null = null;
    const duration = 3000;
    const startRot = rotation;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 4);
      const cur = startRot + extra * ease;
      setRotation(cur);
      if (prog < 1) requestAnimationFrame(animate);
      else {
        const finalRot = ((cur % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const slice = (2 * Math.PI) / items.length;
        const idx = Math.floor(((2 * Math.PI - finalRot) % (2 * Math.PI)) / slice) % items.length;
        setResult(items[idx]); setSpinning(false);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-4">Items List</h3>
            <div className="flex gap-2 mb-4">
              <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && newItem.trim() && (setItems(p => [...p, newItem.trim()]), setNewItem(''))} placeholder="Add name/activity..." className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={() => newItem.trim() && (setItems(p => [...p, newItem.trim()]), setNewItem(''))} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors"><Plus size={16} /></button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                  </div>
                  <button onClick={() => setItems(p => p.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-3xl">▼</div>
            <canvas ref={canvasRef} width={260} height={260} className="rounded-full shadow-2xl cursor-pointer" onClick={spin} />
          </div>
          <button onClick={spin} disabled={spinning || items.length < 2} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-50 hover:bg-indigo-700 transition-all">
            {spinning ? '🎲 Spinning...' : '🎲 Spin!'}
          </button>
          {result && (
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl px-8 py-4 text-center animate-in zoom-in-95">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Selected</p>
              <p className="text-2xl font-black text-indigo-900">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── 5. Round Robin Tournament ────────────────────────────────────────────────
const RoundRobin: React.FC = () => {
  const [teams, setTeams] = useState(['Team A', 'Team B', 'Team C', 'Team D']);
  const [newTeam, setNewTeam] = useState('');
  const [fixtures, setFixtures] = useState<any[][] | null>(null);
  const [courts, setCourts] = useState(2);

  const generate = () => {
    const t = [...teams];
    if (t.length % 2 !== 0) t.push('BYE');
    const n = t.length, rounds: any[][] = [];
    const half = n / 2;
    const team = [...t];
    for (let r = 0; r < n - 1; r++) {
      const round: any[] = [];
      for (let i = 0; i < half; i++) {
        round.push({ home: team[i], away: team[n - 1 - i] });
      }
      rounds.push(round);
      const last = team.splice(n - 1, 1)[0];
      team.splice(1, 0, last);
    }
    setFixtures(rounds);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-800 mb-4">Teams / Players</h3>
        <div className="flex gap-2 mb-4">
          <input value={newTeam} onChange={e => setNewTeam(e.target.value)} onKeyDown={e => e.key === 'Enter' && newTeam.trim() && (setTeams(p => [...p, newTeam.trim()]), setNewTeam(''))} placeholder="Add team name..." className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500" />
          <button onClick={() => newTeam.trim() && (setTeams(p => [...p, newTeam.trim()]), setNewTeam(''))} className="px-4 py-2 bg-pink-600 text-white rounded-xl font-bold text-xs hover:bg-pink-700 transition-colors"><Plus size={16} /></button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {teams.map((t, i) => (
            <div key={i} className="flex items-center gap-1 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-xs font-bold">
              {t}
              <button onClick={() => setTeams(p => p.filter((_, j) => j !== i))} className="hover:text-red-600"><X size={12} /></button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mb-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courts/Pitches:</label>
          <input type="number" min={1} max={10} value={courts} onChange={e => setCourts(Number(e.target.value))} className="w-20 p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center outline-none" />
        </div>
        <button onClick={generate} disabled={teams.length < 2} className="w-full py-3 bg-pink-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          <Trophy size={18} /> Generate Fixtures
        </button>
      </div>

      {fixtures && (
        <div className="space-y-4">
          {fixtures.map((round, ri) => (
            <div key={ri} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-pink-600 px-6 py-3">
                <h4 className="font-black text-white text-sm uppercase tracking-widest">Round {ri + 1}</h4>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {round.filter(f => f.home !== 'BYE' && f.away !== 'BYE').map((f: any, fi: number) => (
                  <div key={fi} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 text-sm">{f.home}</span>
                    <span className="text-xs font-black text-pink-600 bg-pink-50 px-2 py-1 rounded-full">vs</span>
                    <span className="font-bold text-slate-800 text-sm">{f.away}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── 6. Skill Deck ────────────────────────────────────────────────────────────
const SKILL_DECKS: Record<string, { title: string; steps: string[] }> = {
  'Jump Rope Basics': {
    title: 'Jump Rope Basics',
    steps: [
      'Two-foot basic jump — steady rhythm, soft landing',
      'Alternate foot — like running in place',
      'Side swing — rope swings on each side',
      'Double under — rope passes twice per jump',
      'Backward jump — reverse rope direction',
    ],
  },
  'Dynamic Warm-Up': {
    title: 'Dynamic Warm-Up',
    steps: [
      'High knees — 20m across the field',
      'Butt kicks — 20m, kick heels to glutes',
      'Lateral shuffles — 10m each way × 2',
      'Arm circles — small to large, 10 each direction',
      'Hip openers — walking lunge with rotation',
    ],
  },
  'Bodyweight Challenge': {
    title: 'Bodyweight Challenge',
    steps: [
      '10 × Push-ups — full range of motion',
      '20 × Bodyweight squats — deep and controlled',
      '30 sec Plank hold — neutral spine',
      '15 × Jump squats — explode upward',
      '10 × Burpees — chest to floor',
    ],
  },
  'Balance & Coordination': {
    title: 'Balance & Coordination',
    steps: [
      'Single leg stand — 30 sec each leg',
      'Tandem walk — heel-to-toe along a line',
      'Single leg squat — 5 reps each side',
      'Balance board challenge — 60 sec',
      'Eyes closed balance — test proprioception',
    ],
  },
};

const SkillDeck: React.FC = () => {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [presenting, setPresenting] = useState(false);

  if (presenting && selectedDeck) {
    const deck = SKILL_DECKS[selectedDeck];
    const step = deck.steps[currentStep];
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white p-8 print:hidden">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{deck.title} — Skill {currentStep + 1} / {deck.steps.length}</p>
        <div className="text-center max-w-3xl">
          <div className="text-7xl font-black mb-8 leading-tight">{step}</div>
        </div>
        <div className="flex gap-4 mt-12">
          <button onClick={() => setCurrentStep(p => Math.max(0, p - 1))} disabled={currentStep === 0} className="px-8 py-4 bg-slate-700 rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-40 hover:bg-slate-600 transition-all flex items-center gap-2"><ChevronLeft size={18} />Prev</button>
          {currentStep < deck.steps.length - 1 ? (
            <button onClick={() => setCurrentStep(p => p + 1)} className="px-8 py-4 bg-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2">Next →</button>
          ) : (
            <button onClick={() => { setPresenting(false); setCurrentStep(0); }} className="px-8 py-4 bg-emerald-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"><Check size={18} />Done</button>
          )}
          <button onClick={() => { setPresenting(false); setCurrentStep(0); }} className="px-8 py-4 bg-red-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"><X size={18} />Exit</button>
        </div>
      </div>
    );
  }

  if (selectedDeck) {
    const deck = SKILL_DECKS[selectedDeck];
    return (
      <div className="space-y-4">
        <BackBtn onClick={() => setSelectedDeck(null)} label="Back to Skill Decks" />
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-black text-slate-800 mb-6">{deck.title}</h3>
          <div className="space-y-3 mb-8">
            {deck.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0">{i + 1}</span>
                <p className="text-slate-700 font-medium">{step}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { setCurrentStep(0); setPresenting(true); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
            <Monitor size={20} /> Present Full Screen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(SKILL_DECKS).map(([key, deck]) => (
        <button key={key} onClick={() => setSelectedDeck(key)} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl w-fit mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Monitor size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">{deck.title}</h3>
          <p className="text-sm text-slate-400">{deck.steps.length} progression steps</p>
          <div className="mt-4 text-[10px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-1">
            <Play size={12} /> Click to present
          </div>
        </button>
      ))}
    </div>
  );
};

// ─── 7. Easy Rubric ───────────────────────────────────────────────────────────
const EasyRubric: React.FC = () => {
  const [criteria, setCriteria] = useState<{ id: number; text: string; levels: string[] }[]>([
    { id: 1, text: 'Skill Technique', levels: ['Developing', 'Competent', 'Proficient', 'Exemplary'] },
    { id: 2, text: 'Game Sense', levels: ['Developing', 'Competent', 'Proficient', 'Exemplary'] },
    { id: 3, text: 'Participation', levels: ['Developing', 'Competent', 'Proficient', 'Exemplary'] },
  ]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [studentName, setStudentName] = useState('');

  const handleScore = (cid: number, levelIdx: number) => {
    setScores(prev => ({ ...prev, [cid]: levelIdx }));
  };

  const reset = () => {
    setScores({});
    setStudentName('');
  };

  const totalPoints = Object.values(scores).reduce((acc, curr) => acc + (curr + 1), 0);
  const maxPoints = criteria.length * 4;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-800">Student Rubric Assessment</h3>
        <input
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
          placeholder="Student Name..."
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="space-y-6">
          {criteria.map(c => (
            <div key={c.id} className="space-y-3">
              <p className="text-sm font-black text-slate-600 uppercase tracking-widest">{c.text}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {c.levels.map((level, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleScore(c.id, idx)}
                    className={`p-3 rounded-xl text-xs font-bold transition-all border-2 ${
                      scores[c.id] === idx
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {Object.keys(scores).length > 0 && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border-2 border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Total Score</p>
              <p className="text-2xl font-black text-indigo-900">{totalPoints} / {maxPoints}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={reset} className="p-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"><RotateCcw size={18} /></button>
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-200"><Save size={16} className="inline mr-2"/>Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── 8. SEPEP Planner ──────────────────────────────────────────────────────────
const SEPEPPlanner: React.FC = () => {
  const [unitName, setUnitName] = useState('Basketball Unit');
  const [teams, setTeams] = useState<string[]>(['Lakers', 'Bulls', 'Celtics', 'Heat']);
  const [newTeam, setNewTeam] = useState('');
  const [roles, setRoles] = useState(['Captain', 'Coach', 'Umpire', 'Scorer', 'Statistician', 'Equipment Manager']);

  const addTeam = () => {
    if (newTeam.trim()) {
      setTeams([...teams, newTeam.trim()]);
      setNewTeam('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-slate-800">SEPEP (Sport Education) Unit Setup</h3>
        
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Unit Name</label>
          <input
            value={unitName}
            onChange={e => setUnitName(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Teams List</label>
            <div className="flex gap-2 mb-4">
              <input 
                value={newTeam} 
                onChange={e => setNewTeam(e.target.value)}
                placeholder="New Team..." 
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
              />
              <button onClick={addTeam} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"><Plus size={20} /></button>
            </div>
            <div className="space-y-2">
              {teams.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-900 text-sm">{t}</span>
                  <button onClick={() => setTeams(teams.filter((_, idx) => idx !== i))} className="text-emerald-400 hover:text-red-500"><X size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Student Roles</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">{r}</span>
              ))}
            </div>
            <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white">
              <Calendar className="mb-4 text-emerald-400" size={32} />
              <h4 className="font-black text-lg mb-2">Generate Season</h4>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">Create a full seasonal fixture including semi-finals and grand finals for this SEPEP unit.</p>
              <button className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                <Check size={16} /> Create Season Fixures
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main ConnectedPE Widgets Component ───────────────────────────────────────
interface Widget {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  component: React.FC;
  credit?: string;
}

const WIDGETS: Widget[] = [
  { id: 'station', name: 'Station Timer', description: 'Manage class rotation stations with work/rest intervals.', icon: Timer, color: 'bg-indigo-500', component: StationTimer },
  { id: 'workout', name: 'Workout Timer', description: 'HIIT interval timer for circuits and fitness sessions.', icon: Dumbbell, color: 'bg-orange-500', component: WorkoutTimer },
  { id: 'rubric', name: 'Easy Rubric', description: 'Quickly assess students using pre-set rubrics and criteria.', icon: ClipboardCheck, color: 'bg-indigo-600', component: EasyRubric },
  { id: 'runlap', name: 'Run-Lap-Tap', description: 'Lap timer for tracking multiple runners simultaneously.', icon: Clock, color: 'bg-emerald-500', component: RunLapTap },
  { id: 'spinit', name: 'Spin It', description: 'Random picker wheel — names, teams, activities.', icon: Shuffle, color: 'bg-purple-500', component: SpinIt },
  { id: 'roundrobin', name: 'Round Robin', description: 'Generate tournament fixtures and schedules automatically.', icon: Trophy, color: 'bg-pink-500', component: RoundRobin },
  { id: 'skilldeck', name: 'Skill Deck', description: 'Full-screen skill progression display for the class.', icon: Monitor, color: 'bg-teal-500', component: SkillDeck },
  { id: 'sepep', name: 'SEPEP Planner', description: 'Comprehensive management for Sport Education Sport Unit units.', icon: Calendar, color: 'bg-emerald-600', component: SEPEPPlanner },
];

const ConnectedPEWidgets: React.FC = () => {
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);

  if (selectedWidget) {
    const WidgetComponent = selectedWidget.component;
    return (
      <div className="space-y-6 pb-20 animate-in slide-in-from-right-10 duration-500">
        <BackBtn onClick={() => setSelectedWidget(null)} />
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 ${selectedWidget.color} text-white rounded-2xl shadow-lg`}>
            <selectedWidget.icon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">{selectedWidget.name}</h2>
            <p className="text-sm text-slate-400">{selectedWidget.description}</p>
          </div>
        </div>
        <WidgetComponent />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20 mb-6 backdrop-blur-md">
            <Zap size={14} className="text-orange-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Free PE Classroom Widgets</span>
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tighter leading-none">Essential PE<br /><span className="text-orange-400">Classroom Tools.</span></h2>
          <p className="text-indigo-200 text-base mb-4 leading-relaxed font-medium">
            8 interactive tools for daily PE use. Timers, assessment tools, pickers, tournament generators — all offline-ready.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Inspired by</span>
            <a href="https://connectedpe.com/widgets/" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white transition-colors underline">ConnectedPE.com</a>
          </div>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WIDGETS.map(widget => (
          <button
            key={widget.id}
            onClick={() => setSelectedWidget(widget)}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group text-left flex flex-col items-start"
          >
            <div className={`p-4 rounded-2xl ${widget.color} text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
              <widget.icon size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{widget.name}</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">{widget.description}</p>
          </button>
        ))}
      </div>

      {/* Credit Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-black text-indigo-900 text-sm">ConnectedPE Widgets</p>
          <p className="text-xs text-indigo-600 mt-0.5">These tools are inspired by ConnectedPE.com — a global platform for PE teachers.</p>
        </div>
        <a
          href="https://connectedpe.com/widgets/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          Visit Site →
        </a>
      </div>
    </div>
  );
};

export default ConnectedPEWidgets;
