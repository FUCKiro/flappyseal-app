import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { app, db } from './firebase';

export interface User {
  uid: string;
  email: string;
  username: string;
  emailVerified: boolean;
}

export const auth = app ? getAuth(app) : null;

export const registerUser = async (email: string, password: string, username: string): Promise<User> => {
  if (!auth || !db) throw new Error('Firebase not configured');
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send verification email
    await sendEmailVerification(user);
    
    // Store additional user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      username,
      email
    });

    return {
      uid: user.uid,
      email: user.email!,
      username,
      emailVerified: user.emailVerified
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signIn = async (email: string, password: string): Promise<User> => {
  if (!auth || !db) throw new Error('Firebase not configured');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    return {
      uid: user.uid,
      email: user.email!,
      username: userData?.username,
      emailVerified: user.emailVerified
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const resendVerificationEmail = async () => {
  if (!auth) throw new Error('Firebase not configured');
  
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
  }
};

export const resetPassword = async (email: string) => {
  if (!auth) throw new Error('Firebase not configured');
  await sendPasswordResetEmail(auth, email);
};

export const signOut = () => {
  if (!auth) throw new Error('Firebase not configured');
  return firebaseSignOut(auth);
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!auth || !db) return null;
  
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data();

  return {
    uid: user.uid,
    email: user.email!,
    username: userData?.username,
    emailVerified: user.emailVerified
  };
};