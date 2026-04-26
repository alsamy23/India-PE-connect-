
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Student, 
  Team, 
  FitnessResult, 
  School, 
  SchoolMember, 
  KIFTBattery,
  KIFTGradeCategory
} from '../types';

export type { 
  Student, 
  Team, 
  FitnessResult, 
  School, 
  SchoolMember, 
  KIFTBattery,
  KIFTGradeCategory
};

export const KIFT_BATTERIES: KIFTBattery[] = [
  {
    category: 'Primary',
    grades: ['1', '2', '3'],
    objective: 'Basic motor skills & coordination',
    tests: [
      { id: 'bmi', name: 'BMI (Height & Weight)', unit: 'kg/m²', description: 'Body Mass Index calculation.' },
      { id: 'flamingo', name: 'Flamingo Balance Test', unit: 'seconds', description: 'Stand on one leg for as long as possible.' },
      { id: 'plate_tapping', name: 'Plate Tapping Test', unit: 'seconds', description: 'Hand speed and coordination test.' },
      { id: 'sit_reach', name: 'Sit and Reach Test', unit: 'cm', description: 'Lower back and hamstring flexibility.' }
    ]
  },
  {
    category: 'Upper Primary',
    grades: ['4', '5'],
    objective: 'Introduce fitness components',
    tests: [
      { id: 'bmi', name: 'BMI', unit: 'kg/m²', description: 'Body Mass Index.' },
      { id: 'flamingo', name: 'Flamingo Balance', unit: 'seconds', description: 'Balance test.' },
      { id: 'plate_tapping', name: 'Plate Tapping', unit: 'seconds', description: 'Hand speed.' },
      { id: 'sit_reach', name: 'Sit & Reach', unit: 'cm', description: 'Flexibility.' },
      { id: 'broad_jump', name: 'Standing Broad Jump', unit: 'cm', description: 'Leg power.' },
      { id: 'sprint_50m', name: '50m Sprint', unit: 'seconds', description: 'Speed test.' }
    ]
  },
  {
    category: 'Middle School',
    grades: ['6', '7', '8'],
    objective: 'Skill + performance tracking',
    tests: [
      { id: 'bmi', name: 'BMI', unit: 'kg/m²', description: 'Body Mass Index.' },
      { id: 'sprint_50m', name: '50m Sprint', unit: 'seconds', description: 'Speed.' },
      { id: 'run_600m', name: '600m Run/Walk', unit: 'min:sec', description: 'Endurance.' },
      { id: 'broad_jump', name: 'Standing Broad Jump', unit: 'cm', description: 'Power.' },
      { id: 'sit_reach', name: 'Sit & Reach', unit: 'cm', description: 'Flexibility.' },
      { id: 'shuttle_4x10', name: '4×10m Shuttle Run', unit: 'seconds', description: 'Agility.' }
    ]
  },
  {
    category: 'Secondary',
    grades: ['9', '10'],
    objective: 'Fitness benchmarking',
    tests: [
      { id: 'bmi', name: 'BMI', unit: 'kg/m²', description: 'Body Mass Index.' },
      { id: 'sprint_50m', name: '50m Sprint', unit: 'seconds', description: 'Speed.' },
      { id: 'run_600m', name: '600m Run', unit: 'min:sec', description: 'Endurance.' },
      { id: 'broad_jump', name: 'Standing Broad Jump', unit: 'cm', description: 'Power.' },
      { id: 'sit_reach', name: 'Sit & Reach', unit: 'cm', description: 'Flexibility.' },
      { id: 'shuttle_4x10', name: '4×10m Shuttle Run', unit: 'seconds', description: 'Agility.' },
      { id: 'pushups', name: 'Push-Ups / Modified Push-Ups', unit: 'reps', description: 'Strength (Boys: Standard, Girls: Modified).' },
      { id: 'curl_ups', name: 'Partial Curl-Ups', unit: 'reps', description: 'Core strength.' }
    ]
  },
  {
    category: 'Senior Secondary',
    grades: ['11', '12'],
    objective: 'Performance + health profiling',
    tests: [
      { id: 'bmi', name: 'BMI', unit: 'kg/m²', description: 'Body Mass Index.' },
      { id: 'sprint_50m', name: '50m Sprint', unit: 'seconds', description: 'Speed.' },
      { id: 'run_long', name: '1000m (Boys) / 800m (Girls)', unit: 'min:sec', description: 'Endurance.' },
      { id: 'broad_jump', name: 'Standing Broad Jump', unit: 'cm', description: 'Power.' },
      { id: 'sit_reach', name: 'Sit & Reach', unit: 'cm', description: 'Flexibility.' },
      { id: 'shuttle_run', name: 'Shuttle Run', unit: 'seconds', description: 'Agility.' },
      { id: 'pushups', name: 'Push-Ups', unit: 'reps', description: 'Strength.' },
      { id: 'curl_ups', name: 'Curl-Ups', unit: 'reps', description: 'Core strength.' }
    ]
  }
];

export const fitnessService = {
  // School Management
  saveSchool: async (school: School) => {
    await setDoc(doc(db, 'schools', school.id), school);
    // Also set the admin as a member
    await setDoc(doc(db, 'schoolMembers', school.adminId), {
      uid: school.adminId,
      schoolId: school.id,
      role: 'admin'
    });
  },

  getSchool: async (schoolId: string): Promise<School | null> => {
    const docSnap = await getDoc(doc(db, 'schools', schoolId));
    return docSnap.exists() ? docSnap.data() as School : null;
  },

  getSchoolMember: async (uid: string): Promise<SchoolMember | null> => {
    const docSnap = await getDoc(doc(db, 'schoolMembers', uid));
    return docSnap.exists() ? docSnap.data() as SchoolMember : null;
  },

  addTeamMember: async (member: SchoolMember) => {
    await setDoc(doc(db, 'schoolMembers', member.uid), member);
  },

  getSchoolMembers: async (schoolId: string): Promise<SchoolMember[]> => {
    const q = query(collection(db, 'schoolMembers'), where('schoolId', '==', schoolId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as SchoolMember);
  },

  // Students
  saveStudent: async (student: Student) => {
    await setDoc(doc(db, 'students', student.id), student);
  },
  
  getStudents: async (teacherId: string, schoolId?: string, isAdmin = false): Promise<Student[]> => {
    let q;
    if (isAdmin && schoolId) {
      q = query(collection(db, 'students'), where('schoolId', '==', schoolId));
    } else {
      q = query(collection(db, 'students'), where('teacherId', '==', teacherId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => doc.data() as Student);
  },

  deleteStudent: async (id: string) => {
    await deleteDoc(doc(db, 'students', id));
  },

  // Teams
  saveTeam: async (team: Team) => {
    await setDoc(doc(db, 'teams', team.id), team);
  },

  getTeams: async (teacherId: string, schoolId?: string, isAdmin = false): Promise<Team[]> => {
    let q;
    if (isAdmin && schoolId) {
      q = query(collection(db, 'teams'), where('schoolId', '==', schoolId));
    } else {
      q = query(collection(db, 'teams'), where('teacherId', '==', teacherId));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => doc.data() as Team);
  },

  // Results
  saveResult: async (result: FitnessResult) => {
    await setDoc(doc(db, 'results', result.id), result);
  },

  getRecentResults: async (teacherId: string, schoolId?: string, isAdmin = false, limitCount = 10): Promise<FitnessResult[]> => {
    let q;
    if (isAdmin && schoolId) {
      q = query(
        collection(db, 'results'), 
        where('schoolId', '==', schoolId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, 'results'), 
        where('teacherId', '==', teacherId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: any) => doc.data() as FitnessResult);
  },

  // Real-time listeners
  subscribeToResults: (teacherId: string, schoolId: string | undefined, isAdmin: boolean, callback: (results: FitnessResult[]) => void) => {
    let q;
    if (isAdmin && schoolId) {
      q = query(
        collection(db, 'results'),
        where('schoolId', '==', schoolId),
        orderBy('date', 'desc'),
        limit(100)
      );
    } else {
      q = query(
        collection(db, 'results'),
        where('teacherId', '==', teacherId),
        orderBy('date', 'desc'),
        limit(100)
      );
    }
    return onSnapshot(q, (snapshot: any) => {
      callback(snapshot.docs.map((doc: any) => doc.data() as FitnessResult));
    }, (error: any) => {
      console.error("Firestore Error:", error);
    });
  },

  subscribeToStudents: (teacherId: string, schoolId: string | undefined, isAdmin: boolean, callback: (students: Student[]) => void) => {
    let q;
    if (isAdmin && schoolId) {
      q = query(collection(db, 'students'), where('schoolId', '==', schoolId));
    } else {
      q = query(collection(db, 'students'), where('teacherId', '==', teacherId));
    }
    return onSnapshot(q, (snapshot: any) => {
      callback(snapshot.docs.map((doc: any) => doc.data() as Student));
    }, (error: any) => {
      console.error("Firestore Error in students subscription:", error);
    });
  },

  subscribeToTeams: (teacherId: string, schoolId: string | undefined, isAdmin: boolean, callback: (teams: Team[]) => void) => {
    let q;
    if (isAdmin && schoolId) {
      q = query(collection(db, 'teams'), where('schoolId', '==', schoolId));
    } else {
      q = query(collection(db, 'teams'), where('teacherId', '==', teacherId));
    }
    return onSnapshot(q, (snapshot: any) => {
      callback(snapshot.docs.map((doc: any) => doc.data() as Team));
    }, (error: any) => {
      console.error("Firestore Error in teams subscription:", error);
    });
  },

  // Helper to get battery by grade
  getBatteryForGrade: (grade: string): KIFTBattery | undefined => {
    return KIFT_BATTERIES.find(b => b.grades.includes(grade));
  }
};
