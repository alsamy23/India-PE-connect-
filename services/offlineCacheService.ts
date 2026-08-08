import { Student, LessonPlan, BoardType, Language } from '../types.ts';
import { SavedItem, storageService } from './storageService.ts';

const OFFLINE_STUDENTS_KEY = 'smartpe_offline_students';
const PENDING_STUDENTS_KEY = 'smartpe_pending_student_sync';
const OFFLINE_LAST_SYNC_KEY = 'smartpe_students_last_sync';

export interface PendingStudentSync {
  student: Student;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
}

// Pre-packaged offline PE Lesson Plan templates for outdoor field sessions
export const PRELOADED_OFFLINE_LESSON_PLANS: (SavedItem & { id: string })[] = [
  {
    id: 'offline_lp_football_dribbling',
    type: 'Lesson Plan',
    title: 'Football - Ball Control & Dribbling Skills (Grade 6-8)',
    timestamp: Date.now() - 86400000 * 2,
    metadata: { sport: 'Football', grade: '6-8', topic: 'Dribbling & Ball Control', date: new Date().toISOString().split('T')[0] },
    content: {
      title: 'CBSE PE Lesson Plan: Football Ball Control & Dribbling',
      classGrade: 'Grade 6 to 8',
      topic: 'Football - Dribbling with Inside/Outside of Foot',
      duration: '40 Minutes',
      learningObjectives: [
        'Master close ball control using inside and outside instep while moving at variable pace',
        'Demonstrate spatial awareness when changing directions past cones or defenders',
        'Understand the rule of fair tackling and avoiding dangerous high kicks'
      ],
      equipmentNeeded: '15 Cones, 10 Footballs, 8 Bibs, 1 Whistle, 1 Stopwatch',
      warmup: 'Dynamic jogging with high knees, butt kicks, arm circles, and quick shuttle sprints (8 mins)',
      warmupDiagramPrompt: 'Grid layout with cones spaced 2m apart for shuttle dribbling drills',
      explanationSkillDrills: [
        'Drill 1 (10 mins): Cone Slalom - Dribble through a line of 6 cones using short, soft touches with the inside of right/left foot.',
        'Drill 2 (10 mins): Box Dribble & Cut - Dribble inside a 10x10m square, execute a turn on coach whistle signal.'
      ],
      explanationDiagramPrompt: 'Demonstration of inside instep touch and stopping ball with sole of foot',
      gameSmallSided: '4v4 Small Sided Mini Game on a 25x15m pitch with mini goals. Teams must complete at least 3 dribble touches before passing.',
      gameDiagramPrompt: '25x15m pitch with 2 mini goal posts and 4 player teams in distinct bibs',
      coolingDown: 'Light walk around pitch, calf and hamstring stretches, guided reflection on foot control.',
      assessmentCriteria: [
        'Ball stays within 1 meter during slalom dribbling',
        'Maintains head up to observe teammates and space',
        'Active participation and sportsmanship during mini-game'
      ],
      safetyGuidelines: 'Ensure pitch is clear of loose rocks/debris. Shin guards recommended. Keep distance between slalom lanes.',
      teacherNotes: 'Encourage students to use non-dominant foot during Drill 1 to build bilateral coordination.'
    } as unknown as LessonPlan
  },
  {
    id: 'offline_lp_basketball_passing',
    type: 'Lesson Plan',
    title: 'Basketball - Chest Pass & Bounce Pass Mechanics (Grade 9-10)',
    timestamp: Date.now() - 86400000 * 3,
    metadata: { sport: 'Basketball', grade: '9-10', topic: 'Chest & Bounce Passing', date: new Date().toISOString().split('T')[0] },
    content: {
      title: 'CBSE PE Lesson Plan: Basketball Fundamental Passing Skills',
      classGrade: 'Grade 9 to 10',
      topic: 'Chest Pass, Bounce Pass & Receiving Position',
      duration: '45 Minutes',
      learningObjectives: [
        'Execute chest pass with thumbs pointing down and wrists snapping outward',
        'Execute bounce pass hitting floor 2/3 distance toward the receiver',
        'Adopt triple-threat receiving stance upon catching the ball'
      ],
      equipmentNeeded: '12 Basketballs, 10 Cones, 2 Whistles, Marking Tape',
      warmup: 'Basketball dribble tag inside the half-court key followed by dynamic shoulder and torso rotations (10 mins)',
      warmupDiagramPrompt: 'Half court grid with students dribbling while attempting to tag partners',
      explanationSkillDrills: [
        'Drill 1 (10 mins): Pair Passing - Stationary partners 4m apart practice 20 chest passes and 20 bounce passes with step-through motion.',
        'Drill 2 (10 mins): 3-Player Weave - Running across court passing in 3-player lanes finishing with a layup.'
      ],
      explanationDiagramPrompt: 'Biomechanical wrist snap and thumb rotation for chest and bounce passes',
      gameSmallSided: '5v5 Half-Court Game with 5-pass rule: Every possession must complete 5 successful passes before taking a shot.',
      gameDiagramPrompt: 'Half court 5v5 positioning with passing trajectories',
      coolingDown: 'Gentle walk, shoulder and wrist extensor stretches, group debrief on passing accuracy.',
      assessmentCriteria: [
        'Thumbs point down at follow-through on chest pass',
        'Bounce pass contacts floor at 2/3 distance',
        'Receives ball with target hands up in athletic stance'
      ],
      safetyGuidelines: 'Maintain safe distance between pairs to prevent stray ball collisions.',
      teacherNotes: 'Emphasize stepping forward into the pass to generate power rather than relying solely on arm strength.'
    } as unknown as LessonPlan
  },
  {
    id: 'offline_lp_athletics_sprint',
    type: 'Lesson Plan',
    title: 'Athletics - 100m Crouch Start & Sprint Acceleration (Grade 5-8)',
    timestamp: Date.now() - 86400000 * 4,
    metadata: { sport: 'Athletics', grade: '5-8', topic: 'Sprint Start & Acceleration', date: new Date().toISOString().split('T')[0] },
    content: {
      title: 'KIFT Athletics Lesson Plan: Crouch Start & Sprinting Form',
      classGrade: 'Grade 5 to 8',
      topic: '100m Crouch Start Commands & High Knee Acceleration',
      duration: '40 Minutes',
      learningObjectives: [
        'Demonstrate "On Your Marks", "Set", and "Go" crouch start positioning',
        'Maintain drive phase angle for the first 15 meters of sprint',
        'Master high knee drive, relaxed shoulders, and 90-degree arm swing'
      ],
      equipmentNeeded: '10 Cones, 1 Starting Clapper/Whistle, 2 Stopwatches, Measuring Tape',
      warmup: 'ABC Running Drills: High knees, A-skips, B-skips, heel kicks, and 3x20m strideouts (10 mins)',
      warmupDiagramPrompt: 'Straight track lanes with cones marking 10m, 20m, 30m sprint zones',
      explanationSkillDrills: [
        'Drill 1 (10 mins): Crouch Start Mechanics - Practice "On Your Marks" (knee down, fingers behind line) & "Set" (hips elevated above shoulders).',
        'Drill 2 (10 mins): 15m Explosion Runs - Sprint out from crouch start focusing on low head and aggressive arm drives.'
      ],
      explanationDiagramPrompt: 'Side profile angle showing On Your Marks, Set, and Explosive Start body angles',
      gameSmallSided: 'Shuttle Relay Race: 4x50m sprint relay teams competing with baton handoffs in designated exchange zones.',
      gameDiagramPrompt: '4-lane 50m track layout with baton exchange box highlighted',
      coolingDown: '400m slow cooldown jog, quad, calf, and groin stretches.',
      assessmentCriteria: [
        'Hips held higher than shoulders in "Set" position',
        'Remains low without popping upright immediately',
        'Smooth arm drive originating from shoulders'
      ],
      safetyGuidelines: 'Ensure track is dry and non-slippery. Allow 5m deceleration space past finish line.',
      teacherNotes: 'Remind students that reaction time improves with mental focus on the whistle blast.'
    } as unknown as LessonPlan
  }
];

export const offlineCacheService = {
  // Save fetched student directory to local storage for offline use
  saveStudentsToOfflineCache: (students: Student[]): void => {
    try {
      localStorage.setItem(OFFLINE_STUDENTS_KEY, JSON.stringify(students));
      localStorage.setItem(OFFLINE_LAST_SYNC_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Failed to save students to offline cache:', e);
    }
  },

  // Retrieve cached student directory
  getStudentsFromOfflineCache: (): Student[] => {
    try {
      const data = localStorage.getItem(OFFLINE_STUDENTS_KEY);
      if (!data) return [];
      return JSON.parse(data) as Student[];
    } catch (e) {
      console.error('Failed to read offline students cache:', e);
      return [];
    }
  },

  // Save a student offline (creates or updates in local cache and enqueues sync)
  saveStudentOffline: (student: Student): Student[] => {
    const currentStudents = offlineCacheService.getStudentsFromOfflineCache();
    const index = currentStudents.findIndex(s => s.id === student.id);
    
    if (index >= 0) {
      currentStudents[index] = student;
    } else {
      currentStudents.unshift(student);
    }

    // Save updated list
    offlineCacheService.saveStudentsToOfflineCache(currentStudents);

    // Queue for background server sync
    offlineCacheService.enqueueStudentSync(student, index >= 0 ? 'update' : 'create');

    return currentStudents;
  },

  // Delete student offline
  deleteStudentOffline: (studentId: string): Student[] => {
    const currentStudents = offlineCacheService.getStudentsFromOfflineCache();
    const filtered = currentStudents.filter(s => s.id !== studentId);
    offlineCacheService.saveStudentsToOfflineCache(filtered);

    // Find student for sync
    const target = currentStudents.find(s => s.id === studentId);
    if (target) {
      offlineCacheService.enqueueStudentSync(target, 'delete');
    }
    return filtered;
  },

  // Queue changes made offline
  enqueueStudentSync: (student: Student, action: 'create' | 'update' | 'delete'): void => {
    try {
      const queue = offlineCacheService.getPendingStudentSyncQueue();
      // Remove existing pending items for same student if any
      const filtered = queue.filter(item => item.student.id !== student.id);
      filtered.push({
        student,
        action,
        timestamp: Date.now()
      });
      localStorage.setItem(PENDING_STUDENTS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to enqueue offline student sync:', e);
    }
  },

  // Get pending queue
  getPendingStudentSyncQueue: (): PendingStudentSync[] => {
    try {
      const data = localStorage.getItem(PENDING_STUDENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Clear queue after successful sync
  clearPendingStudentSyncQueue: (): void => {
    localStorage.removeItem(PENDING_STUDENTS_KEY);
  },

  // Get saved lesson plans including preloaded field templates
  getOfflineLessonPlans: (): SavedItem[] => {
    const userSaved = storageService.getAllItems();
    // Combine user saved plans with preloaded field templates if user hasn't saved them yet
    const existingIds = new Set(userSaved.map(item => item.id));
    const merged = [...userSaved];

    PRELOADED_OFFLINE_LESSON_PLANS.forEach(template => {
      if (!existingIds.has(template.id)) {
        merged.push(template);
      }
    });

    return merged;
  },

  // Get sync status metadata
  getOfflineStatus: (): { isOffline: boolean; cachedStudentCount: number; pendingSyncCount: number; lastSyncTime: number | null } => {
    const isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
    const cachedStudents = offlineCacheService.getStudentsFromOfflineCache();
    const pendingQueue = offlineCacheService.getPendingStudentSyncQueue();
    const lastSyncStr = localStorage.getItem(OFFLINE_LAST_SYNC_KEY);

    return {
      isOffline,
      cachedStudentCount: cachedStudents.length,
      pendingSyncCount: pendingQueue.length,
      lastSyncTime: lastSyncStr ? parseInt(lastSyncStr, 10) : null
    };
  }
};
