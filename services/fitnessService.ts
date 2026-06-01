
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
import { db, auth } from './firebase';
import { logError } from './logService';
import { 
  Student, 
  Team, 
  FitnessResult, 
  School, 
  SchoolMember, 
  KIFTBattery,
  KIFTGradeCategory
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  const errorString = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorString);
  logError(error, 'error', errInfo);
  throw new Error(errorString);
}

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
      { id: 'flamingo', name: 'Flamingo Balance Test', unit: 'count', description: 'Number of falls in 60 seconds.' },
      { id: 'plate_tapping', name: 'Plate Tapping Test', unit: 'count', description: 'Number of taps in 30 seconds.' },
      { id: 'sit_reach', name: 'Sit and Reach Test', unit: 'cm', description: 'Lower back and hamstring flexibility.' },
      { id: 'shuttle_run', name: 'Shuttle Run (4x10m)', unit: 'seconds', description: 'Agility and coordination test.' }
    ]
  },
  {
    category: 'Upper Primary',
    grades: ['4', '5'],
    objective: 'Introduce fitness components',
    tests: [
      { id: 'bmi', name: 'BMI', unit: 'kg/m²', description: 'Body Mass Index.' },
      { id: 'flamingo', name: 'Flamingo Balance', unit: 'count', description: 'Number of falls in 60 seconds.' },
      { id: 'plate_tapping', name: 'Plate Tapping', unit: 'count', description: 'Number of taps in 30 seconds.' },
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
      { id: 'pushups', name: 'Push-Ups / Modified Push-Ups', unit: 'count', description: 'Strength (Boys: Standard, Girls: Modified).' },
      { id: 'curl_ups', name: 'Partial Curl-Ups', unit: 'count', description: 'Core strength.' }
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
      { id: 'pushups', name: 'Push-Ups', unit: 'count', description: 'Strength.' },
      { id: 'curl_ups', name: 'Curl-Ups', unit: 'count', description: 'Core strength.' }
    ]
  }
];

export const fitnessService = {
  // School Management
  saveSchool: async (school: School) => {
    const path = `schools/${school.id}`;
    try {
      await setDoc(doc(db, 'schools', school.id), school);
      // Also set the admin as a member
      await setDoc(doc(db, 'schoolMembers', school.adminId), {
        uid: school.adminId,
        schoolId: school.id,
        role: 'admin'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  getSchool: async (schoolId: string): Promise<School | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'schools', schoolId));
      return docSnap.exists() ? docSnap.data() as School : null;
    } catch (err) {
      logError(err, 'error', { context: 'getSchool failed', schoolId });
      return null;
    }
  },

  deleteSchoolMember: async (uid: string) => {
    const path = `schoolMembers/${uid}`;
    try {
      await deleteDoc(doc(db, 'schoolMembers', uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  getSchoolMember: async (uid: string): Promise<SchoolMember | null> => {
    try {
      const docSnap = await getDoc(doc(db, 'schoolMembers', uid));
      return docSnap.exists() ? docSnap.data() as SchoolMember : null;
    } catch (err) {
      logError(err, 'error', { context: 'getSchoolMember failed', uid });
      return null;
    }
  },

  addTeamMember: async (member: SchoolMember) => {
    try {
      await setDoc(doc(db, 'schoolMembers', member.uid), member);
    } catch (err) {
      logError(err, 'error', { context: 'addTeamMember failed', memberUid: member.uid });
      throw err;
    }
  },

  getSchoolMembers: async (schoolId: string): Promise<SchoolMember[]> => {
    try {
      const q = query(collection(db, 'schoolMembers'), where('schoolId', '==', schoolId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as SchoolMember);
    } catch (err) {
      logError(err, 'error', { context: 'getSchoolMembers failed', schoolId });
      return [];
    }
  },

  // Students
  saveStudent: async (student: Student) => {
    const path = `students/${student.id}`;
    // Default schoolId for records not specifically linked
    if (!student.schoolId) {
      student.schoolId = `personal_${student.teacherId}`;
    }
    try {
      await setDoc(doc(db, 'students', student.id), student);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  bulkSaveStudents: async (students: Student[]) => {
    // For smaller batches, we can iterate, but for larger we'd use writeBatch
    // Let's use individual setDoc for now as it's easier to track errors if any
    const promises = students.map(student => setDoc(doc(db, 'students', student.id), student));
    try {
      await Promise.all(promises);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'bulk_students');
    }
  },
  
  isSuperAdmin: () => {
    return auth.currentUser?.email === 'alsamy36@gmail.com';
  },

  getAllSchools: async (): Promise<School[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'schools'));
      return snapshot.docs.map(doc => doc.data() as School);
    } catch (err) {
      logError(err, 'error', { context: 'getAllSchools failed' });
      return [];
    }
  },

  getStudents: async (teacherId: string, schoolId?: string, isAdmin = false): Promise<Student[]> => {
    try {
      let q;
      if (auth.currentUser?.email === 'alsamy36@gmail.com') {
        q = query(collection(db, 'students'));
      } else if (isAdmin && schoolId) {
        q = query(collection(db, 'students'), where('schoolId', '==', schoolId));
      } else {
        q = query(collection(db, 'students'), where('teacherId', '==', teacherId));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => doc.data() as Student);
    } catch (err) {
      logError(err, 'error', { context: 'getStudents failed', teacherId, schoolId, isAdmin });
      return [];
    }
  },

  deleteStudent: async (id: string) => {
    const studentPath = `students/${id}`;
    try {
      // Get all results for this student
      const q = query(collection(db, 'results'), where('studentId', '==', id));
      const snapshot = await getDocs(q);
      
      // Delete results (could use writeBatch for efficiency)
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'results', docSnap.id)));
      await Promise.all(deletePromises);
      
      // Delete student
      await deleteDoc(doc(db, 'students', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, studentPath);
    }
  },

  // Teams
  saveTeam: async (team: Team) => {
    const path = `teams/${team.id}`;
    try {
      await setDoc(doc(db, 'teams', team.id), team);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  getTeams: async (teacherId: string, schoolId?: string, isAdmin = false): Promise<Team[]> => {
    try {
      let q;
      if (auth.currentUser?.email === 'alsamy36@gmail.com') {
        q = query(collection(db, 'teams'));
      } else if (isAdmin && schoolId) {
        q = query(collection(db, 'teams'), where('schoolId', '==', schoolId));
      } else {
        q = query(collection(db, 'teams'), where('teacherId', '==', teacherId));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => doc.data() as Team);
    } catch (err) {
      logError(err, 'error', { context: 'getTeams failed', teacherId, schoolId, isAdmin });
      return [];
    }
  },

  // Results
  saveResult: async (result: FitnessResult) => {
    const path = `results/${result.id}`;
    // Default schoolId for records not specifically linked
    if (!result.schoolId) {
      result.schoolId = `personal_${result.teacherId}`;
    }
    try {
      await setDoc(doc(db, 'results', result.id), result);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  getRecentResults: async (teacherId: string, schoolId?: string, isAdmin = false, limitCount = 10): Promise<FitnessResult[]> => {
    try {
      let q;
      if (auth.currentUser?.email === 'alsamy36@gmail.com') {
        q = query(
          collection(db, 'results'), 
          orderBy('date', 'desc'),
          limit(limitCount)
        );
      } else if (isAdmin && schoolId) {
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
    } catch (err) {
      logError(err, 'error', { context: 'getRecentResults failed', teacherId, schoolId, isAdmin });
      return [];
    }
  },

  // Real-time listeners
  deleteResult: async (id: string) => {
    const path = `results/${id}`;
    try {
      await deleteDoc(doc(db, 'results', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  subscribeToResults: (teacherId: string, schoolId: string | undefined, isAdmin: boolean, callback: (results: FitnessResult[]) => void) => {
    let q;
    if (auth.currentUser?.email === 'alsamy36@gmail.com') {
      q = query(
        collection(db, 'results'),
        orderBy('date', 'desc'),
        limit(100)
      );
    } else if (isAdmin && schoolId) {
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
      logError(error, 'error', { context: 'Results subscription failed' });
    });
  },

  subscribeToStudentResults: (studentId: string, callback: (results: FitnessResult[]) => void) => {
    const q = query(
      collection(db, 'results'),
      where('studentId', '==', studentId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot: any) => {
      callback(snapshot.docs.map((doc: any) => doc.data() as FitnessResult));
    }, (error: any) => {
      console.error("Firestore Error in student results subscription:", error);
      logError(error, 'error', { context: 'Student results subscription failed', studentId });
    });
  },

  subscribeToStudents: (teacherId: string, schoolId: string | undefined, isAdmin: boolean, callback: (students: Student[]) => void) => {
    let q;
    if (auth.currentUser?.email === 'alsamy36@gmail.com') {
      q = query(collection(db, 'students'));
    } else if (isAdmin && schoolId) {
      q = query(collection(db, 'students'), where('schoolId', '==', schoolId));
    } else {
      q = query(collection(db, 'students'), where('teacherId', '==', teacherId));
    }
    return onSnapshot(q, (snapshot: any) => {
      callback(snapshot.docs.map((doc: any) => doc.data() as Student));
    }, (error: any) => {
      console.error("Firestore Error in students subscription:", error);
      logError(error, 'error', { context: 'Students subscription failed' });
    });
  },

  subscribeToTeams: (teacherId: string, schoolId: string | undefined, isAdmin: boolean, callback: (teams: Team[]) => void) => {
    let q;
    if (auth.currentUser?.email === 'alsamy36@gmail.com') {
      q = query(collection(db, 'teams'));
    } else if (isAdmin && schoolId) {
      q = query(collection(db, 'teams'), where('schoolId', '==', schoolId));
    } else {
      q = query(collection(db, 'teams'), where('teacherId', '==', teacherId));
    }
    return onSnapshot(q, (snapshot: any) => {
      callback(snapshot.docs.map((doc: any) => doc.data() as Team));
    }, (error: any) => {
      console.error("Firestore Error in teams subscription:", error);
      logError(error, 'error', { context: 'Teams subscription failed' });
    });
  },

  // Helper to get battery by grade
  getBatteryForGrade: (grade: string): KIFTBattery | undefined => {
    return KIFT_BATTERIES.find(b => b.grades.includes(grade));
  }
};
