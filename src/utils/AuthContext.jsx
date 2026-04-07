import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (snap.exists()) setUserProfile(snap.data());
        } catch (e) {}
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile = {
      uid: cred.user.uid,
      name,
      email,
      role: 'student',
      enrolledCourses: [],
      completedLessons: [],
      quizScores: [],
      joinedAt: new Date().toISOString(),
      streak: 0,
      totalPoints: 0,
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    setUserProfile(profile);
    return cred;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!snap.exists()) {
      const profile = {
        uid: cred.user.uid,
        name: cred.user.displayName,
        email: cred.user.email,
        role: 'student',
        enrolledCourses: [],
        completedLessons: [],
        quizScores: [],
        joinedAt: new Date().toISOString(),
        streak: 0,
        totalPoints: 0,
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      setUserProfile(profile);
    } else {
      setUserProfile(snap.data());
    }
    return cred;
  };

  const logout = () => signOut(auth);

  const isAdmin =
    userProfile?.role === 'admin' || userProfile?.role === 'teacher';

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, loginWithGoogle, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
