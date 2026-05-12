/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore, useThemeStore } from './store';
import Layout from './components/Layout';
import Home from './pages/Home';
import TestLibrary from './pages/TestLibrary';
import TestSession from './pages/TestSession';
import Results from './pages/Results';
import Login from './pages/Login';
import History from './pages/History';
import Profile from './pages/Profile';

export default function App() {
  const [loading, setLoading] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  
  // Initialize theme
  useThemeStore();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              displayName: data.displayName,
              email: data.email,
              role: data.role || 'user',
              createdAt: data.createdAt?.toMillis() || Date.now(),
              age: data.age,
              gender: data.gender,
            });
          }
        } catch (e) {
          console.error("Failed to load user document", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tests" element={<TestLibrary />} />
          <Route path="tests/:testId" element={<TestSession />} />
          <Route path="results/:resultId" element={<Results />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
