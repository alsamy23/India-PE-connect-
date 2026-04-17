
import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { motion } from 'motion/react';
import { Mail, Lock, User, School, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import Logo from './Logo';

interface AuthProps {
  onBack?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user already has a profile
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      
      if (userDoc.empty) {
        // Handle new user registration from Google
        // Check for pending invited memberships
        const membersRef = collection(db, 'schoolMembers');
        const q = query(membersRef, where('email', '==', user.email), where('uid', '>=', 'pending_'), where('uid', '<=', 'pending_' + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        
        let schoolId = '';
        let role = 'admin';

        if (!querySnapshot.empty) {
          const pendingMemberDoc = querySnapshot.docs[0];
          const data = pendingMemberDoc.data();
          schoolId = data.schoolId;
          role = data.role || 'teacher';
          await deleteDoc(pendingMemberDoc.ref);
        } else {
          schoolId = Math.random().toString(36).substr(2, 9);
          await setDoc(doc(db, 'schools', schoolId), {
            id: schoolId,
            name: 'My School',
            adminId: user.uid,
            createdAt: new Date().toISOString()
          });
        }
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Teacher',
          schoolName: 'My School',
          schoolId,
          role,
          createdAt: new Date().toISOString()
        });

        await setDoc(doc(db, 'schoolMembers', user.uid), {
          uid: user.uid,
          schoolId: schoolId,
          role,
          displayName: user.displayName || 'Teacher',
          email: user.email
        });
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName });

        // Check for pending invited memberships
        const membersRef = collection(db, 'schoolMembers');
        const q = query(membersRef, where('email', '==', email), where('uid', '>=', 'pending_'), where('uid', '<=', 'pending_' + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        
        let schoolId = '';
        let role = 'admin';

        if (!querySnapshot.empty) {
          // Claim existing pending membership
          const pendingMemberDoc = querySnapshot.docs[0];
          const data = pendingMemberDoc.data();
          schoolId = data.schoolId;
          role = data.role || 'teacher';
          
          // Delete pending record
          await deleteDoc(pendingMemberDoc.ref);
        } else {
          // Create new school if no pending invitation
          schoolId = Math.random().toString(36).substr(2, 9);
          
          await setDoc(doc(db, 'schools', schoolId), {
            id: schoolId,
            name: schoolName || 'New School',
            adminId: user.uid,
            createdAt: new Date().toISOString()
          });
        }
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName,
          schoolName: schoolName || (schoolId ? 'My School' : 'New School'),
          schoolId,
          role,
          createdAt: new Date().toISOString()
        });

        // Add as proper school member
        await setDoc(doc(db, 'schoolMembers', user.uid), {
          uid: user.uid,
          schoolId: schoolId,
          role,
          displayName,
          email: user.email
        });
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      let userFriendlyMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        userFriendlyMessage = 'This email is already registered. Please log in instead or use a different email.';
        setIsLogin(true); // Automatically switch to login mode for convenience
      } else if (err.code === 'auth/operation-not-allowed') {
        userFriendlyMessage = 'Email/Password registration is not enabled for this project. Please contact the administrator or enable it in the Firebase Console.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        userFriendlyMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/invalid-email') {
        userFriendlyMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        userFriendlyMessage = 'Password should be at least 6 characters.';
      } else if (err.message) {
        userFriendlyMessage = err.message;
      }
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] border-4 border-slate-900 p-8 md:p-12 shadow-2xl relative"
      >
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute left-6 top-6 p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex flex-col items-center mb-10">
          <Logo showText={false} className="mb-4" />
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter text-center">
            {isLogin ? 'Welcome Back' : 'Join SmartPE India'}
          </h1>
          <p className="text-slate-500 font-medium text-center mt-2">
            {isLogin ? 'Log in to manage your school' : 'Register to start your PE journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-primary transition-all"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="School Name"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-primary transition-all"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email" 
              placeholder="Email Address"
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-primary transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="Password"
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:border-primary transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold px-2">{error}</p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white border-2 border-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-container transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>{isLogin ? 'Log In' : 'Register Now'}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 font-black uppercase tracking-widest">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google Account</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 font-bold text-sm hover:text-primary transition-colors"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Log In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
