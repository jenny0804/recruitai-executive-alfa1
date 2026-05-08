/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { CandidateDashboard } from './components/CandidateDashboard';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoadingAuth(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    setLoadingAuth(true);
    try {
      // First get basic profile
      const { data: baseProfile, error: baseError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (baseError) throw baseError;

      // Join with specific data
      const table = baseProfile.role === 'reclutador' ? 'recruiters' : 'candidates';
      const { data: specificData, error: specificError } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .single();

      if (specificError) {
        console.warn(`Could not fetch specific data for ${table}:`, specificError);
        setProfile(baseProfile);
      } else {
        setProfile({ ...baseProfile, ...specificData });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    // Clear persistence keys on logout to ensure privacy on shared devices
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('chat_') || key.startsWith('master_profile_') || key.startsWith('job_offer_') || key.startsWith('scorecard_')) {
        localStorage.removeItem(key);
      }
    });
    await supabase.auth.signOut();
  };

  if (loadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  return (
    <>
      {profile?.role === 'reclutador' ? (
        <RecruiterDashboard 
          session={session} 
          profile={profile} 
          setProfile={setProfile} 
          handleLogout={handleLogout} 
        />
      ) : (
        <CandidateDashboard 
          session={session} 
          profile={profile} 
          setProfile={setProfile} 
          handleLogout={handleLogout} 
        />
      )}
    </>
  );
}