
export enum BoardType {
  CBSE = 'CBSE',
  ICSE = 'ICSE',
  STATE = 'State Board',
  IB = 'IB'
}

export interface TeacherProfile {
  id: string;
  name: string;
  location: string;
  board: BoardType;
  specialization: string[];
  experience: number;
  avatar: string;
}

export interface LessonPlan {
  title: string;
  grade: string;
  sport: string;
  objectives: string[];
  duration: string;
  activities: {
    time: string;
    description: string;
    equipment: string[];
    coachingCues: string[];
  }[];
  suggestedGame: {
    name: string;
    rules: string[];
    setup: string;
  };
  warmupDiagramPrompt: string;
  warmupDiagramUrl?: string;
  explanationDiagramPrompt: string;
  explanationDiagramUrl?: string;
  gameDiagramPrompt: string;
  gameDiagramUrl?: string;
  assessmentRubric?: {
    criteria: string;
    beginner: string;
    intermediate: string;
    advanced: string;
  }[];
}

export interface UnitPlan {
  unitTitle: string;
  duration: string;
  weeklyBreakdown: {
    week: number;
    focus: string;
    keyLearning: string;
    suggestedDrills: string[];
  }[];
}

export interface Rubric {
  topic: string;
  categories: {
    name: string;
    levels: {
      name: string;
      description: string;
    }[];
  }[];
}

export interface Worksheet {
  title: string;
  content: {
    sectionTitle: string;
    questions: {
      question: string;
      type: 'MCQ' | 'Short' | 'Reflective';
      options?: string[];
    }[];
  }[];
}

export interface SkillProgression {
  skillName: string;
  level: string;
  phases: {
    phaseName: string;
    drills: string[];
    technicalFocus: string;
    diagramPrompt: string;
    diagramUrl?: string;
  }[];
}
