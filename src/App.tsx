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
import SplashScreen from './components/SplashScreen';
import Home from './pages/Home';
import TestLibrary from './pages/TestLibrary';
import TestSession from './pages/TestSession';
import Results from './pages/Results';
import Login from './pages/Login';
import History from './pages/History';
import Profile from './pages/Profile';
import ClinicProfile from './pages/ClinicProfile';
import Psychologists from './pages/Psychologists';
import Appointments from './pages/Appointments';

import Onboarding from './pages/Onboarding';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  
  // Initialize theme
  useThemeStore();
  
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Show splash for at least 2 seconds

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

    return () => {
      unsubscribe();
      clearTimeout(splashTimer);
    };
  }, [setUser]);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  // Handle protected routing logic right here or let Layout / components handle it.
  // We can let Layout handle user missing setup by also wrapping Onboarding.

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tests" element={<TestLibrary />} />
          <Route path="tests/:testId" element={<TestSession />} />
          <Route path="clinics" element={<Psychologists />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="clinic-profile" element={<ClinicProfile />} />
          <Route path="results/:resultId" element={<Results />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
