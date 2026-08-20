import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  ShieldCheck, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ChevronRight,
  Info,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KIFTTest, KIFTBattery } from '../../types.ts';

interface TestVideoModalProps {
  test: KIFTTest | null;
  battery?: KIFTBattery | null;
  categoryName?: string;
  onClose: () => void;
  onSelectTest?: (test: KIFTTest) => void;
}

interface TestDemoData {
  title: string;
  youtubeId: string;
  embedUrl: string;
  durationLabel: string;
  viewingAngle: string;
  keyFormPoints: string[];
  disqualificationFaults: string[];
  equipmentSetup: string;
  biomechanicCue: string;
  idealCadence?: string;
}

const TEST_DEMO_REGISTRY: Record<string, TestDemoData> = {
  pushups: {
    title: 'Push-Ups (Boys Standard / Girls Modified) Form Protocol',
    youtubeId: 'IODxDxX7oi4',
    embedUrl: 'https://www.youtube-nocookie.com/embed/IODxDxX7oi4?autoplay=1&rel=0&modestbranding=1',
    durationLabel: '60 Seconds (1 Minute)',
    viewingAngle: 'Side Profile (90° Perpendicular to student plank)',
    keyFormPoints: [
      'Boys: Full straight plank body from shoulders to ankles with hands under shoulders.',
      'Girls: Modified kneeling position with straight torso from head to knees.',
      'Elbows must bend to a minimum 90-degree angle on descent.',
      'Chest must lower to within 5cm of the floor/mat or touch an evaluator marker sponge.',
      'Full lockout of elbows at the top of every repetition.'
    ],
    disqualificationFaults: [
      'Sagging hips or arching the lower lumbar spine during repetition.',
      'Incomplete elbow flexion (not reaching 90° angle).',
      'Resting on the floor for more than 3 consecutive seconds.',
      'Pivoting hips or uneven arm pressing.'
    ],
    equipmentSetup: 'Clean exercise mat, flat non-slip ground, stopwatch, optional 5cm foam touch-block.',
    biomechanicCue: 'Maintain strict core brace and neutral cervical spine. Lower smoothly in 1s, press explosively in 1s.',
    idealCadence: '25-35 valid reps/min for high-percentile benchmark'
  },
  curl_ups: {
    title: 'Sit-Ups / Partial Curl-Ups (30s Khelo India / 60s CBSE) Form Protocol',
    youtubeId: '2yOFvV-K-5s',
    embedUrl: 'https://www.youtube-nocookie.com/embed/2yOFvV-K-5s?autoplay=1&rel=0&modestbranding=1',
    durationLabel: '30s (Khelo India) / 60s (CBSE Senior Board)',
    viewingAngle: 'Side Diagonal (Focus on fingers crossing 10cm measuring strip)',
    keyFormPoints: [
      'Knees bent at comfortable 90° angle with feet flat on mat (uncapped/unheld).',
      'Arms fully extended at sides with fingertips resting on the zero line of measuring strip.',
      'Student flexes abdominal core to slide fingertips precisely 10cm forward onto the second marker.',
      'Shoulder blades must lift off the mat while lower back maintains contact.',
      'Upper torso and head must return to touch the mat on each downward stroke.'
    ],
    disqualificationFaults: [
      'Feet lifting off the ground during curling movement.',
      'Pulling the neck or head forward with hands or chin tucking excessively.',
      'Fingertips failing to cross the full 10cm marker tape line.',
      'Using momentum or bouncing shoulder blades off the mat.'
    ],
    equipmentSetup: 'Gym mat, 10cm measuring strip / masking tape, stopwatch, metronome (optional 20 reps/min).',
    biomechanicCue: 'Slide fingers forward by contracting rectus abdominis; avoid cervical neck strain.',
    idealCadence: 'Khelo India 30s: 15-28 reps; CBSE 60s: 30-50 reps'
  },
  sit_reach: {
    title: 'Sit & Reach Flexibility Box Official Protocol',
    youtubeId: 'k4ZpD4P2C1E',
    embedUrl: 'https://www.youtube-nocookie.com/embed/k4ZpD4P2C1E?autoplay=1&rel=0&modestbranding=1',
    durationLabel: '2 Attempts (Record Best Score in cm)',
    viewingAngle: 'Side View (Observing flat knee lockout against floor/mat)',
    keyFormPoints: [
      'Barefoot/socks only; soles of feet placed completely flat against the sit & reach box.',
      'Knees must remain locked straight and pressed flat against the testing surface.',
      'Palms facing downwards, hands placed one over the other (overlapping middle fingers).',
      'Reach smoothly forward along the measuring scale in one continuous, controlled motion.',
      'Hold the maximal reach point steadily for at least 2 full seconds for accurate reading.'
    ],
    disqualificationFaults: [
      'Bending the knees or lifting them off the mat during the stretch.',
      'Bouncing, jerking, or thrusting the fingertips forward (ballistic motion).',
      'Uneven hand reach where one hand leads the other.',
      'Failing to hold the furthest reach position for 2 seconds.'
    ],
    equipmentSetup: 'Standard Sit and Reach Box with zero-line calibrated at 15cm (or 0cm on Indian KIFT standards).',
    biomechanicCue: 'Exhale deeply during forward trunk reach while hinging from the hips, keeping hamstrings relaxed.',
    idealCadence: '2 controlled practice warm-up slides before recording best score'
  },
  bmi: {
    title: 'Height & Weight (BMI) Body Composition Protocol',
    youtubeId: 'r4e_x446m4E',
    embedUrl: 'https://www.youtube-nocookie.com/embed/r4e_x446m4E?autoplay=1&rel=0&modestbranding=1',
    durationLabel: 'Untimed Static Measurement',
    viewingAngle: 'Front & Side Eye-Level with Stadiometer Headpiece',
    keyFormPoints: [
      'Student removes shoes, heavy jackets, bulky watches, and tight hair ornaments.',
      'Stand erect on center of scale for weight, feet flat, weight evenly distributed.',
      'Height: Stand against stadiometer with heels, calves, buttocks, and upper back touching vertical bar.',
      'Head aligned in Frankfurt Horizontal Plane (line from lower eye socket to ear canal is parallel to floor).',
      'Take deep breath in and hold still while headboard is lowered gently to vertex of crown.'
    ],
    disqualificationFaults: [
      'Standing on tiptoes or slouching shoulders.',
      'Head tilted upwards or downwards away from the Frankfurt plane.',
      'Wearing shoes, heavy accessories, or pocket contents during weighing.'
    ],
    equipmentSetup: 'Calibrated digital/beam weighing scale (0.1kg precision) and vertical stadiometer (0.1cm precision).',
    biomechanicCue: 'Ensure heels together, chin level, eyes looking straight ahead into horizon.',
    idealCadence: 'Record Weight (kg) and Height (cm) formatted as weight/height in app'
  },
  sprint_50m: {
    title: '50-Meter Standing Start Sprint Acceleration Protocol',
    youtubeId: 'hN2U0Zp0y8U',
    embedUrl: 'https://www.youtube-nocookie.com/embed/hN2U0Zp0y8U?autoplay=1&rel=0&modestbranding=1',
    durationLabel: 'Timed Sprint (0.01s Precision)',
    viewingAngle: 'Side Finish-Line View with Line-of-Sight to Start Signal',
    keyFormPoints: [
      'Standing start stance behind start line with lead foot close to line and body leaning forward.',
      'Starter commands: "On your marks", "Set", followed by sharp whistle / clapper / arm drop.',
      'Explosive drive off front foot with high knee drive and aggressive arm pumping.',
      'Sprint full effort past the 50m line without decelerating before crossing the finish.',
      'Time is recorded the instant the student’s torso crosses the vertical plane of the finish line.'
    ],
    disqualificationFaults: [
      'False start before whistle or visual signal.',
      'Stepping on or over the start line before the start signal.',
      'Decelerating or coasting before crossing the finish line.'
    ],
    equipmentSetup: '50m marked straight track/ground, stopwatch with 0.01s accuracy, cones, whistle/clapper.',
    biomechanicCue: 'Drive knees forward, maintain forward torso lean for first 15m, then transition to upright stride.',
    idealCadence: '1-2 attempts with minimum 3-5 minute recovery between trials'
  },
  sprint_30m: {
    title: '30-Meter Compact Track Sprint Protocol',
    youtubeId: 'hN2U0Zp0y8U',
    embedUrl: 'https://www.youtube-nocookie.com/embed/hN2U0Zp0y8U?autoplay=1&rel=0&modestbranding=1',
    durationLabel: 'Timed Sprint (0.01s Precision)',
    viewingAngle: 'Finish Line Side Profile',
    keyFormPoints: [
      'Standing start behind mark; ideal for compact school courtyards and indoor halls.',
      'Explosive acceleration from first stride.',
      'Run through the finish line at 100% velocity.'
    ],
    disqualificationFaults: [
      'False start or touching start line.',
      'Slowing down before passing the finish cones.'
    ],
    equipmentSetup: '30m marked straight runway with 10m runoff zone, digital stopwatch, boundary cones.',
    biomechanicCue: 'Focus on aggressive first three ground-strikes and rapid turnover.',
    idealCadence: '2 attempts, best time recorded'
  },
  sprint_25m: {
    title: '25-Meter Hall / Compact Sprint Protocol',
    youtubeId: 'hN2U0Zp0y8U',
    embedUrl: 'https://www.youtube-nocookie.com/embed/hN2U0Zp0y8U?autoplay=1&rel=0&modestbranding=1',
    durationLabel: 'Timed Sprint (0.01s Precision)',
    viewingAngle: 'Finish Line Side Profile',
    keyFormPoints: [
      'Designed for schools with restricted outdoor grounds and compact PE facilities.',
      'Standing start with low center of gravity and high acceleration rate.',
      'Continuous velocity sprint across the 25m mark.'
    ],
    disqualificationFaults: [
      'Starting before signal or jumping early.',
      'Tripping or stepping outside marked lane.'
    ],
    equipmentSetup: '25m straight runway with safety deceleration pads/runoff area.',
    biomechanicCue: 'Maintain low forward shin angles during acceleration.',
    idealCadence: '2 attempts, best time logged'
  },
  shuttle_4x10: {
    title: '4×10m Agility Shuttle Run Protocol',
    youtubeId: 'x7M9Z0eP1v8',
    embedUrl: 'https://www.youtube-nocookie.com/embed/x7M9Z0eP1v8?autoplay=1&rel=0&modestbranding=1',
    durationLabel: 'Timed Agility Shuttle (0.01s Precision)',
    viewingAngle: 'Mid-court viewing both boundary line touches',
    keyFormPoints: [
      'Two parallel lines marked 10 meters apart with two wooden blocks placed on the far line.',
      'On "Go", student sprints 10m, picks up one block, sprints back, and places it completely behind start line.',
      'Student immediately turns, sprints back to pick up the second block, and sprints through finish.',
      'Blocks must be placed gently on or behind the line (never thrown or tossed).',
      'Timer runs continuously until the student crosses the start/finish line carrying the second block.'
    ],
    disqualificationFaults: [
      'Throwing or dropping wooden blocks across the line instead of placing them.',
      'Failing to touch boundary line with foot/hand during turns.',
      'Slipping due to improper footwear or dusty surface.'
    ],
    equipmentSetup: 'Two lines 10m apart, 2 wooden blocks (5cm×5cm×10cm), stopwatch, clear flat non-slip ground.',
    biomechanicCue: 'Drop hips low on deceleration approaching the turn line to pivot rapidly without loss of traction.',
    idealCadence: 'Fastest times range from 9.0s to 12.5s'
  },
  run_600m: {
    title: '600-Meter Run / Walk Aerobic Endurance Protocol',
    youtubeId: 'xS4h6N_xL8w',
    embedUrl: 'https://www.youtube-nocookie.com/embed/xS4h6N_xL8w?autoplay=1&rel=0&modestbranding=1',
    durationLabel: 'Timed Endurance Run (Minutes:Seconds)',
    viewingAngle: 'Track Finish Line with Lap Recorder',
    keyFormPoints: [
      'Standing start with grouped starts (up to 10-15 students depending on track width).',
      'On signal, students run at their own sustainable pace around measured track.',
      'Walking is permitted if exhausted, but continuous forward movement is encouraged.',
      'Evaluator announces lap times and final 100m callout.',
      'Record time in MM:SS format upon crossing finish line.'
    ],
    disqualificationFaults: [
      'Cutting inside track boundaries or corners.',
      'Pushing, obstructing, or impeding fellow runners.',
      'Stopping completely on the track pathway.'
    ],
    equipmentSetup: '400m or 200m marked running track, digital lap stopwatch, numbered bibs.',
    biomechanicCue: 'Pace evenly for the first 400m, avoiding an all-out sprint in the opening 100 meters.',
    idealCadence: 'Entry in MM:SS (e.g. 2:35 for 2 minutes 35 seconds)'
  },
  run_long: {
    title: '1000m (Boys) / 800m (Girls) Senior Secondary Endurance Protocol',
    youtubeId: 'xS4h6N_xL8w',
    embedUrl: 'https://www.youtube-nocookie.com/embed/xS4h6N_xL8w?autoplay=1&rel=0&modestbranding=1',
    durationLabel: 'Timed Long Distance (Minutes:Seconds)',
    viewingAngle: 'Finish Line & Lap Coordinator',
    keyFormPoints: [
      'Boys: 1000 meters; Girls: 800 meters distance.',
      'Assesses maximum aerobic capacity (VO2 max proxy) and cardiorespiratory endurance.',
      'Paced execution with steady breathing rhythm and kick finish in the last 150m.'
    ],
    disqualificationFaults: [
      'Cutting off track corners or reducing track distance.',
      'Interfering with other runners.'
    ],
    equipmentSetup: 'Standard 400m track, lap counter, multi-lap stopwatches, bib numbers.',
    biomechanicCue: 'Maintain relaxed shoulders, rhythmic breathing (2-2 stride cadence), and upright posture.',
    idealCadence: 'Format as MM:SS (e.g. 3:45)'
  },
  broad_jump: {
    title: 'Standing Broad Jump (Explosive Leg Power) Protocol',
    youtubeId: '1HkY0D7eP0E',
    embedUrl: 'https://www.youtube-nocookie.com/embed/1HkY0D7eP0E?autoplay=1&rel=0&modestbranding=1',
    durationLabel: '2 Attempts (Record Best in cm)',
    viewingAngle: 'Side View parallel to landing measuring tape',
    keyFormPoints: [
      'Student stands behind the take-off line with feet shoulder-width apart.',
      'Pre-jump: Bend knees and swing arms backwards to generate momentum.',
      'Jump forward explosively pushing off both feet simultaneously.',
      'Land on both feet simultaneously without falling backwards.',
      'Measurement is taken from the take-off line to the nearest contact point (heels or body part).'
    ],
    disqualificationFaults: [
      'Taking a preliminary running step or double hop before the jump.',
      'Falling backwards on landing (measurement will be taken to hand/hip contact).',
      'Stepping over the take-off line before jumping.'
    ],
    equipmentSetup: 'Non-slip landing mat with marked centimeter gradations, or flat soft ground and tape measure.',
    biomechanicCue: 'Coordinate dynamic arm drive forward and triple extension through ankles, knees, and hips.',
    idealCadence: '2 valid trials allowed, record maximum distance in centimeters'
  },
  flamingo: {
    title: 'Flamingo Balance Test (Static Equilibrium) Protocol',
    youtubeId: 'w8v2QkXvL_Q',
    embedUrl: 'https://www.youtube-nocookie.com/embed/w8v2QkXvL_Q?autoplay=1&rel=0&modestbranding=1',
    durationLabel: '60 Seconds Test Window',
    viewingAngle: 'Front or 45° Angle to Observe Stance Foot & Hands',
    keyFormPoints: [
      'Student stands on preferred leg on a standardized balance beam (3cm wide, 5cm high).',
      'The non-supporting leg is flexed at the knee and the foot is held by the hand of the same side close to buttocks.',
      'Student balances with assistance from the instructor to start, then lets go when ready.',
      'Stopwatch starts the instant the student releases instructor hand.',
      'Count the number of falls/balance breaks occurring until 60 seconds of total balance time is achieved.'
    ],
    disqualificationFaults: [
      'Letting go of the bent foot held at buttocks.',
      'Falling off the beam or touching the ground with any other body part.',
      'Test is stopped if student falls >15 times in the first 30 seconds.'
    ],
    equipmentSetup: 'Standardized balance beam (50cm long, 5cm high, 3cm wide), stopwatch.',
    biomechanicCue: 'Fix eyes on a stationary point on the wall at eye level to stabilize vestibular balance.',
    idealCadence: 'Lower score is better (fewer falls in 60s total test balance)'
  },
  plate_tapping: {
    title: 'Plate Tapping Test (Speed of Limb Movement) Protocol',
    youtubeId: 'GzX-7e4yVBo',
    embedUrl: 'https://www.youtube-nocookie.com/embed/GzX-7e4yVBo?autoplay=1&rel=0&modestbranding=1',
    durationLabel: '25 Full Cycles (50 Taps Recorded to 0.01s)',
    viewingAngle: 'Top/Front Angle over the Table Discs',
    keyFormPoints: [
      'Table with two yellow rubber discs (20cm diameter) placed 60cm apart with a central rectangle.',
      'Student places non-preferred hand on the central rectangle.',
      'On "Ready, Go", student moves preferred hand back and forth between the two discs as quickly as possible over the hand in the middle.',
      'Perform exactly 25 complete cycles (a total of 50 touches, 25 on each side).',
      'Stopwatch records the total elapsed time to complete all 50 touches.'
    ],
    disqualificationFaults: [
      'Failing to touch the discs completely with the palm/fingers.',
      'Lifting the stationary non-preferred hand off the central marker.',
      'Missing a disc tap (tester calls out completed tap numbers aloud).'
    ],
    equipmentSetup: 'Adjustable table, two 20cm discs placed 60cm center-to-center, 10×20cm center plate, stopwatch.',
    biomechanicCue: 'Keep wrist and elbow relaxed with short, rapid horizontal arm oscillations.',
    idealCadence: 'Average completion time between 9.5s and 14.5s'
  }
};

export const TestVideoModal: React.FC<TestVideoModalProps> = ({ 
  test, 
  battery,
  categoryName, 
  onClose,
  onSelectTest
}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'video' | 'checklist' | 'biomechanics'>('video');
  const [isIframeLoaded, setIsIframeLoaded] = useState<boolean>(false);
  const [currentTest, setCurrentTest] = useState<KIFTTest | null>(test);

  // Sync test when prop changes
  React.useEffect(() => {
    if (test) setCurrentTest(test);
  }, [test]);

  if (!currentTest) return null;

  const demoData: TestDemoData = TEST_DEMO_REGISTRY[currentTest.id] || {
    title: `${currentTest.name} Official CBSE Demonstration`,
    youtubeId: 'IODxDxX7oi4',
    embedUrl: `https://www.youtube-nocookie.com/embed/IODxDxX7oi4?autoplay=1&rel=0&modestbranding=1`,
    durationLabel: currentTest.duration || 'Official CBSE Protocol',
    viewingAngle: 'Side Angle (Perpendicular View)',
    keyFormPoints: [
      'Execute movement through full anatomical range of motion.',
      'Maintain strict alignment of joints without compensatory twisting.',
      'Follow standard start commands and timer cues.',
      'Record accurate numerical scores in the unit specified (' + currentTest.unit + ').'
    ],
    disqualificationFaults: [
      'Incomplete repetitions or failing to meet minimum depth/distance marker.',
      'Starting before the official whistle or command signal.',
      'Violating specified equipment boundaries or support rules.'
    ],
    equipmentSetup: currentTest.equipment ? currentTest.equipment.join(', ') : 'Standard PE testing facility and stopwatches.',
    biomechanicCue: 'Ensure student warm-up is conducted prior to maximum effort trials.',
    idealCadence: currentTest.scoringGuide || 'Standard performance scoring'
  };

  const handleTestSwitch = (t: KIFTTest) => {
    setCurrentTest(t);
    setIsIframeLoaded(false);
    onSelectTest?.(t);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.94, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[2.5rem] max-w-4xl w-full shadow-2xl border-4 border-slate-900 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0D2B52] text-white p-5 sm:p-6 relative flex items-center justify-between border-b-4 border-[#D4A017] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D4A017] text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-900/40 shrink-0">
              <Play size={22} className="fill-slate-950 ml-0.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-white/15 text-[#D4A017] rounded-full text-[10px] font-black uppercase tracking-wider border border-[#D4A017]/30">
                  {categoryName || battery?.category || 'Official KIFT Demonstration'}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-400/30">
                  <Clock size={11} />
                  {demoData.durationLabel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white line-clamp-1">
                {currentTest.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.youtube.com/results?search_query=Khelo+India+Fitness+Test+${encodeURIComponent(currentTest.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer hidden sm:flex"
              title="Open SAI Official Search"
            >
              <ExternalLink size={14} />
              <span className="text-[10px]">YouTube Source</span>
            </a>
            <button 
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-rose-600 text-white rounded-xl transition-all cursor-pointer shrink-0"
              title="Close Demonstration Modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Battery Test Switcher Bar if battery exists */}
        {battery && battery.tests && battery.tests.length > 1 && (
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <ChevronRight size={12} /> Tests in Battery:
            </span>
            {battery.tests.map(t => {
              const isSelected = t.id === currentTest.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTestSwitch(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-[#0D2B52] text-white shadow-sm ring-2 ring-[#D4A017]' 
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Play size={10} className={isSelected ? 'fill-white text-white' : 'text-slate-400'} />
                  <span>{t.name.split('(')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'video'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play size={14} className={activeTab === 'video' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>Demonstration Player</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'checklist'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 size={14} className={activeTab === 'checklist' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Form Checklist & Common Errors</span>
          </button>
          <button
            onClick={() => setActiveTab('biomechanics')}
            className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'biomechanics'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Eye size={14} className={activeTab === 'biomechanics' ? 'text-amber-600' : 'text-slate-400'} />
            <span>Evaluator Angles & Setup</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar text-slate-800 flex-1">
          {activeTab === 'video' && (
            <div className="space-y-4">
              {/* 16:9 Responsive Video Player Container */}
              <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-900 shadow-xl group">
                <iframe
                  src={demoData.embedUrl}
                  title={demoData.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setIsIframeLoaded(true)}
                />
              </div>

              {/* Quick Biomechanics Banner below video */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-indigo-50 border-2 border-indigo-100 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-indigo-950 font-black text-xs uppercase tracking-wider mb-1">
                    <Eye size={14} className="text-indigo-600" />
                    <span>Teacher Sightline Angle</span>
                  </div>
                  <p className="text-xs text-indigo-900 font-bold">{demoData.viewingAngle}</p>
                </div>

                <div className="p-3.5 bg-amber-50 border-2 border-amber-200/80 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs uppercase tracking-wider mb-1">
                    <Clock size={14} className="text-amber-600" />
                    <span>Timing / Target Cadence</span>
                  </div>
                  <p className="text-xs text-amber-900 font-bold">{demoData.idealCadence || demoData.durationLabel}</p>
                </div>

                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-200/80 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-black text-xs uppercase tracking-wider mb-1">
                    <Award size={14} className="text-emerald-600" />
                    <span>Scoring Parameter</span>
                  </div>
                  <p className="text-xs text-emerald-900 font-bold">Unit: {currentTest.unit}</p>
                </div>
              </div>

              {/* Core Coaching Prompt */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-start gap-3 shadow-md">
                <Sparkles className="text-[#D4A017] shrink-0 mt-0.5" size={18} />
                <div className="text-xs">
                  <span className="font-black text-[#D4A017] uppercase tracking-wider block mb-0.5">
                    Pro Evaluator Biomechanical Cue:
                  </span>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {demoData.biomechanicCue}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Correct Form Keys */}
              <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-xs uppercase tracking-wider">
                  <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                    <CheckCircle2 size={16} />
                  </div>
                  <span>Mandatory Form Keys (Valid Reps)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-emerald-950 font-medium">
                  {demoData.keyFormPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disqualification Faults */}
              <div className="p-5 rounded-2xl bg-rose-50/70 border-2 border-rose-200 space-y-3">
                <div className="flex items-center gap-2 text-rose-950 font-black text-xs uppercase tracking-wider">
                  <div className="p-1.5 bg-rose-500 text-white rounded-lg">
                    <AlertTriangle size={16} />
                  </div>
                  <span>Faults & No-Count Triggers (Deduct/Reject)</span>
                </div>
                <ul className="space-y-2.5 text-xs text-rose-950 font-medium">
                  {demoData.disqualificationFaults.map((flt, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-900 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        ✕
                      </span>
                      <span>{flt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'biomechanics' && (
            <div className="space-y-4">
              {/* Equipment & Ground Setup */}
              <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-600" />
                  <span>Equipment & Station Setup</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {demoData.equipmentSetup}
                </p>
              </div>

              {/* Evaluator Observation Stand */}
              <div className="p-5 rounded-2xl bg-indigo-50/80 border-2 border-indigo-200 space-y-2">
                <h4 className="font-black text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                  <Eye size={16} className="text-indigo-600" />
                  <span>Recommended Teacher Observation Position</span>
                </h4>
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  <strong>Position:</strong> {demoData.viewingAngle}.<br />
                  Maintain an unobstructed line of sight to both the student’s joint angles and stopwatch indicator. 
                  Have student assistants call out lap counts or hold marker cones where appropriate.
                </p>
              </div>

              {/* Special Curl-Up or Push-Up timing highlight */}
              {currentTest.id === 'curl_ups' && (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-xs space-y-1.5">
                  <p className="font-black text-amber-950 uppercase tracking-wider">
                    ⏱️ Timing Rule Notice (CBSE vs Khelo India):
                  </p>
                  <p className="text-amber-900 font-medium leading-relaxed">
                    • <strong>Grades 6–10 (Khelo India Protocol):</strong> 30 Seconds timed trial with 10cm sliding strip.<br />
                    • <strong>Grades 11–12 (CBSE Board Practical):</strong> 60 Seconds (1 Minute) continuous abdominal test.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 font-bold">
            Standardized for CBSE Mainstream & SAI National Khelo India Protocol
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              Done / Return to Scoring
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default TestVideoModal;
