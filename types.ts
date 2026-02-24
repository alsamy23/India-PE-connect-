
export enum BoardType {
  CBSE = 'CBSE',
  ICSE = 'ICSE',
  STATE = 'State Board',
  IB = 'IB'
}

export type Language = 'English' | 'Hindi' | 'Marathi' | 'Tamil' | 'Bengali';

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
  // Header Info
  teacher: string;
  subject: string;
  grade: string;
  date: string;
  topic: string;
  period: string;
  termWeek: string;
  duration: string;

  // Framework
  equipment: string[];
  teachingAids: string[];
  safety: string[];
  keyVocabulary: string[];
  sen: {
    wave1: string;
    wave2: string;
    wave3: string;
  };
  objectives: {
    know: string;
    understand: string;
    beAbleTo: string;
  };
  successCriteria: {
    all: string;
    most: string;
    some: string;
  };

  // Structure
  starter: {
    time: string;
    title: string;
    description: string;
  };
  mainActivity: {
    time: string;
    activities: {
      title: string;
      description: string;
      coachingPoints: string[];
    }[];
  };
  plenary: {
    time: string;
    title: string;
    description: string;
  };

  // Footer Info
  homework: string;
  collaboration: string;
  differentiation: string;
  criticalThinking: string;

  // Visuals
  warmupDiagramPrompt: string;
  warmupDiagramUrl?: string;
  explanationDiagramPrompt: string;
  explanationDiagramUrl?: string;
  gameDiagramPrompt: string;
  gameDiagramUrl?: string;
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

export interface TheoryContent {
  title: string;
  contentType: 'Notes' | 'MCQ' | 'CaseStudy';
  content: string;
  questions: {
    question: string;
    answer: string;
    type: string;
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

export interface YearlyPlan {
  grade: string;
  board: string;
  academicYear: string;
  duration: string;
  generatedDate: string;
  terms: {
    termName: string;
    months: {
      monthName: string;
      weeks: {
        weekNumber: number;
        status: 'Instructional' | 'Holiday' | 'Exam' | 'Event';
        dates: string;
        topic: string;
        details: string;
      }[];
    }[];
  }[];
}

export interface FitnessAssessment {
  studentName: string;
  age: number;
  gender: 'Male' | 'Female';
  tests: {
    testName: string;
    score: string;
    percentile: string;
    rating: 'Needs Improvement' | 'Average' | 'Good' | 'Excellent' | 'Elite';
    recommendation: string;
  }[];
  overallSummary: string;
}

export interface BiomechanicsConcept {
  concept: string;
  sportApplication: string;
  explanation: string;
  analogy: string;
  diagramPrompt: string;
  diagramUrl?: string;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
