import React from 'react';
import { X, Clock, Wrench, Award, CheckCircle2, ShieldCheck, HelpCircle, Play, Target, Activity, FileText } from 'lucide-react';
import { KIFTTest } from '../../types.ts';

interface TestGuideModalProps {
  test: KIFTTest | null;
  categoryName?: string;
  onClose: () => void;
  onOpenVideo?: (test: KIFTTest) => void;
}

interface TestDetailMetadata {
  fitnessComponent: string;
  purpose: string;
  executionSteps: string[];
  scoringDetails: string;
  equipment: string[];
  safetyNotes: string;
}

const TEST_DETAILS_MAP: Record<string, TestDetailMetadata> = {
  bmi: {
    fitnessComponent: 'Body Composition & Somatotype',
    purpose: 'Evaluates the ratio of body mass to height to detect nutritional status, growth trends, underweight, normal weight, or overweight categories as part of Khelo India baseline wellness.',
    executionSteps: [
      'Ensure the student is barefoot and wearing lightweight sports uniform.',
      'Measure body weight using a calibrated digital scale in kilograms (kg).',
      'Measure standing height against a stadiometer, with heels, buttocks, and upper back touching the vertical ruler and head in the Frankfort horizontal plane.',
      'Enter Weight (kg) and Height (cm) separated by a slash (e.g. 28/135). The system automatically calculates BMI and WHO/CBSE percentile classification.'
    ],
    scoringDetails: 'BMI = Weight (kg) / [Height (m)]². Auto-classified into Underweight, Normal, Overweight, or Obese according to age-gender growth curves.',
    equipment: ['Calibrated Digital Weighing Scale', 'Stadiometer / Wall Height Measure'],
    safetyNotes: 'Ensure clean floor/mat for barefoot measurement and respect student privacy during weight recording.'
  },
  flamingo: {
    fitnessComponent: 'Static Balance & Neuromuscular Control',
    purpose: 'Assesses static equilibrium, lower body proprioception, and core stability on a single-leg support base.',
    executionSteps: [
      'Student stands barefoot on the preferred foot on the standardized Flamingo balance beam (50cm long x 4cm high x 3cm wide).',
      'The student bends the free leg at the knee and grips the instep of the free foot with the hand on the same side.',
      'The teacher starts the 60-second timer as soon as the student achieves balance and lets go of the support.',
      'Each time the student loses balance (releases the foot, touches the ground, or stumbles), pause the stopwatch and add 1 to the count.',
      'Resume timing until a cumulative 60 seconds of balance is completed. Record total balance breaks.'
    ],
    scoringDetails: 'Record total number of falls or balance interruptions during the 60-second trial. Fewer falls indicate superior static balance.',
    equipment: ['Flamingo Balance Beam (50cm x 3cm x 4cm)', 'Stopwatch', 'Non-slip Floor Mat'],
    safetyNotes: 'Place safety gym mats around the beam to cushion against any sudden loss of balance.'
  },
  plate_tapping: {
    fitnessComponent: 'Upper Extremity Speed & Limb Coordination',
    purpose: 'Measures speed of hand and arm movement, visual-motor reaction time, and rapid bilateral neuromuscular coordination.',
    executionSteps: [
      'The table height is adjusted so the student stands comfortably with elbows relaxed.',
      'Two yellow circular discs (20cm diameter) are spaced 60cm apart (centers 80cm apart) with a 30x20cm rectangle between them.',
      'Student places the non-preferred hand on the center rectangle plate.',
      'On the command "Ready... GO!", student moves the preferred hand back and forth between the two discs as quickly as possible over the non-preferred hand.',
      'One cycle = touching disc A and disc B. Count total successful plate taps in 30 seconds.'
    ],
    scoringDetails: 'Record total completed taps in 30 seconds. Higher count indicates faster upper extremity limb velocity.',
    equipment: ['Plate Tapping Table with 2 Yellow Discs & Center Plate', 'Stopwatch'],
    safetyNotes: 'Ensure the table surface is stable and discs are firmly secured to avoid sliding.'
  },
  sit_reach: {
    fitnessComponent: 'Hamstring & Lower Back Flexibility',
    purpose: 'Evaluates the flexibility and range of motion of the posterior kinetic chain, specifically hamstrings and lumbar spinal musculature.',
    executionSteps: [
      'Student removes shoes and sits on the floor with knees locked straight and feet flat against the vertical face of the Sit and Reach box.',
      'Student places one hand over the other with palms downward and fingers extended.',
      'Student reaches smoothly forward along the top measuring ruler as far as possible without jerking or bending knees.',
      'Hold the maximal reach position for 2 full seconds for accurate recording.',
      'Administer 2 trials and record the best distance reached to the nearest 0.5 cm.'
    ],
    scoringDetails: 'Distance reached in centimeters (cm). The 0 cm mark is aligned with the foot-line (typically 23cm or 15cm offset). Higher positive values indicate superior flexibility.',
    equipment: ['Standardized Sit and Reach Box with Metric Ruler', 'Testing Mat'],
    safetyNotes: 'Warm up hamstrings before testing. Disallow ballistic bouncing to prevent hamstring strain.'
  },
  shuttle_run: {
    fitnessComponent: 'Agility, Acceleration & Deceleration',
    purpose: 'Assesses agility, explosive acceleration, directional cutting, and deceleration speed over multiple short sprints.',
    executionSteps: [
      'Two parallel lines are marked on a non-slip court 10 meters apart. Two small wooden blocks (5x5x10cm) are placed behind the far line.',
      'On "Ready... GO!", the student sprints 10m from the starting line, picks up one wooden block, sprints back across the start line, and places it behind the line.',
      'Without stopping, student turns, sprints back to pick up the second block, and carries it back across the finish line.',
      'Stop the timer as soon as the student crosses the line with the second block (total 40m covered in 4 sprints).'
    ],
    scoringDetails: 'Recorded in seconds to the nearest 0.01 second. Typical times range between 9.00s and 15.00s.',
    equipment: ['2 Wooden Blocks (5cm x 5cm x 10cm)', '10-Meter Measured Runway', 'Stopwatch', 'Marking Cones'],
    safetyNotes: 'Ensure the running surface is dry and free of gravel. Allow ample deceleration run-off space behind lines.'
  },
  shuttle_4x10: {
    fitnessComponent: 'Agility, Acceleration & Deceleration',
    purpose: 'Assesses agility, explosive acceleration, directional cutting, and deceleration speed over multiple short sprints.',
    executionSteps: [
      'Two parallel lines are marked on a non-slip court 10 meters apart. Two small wooden blocks (5x5x10cm) are placed behind the far line.',
      'On "Ready... GO!", the student sprints 10m from the starting line, picks up one wooden block, sprints back across the start line, and places it behind the line.',
      'Without stopping, student turns, sprints back to pick up the second block, and carries it back across the finish line.',
      'Stop the timer as soon as the student crosses the line with the second block (total 40m covered in 4 sprints).'
    ],
    scoringDetails: 'Recorded in seconds to the nearest 0.01 second. Typical times range between 9.00s and 15.00s.',
    equipment: ['2 Wooden Blocks (5cm x 5cm x 10cm)', '10-Meter Measured Runway', 'Stopwatch', 'Marking Cones'],
    safetyNotes: 'Ensure the running surface is dry and free of gravel. Allow ample deceleration run-off space behind lines.'
  },
  pushups: {
    fitnessComponent: 'Upper Body Muscular Strength & Endurance',
    purpose: 'Measures chest, shoulder, triceps, and anterior trunk core muscular endurance over a continuous 60-second time trial.',
    executionSteps: [
      'BOYS: Assume standard prone plank position with hands shoulder-width apart, back straight, and toes on the mat.',
      'GIRLS (Modified Push-Up): Assume prone position with hands shoulder-width apart, knees resting on mat, and ankles crossed.',
      'Lower body until elbows bend to a 90-degree angle (chest approximately 5-7cm from floor), then push back up to straight arms.',
      'Maintain a rigid core and neutral spine. Rest only in the up position if needed.',
      'Count all completed valid repetitions in 60 seconds.'
    ],
    scoringDetails: 'Total valid repetitions completed within 60 seconds (1 minute). Repetitions where the back sags or elbows fail to reach 90° are not counted.',
    equipment: ['Exercise Gym Mat', 'Stopwatch'],
    safetyNotes: 'Students should stop if feeling sharp shoulder or lower back pain. Maintain smooth breathing rhythm.'
  },
  curl_ups: {
    fitnessComponent: 'Abdominal Muscular Endurance & Core Stability',
    purpose: 'Assesses the muscular strength-endurance of the abdominal wall (rectus abdominis) while minimizing cervical neck tension.',
    executionSteps: [
      'Student lies supine on mat with knees bent at approximately 140 degrees, feet flat on the mat about shoulder-width apart.',
      'Arms are straight and resting on thighs or beside body, with fingers touching the nearest edge of a 10cm masking tape strip on the mat.',
      'Student curls the head and shoulders smoothly forward, sliding fingers across the 10cm strip until the far edge is reached.',
      'Lower shoulders smoothly until shoulder blades touch the mat before starting the next rep.',
      'Count total valid curl-ups completed within the allotted time limit (30s for Khelo India Grades 6-10 / 60s for CBSE Class 11-12 Practical).'
    ],
    scoringDetails: 'Total valid repetitions completed within time limit (30s Khelo India count or 60s CBSE board exam count).',
    equipment: ['Gym Mat with 10cm / 4.5 inch Measuring Strip', 'Stopwatch or Cadence Audio'],
    safetyNotes: 'Hands must slide flat on the mat without grabbing knees or pulling on the back of the neck.'
  },
  sprint_50m: {
    fitnessComponent: 'Linear Sprint Speed & Acceleration',
    purpose: 'Measures maximal running velocity, explosive stride acceleration, and anaerobic alactic capacity.',
    executionSteps: [
      'Student takes a standing start position with lead foot behind the starting line.',
      'On the auditory cue "Set... GO!" (or arm drop), student sprints with maximal effort across the 50-meter finish line.',
      'The timer starts on the visual/auditory signal and stops precisely when the student torso crosses the finish line.',
      'Administer 1-2 trials with adequate recovery between runs.'
    ],
    scoringDetails: 'Time recorded in seconds to the nearest 0.01 second. Shorter times reflect superior sprinting speed.',
    equipment: ['50-Meter Measured Straight Track / Field', 'Digital Stopwatch', 'Finish Line Ribbon / Cones'],
    safetyNotes: 'Provide at least 15-20 meters of clear deceleration space beyond the finish line.'
  },
  sprint_30m: {
    fitnessComponent: 'Linear Sprint Speed & Compact Field Velocity',
    purpose: 'Measures short-distance sprint acceleration and speed for compact school playgrounds lacking full 100m tracks.',
    executionSteps: [
      'Student takes a standing start behind the 0m line.',
      'On the command "GO!", the student accelerates with maximum effort through the 30m finish line.',
      'Timer records the duration from the start command to torso crossing the 30m marker.'
    ],
    scoringDetails: 'Time recorded in seconds to the nearest 0.01 second.',
    equipment: ['30-Meter Measured Runway', 'Digital Stopwatch', 'Cones'],
    safetyNotes: 'Ensure a smooth, obstacle-free track surface.'
  },
  sprint_25m: {
    fitnessComponent: 'Linear Sprint Speed & Explosive Takeoff',
    purpose: 'Measures short-distance sprint acceleration and speed tailored for primary and middle school grounds.',
    executionSteps: [
      'Student starts from a standing position behind the 25m mark.',
      'Sprints at top speed across the 25m distance.',
      'Timer stops when the student crosses the finish line.'
    ],
    scoringDetails: 'Time in seconds (0.01s precision).',
    equipment: ['25-Meter Measured Track', 'Stopwatch'],
    safetyNotes: 'Keep sidelines clear of spectators and equipment.'
  },
  run_600m: {
    fitnessComponent: 'Cardiorespiratory Endurance & Aerobic Capacity',
    purpose: 'Evaluates aerobic endurance, cardiovascular stamina, respiratory efficiency, and pacing strategy over distance.',
    executionSteps: [
      'Students line up behind the start line in small groups (8-12 students).',
      'On the command "GO!", students begin running or walking the measured 600m course.',
      'Walking is permitted, but students are encouraged to maintain a steady running pace throughout.',
      'Call out split times and record each student final completion time in minutes and seconds (MM:SS).'
    ],
    scoringDetails: 'Recorded in Minutes and Seconds format (e.g. 02:45 for 2 minutes 45 seconds). Lower times represent higher aerobic fitness.',
    equipment: ['200m or 400m Track / Marked 600m Course', 'Stopwatches with Lap Split Memory', 'Cones'],
    safetyNotes: 'Conduct hydration checks before and after the run. Do not conduct in extreme midday heat.'
  },
  broad_jump: {
    fitnessComponent: 'Explosive Leg Power & Dynamic Leaping',
    purpose: 'Measures bilateral lower body explosive muscular power and horizontal jumping force.',
    executionSteps: [
      'Student stands behind the take-off line with feet slightly apart.',
      'Student swings arms backward and bends knees to prepare for explosive forward projection.',
      'Student jumps forward explosively using both feet simultaneously, landing on both feet.',
      'Measure distance from the take-off line to the nearest point of contact (usually the rear heel).',
      'Record the best distance of 2-3 attempts in centimeters or meters.'
    ],
    scoringDetails: 'Distance in centimeters (cm) or meters (m). Longest valid jump is recorded.',
    equipment: ['Non-slip Take-off Mat / Sand Pit', 'Long Measuring Tape'],
    safetyNotes: 'Ensure landing area is soft and cushioned to protect knee and ankle joints.'
  }
};

export const TestGuideModal: React.FC<TestGuideModalProps> = ({ test, categoryName, onClose, onOpenVideo }) => {
  if (!test) return null;

  const detail = TEST_DETAILS_MAP[test.id] || {
    fitnessComponent: 'General Health & Physical Fitness',
    purpose: test.description || 'Assesses student physical literacy, motor proficiency, and health-related fitness according to CBSE guidelines.',
    executionSteps: test.protocol ? test.protocol.split('. ').filter(Boolean).map(s => s.trim()) : [
      'Ensure the student is warmed up and properly positioned.',
      'Follow standard Khelo India / CBSE protocols for trials and scoring.',
      'Record raw numerical score directly into the assessment grid.'
    ],
    scoringDetails: test.scoringGuide || `Record metric in ${test.unit}.`,
    equipment: test.equipment || ['Standard Physical Education Apparatus', 'Stopwatch / Ruler'],
    safetyNotes: 'Always supervise trials and enforce standard safety and hydration procedures.'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[2rem] sm:rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0D2B52] text-white p-5 sm:p-7 relative flex items-start justify-between border-b-4 border-[#D4A017]">
          <div className="space-y-1.5 pr-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white/10 text-[#D4A017] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#D4A017]/30">
                {categoryName || 'CBSE KIFT Protocol'}
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-indigo-400/30">
                <Target size={12} className="text-[#D4A017]" />
                {detail.fitnessComponent}
              </span>
              {test.duration && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-400/30">
                  <Clock size={12} />
                  {test.duration}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              {test.name}
            </h2>
            <p className="text-slate-300 text-xs font-medium leading-relaxed max-w-xl">
              {test.description}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer shrink-0"
            title="Close modal"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 custom-scrollbar text-slate-800">
          
          {/* 1. TEST PURPOSE & TARGET COMPONENT */}
          <div className="bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200/70 space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider">
              <Activity size={16} className="text-amber-600" />
              <span>1. Test Purpose & Target Fitness Component</span>
            </div>
            <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
              {detail.purpose}
            </p>
          </div>

          {/* 2. STEP-BY-STEP EXECUTION METHOD */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>2. Execution Method & Testing Procedure</span>
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                Official CBSE Standards
              </span>
            </div>

            <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-medium">
              {detail.executionSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-[#0D2B52] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed flex-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* 3. TIMING & SCORING FORMAT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200/60">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Clock size={16} className="text-indigo-600" />
                <span>Duration / Timing Protocol</span>
              </div>
              <p className="text-indigo-950 font-black text-sm">
                {test.id === 'curl_ups'
                  ? (categoryName?.includes('Senior') || categoryName?.includes('11') || categoryName?.includes('12')
                      ? '60 Seconds (1 Min CBSE Board)'
                      : categoryName?.includes('Middle') || categoryName?.includes('6') || categoryName?.includes('7') || categoryName?.includes('8')
                        ? '30 Seconds (Official Khelo India)'
                        : '30s Khelo India / 60s CBSE')
                  : (test.duration || 'Standard Trial')}
              </p>
              <p className="text-slate-600 text-[11px] font-medium mt-1 leading-relaxed">
                {test.id === 'pushups' && '60s continuous trial. Count valid repetitions (Boys: full plank; Girls: modified knee support).'}
                {test.id === 'curl_ups' && '30s standard for Grades 6-10 / 60s for Senior Secondary Board practicals.'}
                {(test.id === 'shuttle_4x10' || test.id === 'shuttle_run') && 'Timed sprint agility test recorded in seconds to 0.01s accuracy.'}
                {test.id === 'plate_tapping' && 'Conduct over exactly 30 seconds.'}
                {test.id === 'flamingo' && 'Pause timer during falls until 60 seconds of cumulative balance is achieved.'}
                {test.id === 'run_600m' && 'Record time in MM:SS (Minutes:Seconds) format.'}
                {test.id === 'bmi' && 'Untimed measurements: Height in cm, Weight in kg.'}
                {!['pushups','curl_ups','plate_tapping','flamingo','shuttle_4x10','shuttle_run','run_600m','bmi'].includes(test.id) && 'Perform under standard Khelo India PE conditions.'}
              </p>
            </div>

            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/60">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Award size={16} className="text-emerald-600" />
                <span>Scoring Format & Unit</span>
              </div>
              <p className="text-emerald-950 font-black text-sm">Unit: {test.unit}</p>
              <p className="text-slate-600 text-[11px] font-medium mt-1 leading-relaxed">
                {detail.scoringDetails}
              </p>
            </div>
          </div>

          {/* 4. REQUIRED EQUIPMENT */}
          {detail.equipment && detail.equipment.length > 0 && (
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                <Wrench size={16} className="text-[#0D2B52]" />
                <span>Required Equipment & Apparatus</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {detail.equipment.map((item: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. TEACHER & SAFETY GUIDELINES */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex items-start gap-3">
            <HelpCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-950 font-medium leading-relaxed">
              <strong className="font-bold text-blue-900 uppercase block mb-1">Teacher & Safety Guidelines:</strong>
              {detail.safetyNotes} Conduct 5–10 minutes of active dynamic warm-ups prior to testing. Entered scores automatically map to CBSE HPE Strand 1 report card metrics.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {onOpenVideo ? (
            <button
              onClick={() => {
                onClose();
                onOpenVideo(test);
              }}
              className="px-5 py-2.5 bg-[#D4A017] hover:bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <Play size={14} className="fill-slate-950" />
              <span>Watch Video Demo</span>
            </button>
          ) : <div />}

          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-[#0D2B52] hover:bg-[#164077] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
