import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Settings, 
  Play, 
  Square, 
  Layout, 
  Clock, 
  Download, 
  Camera as CameraIcon,
  Video,
  Info,
  RefreshCw,
  Maximize2,
  Trash2,
  Share2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SkillAnalysis: React.FC = () => {
  const [delay, setDelay] = useState(10); // Default 10s delay
  const [numScreens, setNumScreens] = useState(1);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const isMounted = useRef(true);
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const livePreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const playbackTimeoutRefs = useRef<any[]>([]);
  const videoUrlsRef = useRef<string[]>([]);
  const mediaSources = useRef<(MediaSource | null)[]>([]);
  const sourceBuffers = useRef<(SourceBuffer | null)[]>([]);
  const queueRefs = useRef<ArrayBuffer[][]>([]);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopCamera();
    };
  }, []);

  // Handle live preview stream assignment when isLive changes
  useEffect(() => {
    if (isLive && streamRef.current && livePreviewRef.current) {
      const video = livePreviewRef.current;
      video.srcObject = streamRef.current;
      video.play().catch(e => console.warn("Monitor play silently failed:", e.message));
    }
  }, [isLive]);

  const [bufferingCount, setBufferingCount] = useState<number[]>([]);

  useEffect(() => {
    if (!isLive) {
      setBufferingCount([]);
      return;
    }
    
    // Initialize buffering counts for each screen
    const initialCounts = Array.from({ length: numScreens }).map((_, i) => delay + (i * 5));
    setBufferingCount(initialCounts);

    const interval = setInterval(() => {
      setBufferingCount(prev => prev.map(c => Math.max(0, c - 1)));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, numScreens, delay]);

  const startCamera = async () => {
    if (isLive || isCameraLoading) return;
    setIsCameraLoading(true);
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser does not support camera access.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        }, 
        audio: false 
      });

      if (!isMounted.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      setIsLive(true);
      
      // Delay source setup slightly to ensure video elements are rendered
      setTimeout(() => {
        if (isMounted.current && streamRef.current) {
          setupMediaSources();
          startDelayedBuffering(streamRef.current);
        }
      }, 500);
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (isMounted.current) {
        setError(`Camera Error: ${err.message || 'Access Denied'}`);
      }
    } finally {
      if (isMounted.current) {
        setIsCameraLoading(false);
      }
    }
  };

  const setupMediaSources = () => {
    queueRefs.current = Array.from({ length: 4 }).map(() => []);
    
    // Revoke old URLs if any
    videoUrlsRef.current.forEach(url => {
      try { URL.revokeObjectURL(url); } catch (e) {}
    });
    videoUrlsRef.current = [];

    mediaSources.current = Array.from({ length: 4 }).map((_, i) => {
      const ms = new MediaSource();
      ms.onsourceopen = () => {
        try {
          const sb = ms.addSourceBuffer('video/webm; codecs="vp8"');
          sourceBuffers.current[i] = sb;
          sb.onupdateend = () => {
            const queue = queueRefs.current[i];
            if (queue && queue.length > 0 && !sb.updating) {
              sb.appendBuffer(queue.shift()!);
            }
          };
        } catch (e) {
          console.error("SourceBuffer creation error:", e);
        }
      };
      
      const video = videoRefs.current[i];
      if (video) {
        const url = URL.createObjectURL(ms);
        video.src = url;
        videoUrlsRef.current.push(url);
      }
      
      return ms;
    });
  };

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch (e) {
      console.error("Error stopping camera/recorder:", e);
    }
    playbackTimeoutRefs.current.forEach(t => clearTimeout(t));
    playbackTimeoutRefs.current = [];
    
    videoUrlsRef.current.forEach(url => {
      try { URL.revokeObjectURL(url); } catch (e) {}
    });
    videoUrlsRef.current = [];

    // Reset video sources
    videoRefs.current.forEach(video => {
      if (video) {
        video.src = "";
        video.load();
      }
    });

    sourceBuffers.current = [];
    mediaSources.current = [];
    queueRefs.current = [];
    
    if (isMounted.current) {
      setIsLive(false);
      setError(null);
    }
  };

  const startDelayedBuffering = (stream: MediaStream) => {
    const chunkDuration = 1000; // 1 second chunks for responsiveness
    
    try {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs="vp8"' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0 && isMounted.current) {
          const arrayBuffer = await e.data.arrayBuffer();
          
          videoRefs.current.forEach((video, idx) => {
            if (!video) return;
            
            const screenDelay = (delay + (idx * 5)) * 1000;
            const timeout = setTimeout(() => {
              if (!isMounted.current || !isLive) return;
              
              const sb = sourceBuffers.current[idx];
              if (sb) {
                if (sb.updating) {
                  queueRefs.current[idx].push(arrayBuffer);
                } else {
                  try {
                    sb.appendBuffer(arrayBuffer);
                    if (video.paused) video.play().catch(() => {});
                  } catch (err) {
                    console.error("Append error for screen", idx, err);
                  }
                }
              }
            }, screenDelay);
            playbackTimeoutRefs.current.push(timeout);
          });
        }
      };

      recorder.start(chunkDuration);
    } catch (err) {
      console.error("Recorder initialization error:", err);
      // Fallback to simpler blob swapping if MediaSource fails or codec unsupported
      startSimpleDelayedBuffering(stream);
    }
  };

  const startSimpleDelayedBuffering = (stream: MediaStream) => {
    const chunkDuration = 2000;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0 && isMounted.current) {
        const url = URL.createObjectURL(e.data);
        videoUrlsRef.current.push(url);
        
        videoRefs.current.forEach((video, idx) => {
          if (!video) return;
          const screenDelay = (delay + (idx * 5)) * 1000;
          const timeout = setTimeout(() => {
            if (!isMounted.current || !isLive) return;
            video.src = url;
            video.play().catch(() => {});
          }, screenDelay);
          playbackTimeoutRefs.current.push(timeout);
        });
      }
    };
    recorder.start(chunkDuration);
  };

  const [isRecordingSession, setIsRecordingSession] = useState(false);
  const sessionRecorderRef = useRef<MediaRecorder | null>(null);
  const sessionChunksRef = useRef<Blob[]>([]);

  const startSessionRecording = () => {
    if (!streamRef.current) return;
    sessionChunksRef.current = [];
    // Fallback mimeTypes
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];
    const mimeType = types.find(t => MediaRecorder.isTypeSupported(t)) || '';

    try {
      const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
      sessionRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) sessionChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        try {
          const blob = new Blob(sessionChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `recording-${new Date().getTime()}.webm`;
          link.click();
          // Delay revocation slightly to ensure the download link works
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (e) {
          console.error("Recording download error:", e);
        }
      };
      recorder.start();
      setIsRecordingSession(true);
    } catch (err) {
      console.error("Session recording error:", err);
      setError("Recording not supported on this device/browser.");
    }
  };

  const stopSessionRecording = () => {
    if (sessionRecorderRef.current && sessionRecorderRef.current.state !== 'inactive') {
      sessionRecorderRef.current.stop();
    }
    setIsRecordingSession(false);
  };
  const takeSnapshot = () => {
    if (!livePreviewRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = livePreviewRef.current.videoWidth;
    canvas.height = livePreviewRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(livePreviewRef.current, 0, 0);
      const link = document.createElement('a');
      link.download = `snapshot-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-primary mb-1">
            <RefreshCw className={isLive ? "animate-spin-slow" : ""} size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Skill Analysis Lab</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Hands-Free <span className="text-primary">Video Replay</span></h2>
          <p className="text-slate-500 font-medium">Automatic performance loop with custom delay for instant visual feedback.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 border-2 border-slate-900 rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center gap-2 px-4 border-r-2 border-slate-100">
            <Clock size={18} className="text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">Delay</span>
              <select 
                value={delay} 
                onChange={(e) => setDelay(parseInt(e.target.value))}
                className="bg-transparent font-black text-slate-900 outline-none cursor-pointer"
              >
                {[5, 10, 15, 20, 25, 30].map(s => <option key={s} value={s}>{s}s</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4">
            <Layout size={18} className="text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">Layout</span>
              <div className="flex items-center gap-2">
                {[1, 2, 4].map(n => (
                  <button 
                    key={n}
                    onClick={() => setNumScreens(n)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${numScreens === n ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Video size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight">Active Station</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Station ID: PE-REPLAY</p>
                </div>
              </div>

              {!isLive ? (
                <button 
                  onClick={startCamera}
                  disabled={isCameraLoading}
                  className="w-full py-5 bg-primary text-white border-2 border-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-primary-container transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isCameraLoading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                  <span>{isCameraLoading ? 'Initializing...' : 'Start Lab'}</span>
                </button>
              ) : (
                <button 
                  onClick={stopCamera}
                  className="w-full py-5 bg-rose-600 text-white border-2 border-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                >
                  <Square size={20} />
                  <span>Stop Lab</span>
                </button>
              )}

              <div className="space-y-4 pt-4 border-t border-white/10">
                <button 
                  onClick={takeSnapshot}
                  disabled={!isLive}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-white/10 transition-all disabled:opacity-50"
                  title="Capture current frame"
                >
                  <CameraIcon size={18} className="text-slate-400" />
                  <span className="text-xs font-bold">Quick Snapshot</span>
                </button>

                {!isRecordingSession ? (
                  <button 
                    onClick={startSessionRecording}
                    disabled={!isLive}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3 hover:bg-emerald-500/10 transition-all disabled:opacity-50 group"
                  >
                    <Video size={18} className="text-slate-400 group-hover:text-emerald-400" />
                    <span className="text-xs font-bold">Record Session</span>
                  </button>
                ) : (
                  <button 
                    onClick={stopSessionRecording}
                    className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 hover:bg-emerald-500/20 transition-all group animate-pulse"
                  >
                    <div className="relative">
                      <Square size={18} className="text-emerald-500" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
                    </div>
                    <span className="text-xs font-bold text-emerald-400">Stop Recording</span>
                  </button>
                )}
              </div>
            </div>
            <div className="absolute right-[-30px] bottom-[-30px] w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
          </div>

          <div className="bg-indigo-50 p-8 rounded-[2.5rem] border-2 border-indigo-100 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-indigo-200 flex items-center justify-center shadow-lg">
              <Share2 size={32} className="text-indigo-600" />
            </div>
            <div>
              <h4 className="font-black text-indigo-900 uppercase tracking-tight">Student Access</h4>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">Code: SKILL-A1</p>
            </div>
            <p className="text-sm text-indigo-800/70 font-medium">
              Students can open this lab on their devices using the shared code.
            </p>
          </div>
        </div>

        {/* Video Screens */}
        <div className="lg:col-span-9 space-y-6">
          {error && (
            <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-[2rem] flex items-center gap-4 text-rose-700">
              <Info size={24} />
              <p className="font-bold">{error}</p>
            </div>
          )}

          <div className={`grid gap-4 ${
            numScreens === 1 ? 'grid-cols-1' :
            numScreens === 2 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {Array.from({ length: numScreens }).map((_, i) => (
              <div 
                key={i} 
                className={`relative bg-slate-100 rounded-[2.5rem] border-4 border-slate-900 overflow-hidden shadow-[8px_8px_0px_0px_rgba(15,23,42,0.1)] aspect-video`}
              >
                {!isLive ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-4 p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <Video size={24} />
                    </div>
                    <p className="font-black text-xs uppercase tracking-widest leading-relaxed">
                      Screen {i + 1} <br />
                      Ready to Analyze
                    </p>
                  </div>
                ) : (
                  bufferingCount[i] > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm z-20">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <Loader2 className="animate-spin text-white opacity-20" size={80} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-black text-white">{bufferingCount[i]}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] font-black uppercase text-white tracking-[0.3em] block mb-1">Buffering Replay</span>
                          <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest leading-none">Step into frame now</span>
                        </div>
                      </div>
                    </div>
                  )
                )}
                <video 
                  ref={el => { videoRefs.current[i] = el; }}
                  className={`w-full h-full object-cover transition-opacity duration-500 relative z-10 ${isLive ? 'opacity-100' : 'opacity-0'}`}
                  autoPlay
                  playsInline
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    v.play().catch(() => {});
                  }}
                  controls={false}
                  muted
                />
                <div className="absolute top-6 left-6">
                  <div className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/20">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    <span>Feed {i + 1}</span>
                  </div>
                </div>
                <div className="absolute bottom-6 right-6">
                   <div className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    -{delay + (i * 5)}s Delay
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Master Preview */}
          {isLive && (
            <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-32 aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-900">
                  <video 
                    ref={livePreviewRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      v.play().catch(() => {});
                    }}
                    muted
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-rose-600 text-[8px] text-white font-black rounded uppercase">Live</div>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase tracking-tight">Master Monitor</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time reference</p>
                </div>
              </div>
              <button className="p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl hover:bg-slate-100 transition-all">
                <Maximize2 size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Guide */}
      <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-xl">
        <div className="max-w-4xl">
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
            <Play className="fill-white" size={24} />
            <span>How to Analyze Skills (Step-by-Step)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-3xl font-black text-indigo-300">01</div>
              <h4 className="font-black uppercase text-xs tracking-widest">Start Lab</h4>
              <p className="text-xs text-indigo-100/80 font-medium">Click "Start Lab" to activate the camera. Check your framing in the Master Monitor.</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-black text-indigo-300">02</div>
              <h4 className="font-black uppercase text-xs tracking-widest">Perform</h4>
              <p className="text-xs text-indigo-100/80 font-medium">Do your skill (jump, throw, etc.). The app records this automatically in the background.</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-black text-indigo-300">03</div>
              <h4 className="font-black uppercase text-xs tracking-widest">Auto Replay</h4>
              <p className="text-xs text-indigo-100/80 font-medium">Wait {delay}s. Walk to the screen—you'll see your performance looping automatically.</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-black text-indigo-300">04</div>
              <h4 className="font-black uppercase text-xs tracking-widest">Analyze/Save</h4>
              <p className="text-xs text-indigo-100/80 font-medium">Use "Snapshot" for a photo or "Record Session" to save the whole video to your device.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white border-2 border-slate-900 rounded-[3rem] p-10">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center gap-3">
          <Info className="text-indigo-600" />
          <span>Professional Setup Guide</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black mx-auto">1</div>
            <h4 className="font-black uppercase tracking-tight">Teacher-led</h4>
            <p className="text-sm text-slate-500 font-medium">Run on your laptop at a skill station. Students rotate through and see themselves automatically.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black mx-auto">2</div>
            <h4 className="font-black uppercase tracking-tight">Student-led</h4>
            <p className="text-sm text-slate-500 font-medium">Share the 6-character code. Students open it on their phones — no accounts required.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black mx-auto">3</div>
            <h4 className="font-black uppercase tracking-tight">Loop & Learn</h4>
            <p className="text-sm text-slate-500 font-medium">Perform, walk to screen, watch, adjust, repeat. No buttons needed during the session.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillAnalysis;
