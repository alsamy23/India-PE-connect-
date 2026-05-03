
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface AppErrorLog {
  message: string;
  stack?: string;
  componentStack?: string;
  userId?: string;
  userEmail?: string;
  platform: string;
  url: string;
  timestamp: any;
  type: 'error' | 'promise_rejection' | 'react_error';
}

export const logError = async (error: any, type: AppErrorLog['type'] = 'error', extraInfo?: any) => {
  try {
    const user = auth.currentUser;
    const log: AppErrorLog = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      componentStack: extraInfo?.componentStack,
      userId: user?.uid,
      userEmail: user?.email || undefined,
      platform: navigator.userAgent,
      url: window.location.href,
      timestamp: serverTimestamp(),
      type
    };

    // Log to console as well for dev visibility
    console.group(`🔴 Remote Log [${type}]`);
    console.error(error);
    console.groupEnd();

    await addDoc(collection(db, 'system_logs'), log);
  } catch (err) {
    // Fail silently to avoid infinite loops if Firestore fails
    console.warn("Failed to send remote log:", err);
  }
};
