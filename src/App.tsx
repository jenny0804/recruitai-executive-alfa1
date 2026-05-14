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
  const [lastFetchedId, setLastFetchedId] = useState<string | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoadingAuth(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setProfile(null);
        setLastFetchedId(null);
        setLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id && session.user.id !== lastFetchedId) {
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id, lastFetchedId]);

  const fetchProfile = async (userId: string) => {
    setLastFetchedId(userId);
    setLoadingAuth(true);
    try {
      // 1. Try to get base profile
      let { data: baseProfile, error: baseError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      // 2. If profile is missing (PGRST116), try to reconcile from session metadata
      if (baseError && baseError.code === 'PGRST116' && session?.user) {
        console.warn("Profile not found, reconciling from session...");
        const metadata = session.user.user_metadata || {};
        baseProfile = {
          id: userId,
          email: session.user.email,
          role: metadata.role || 'candidato',
          full_name: metadata.full_name || 'Usuario',
          company_name: metadata.company_name || ''
        };
      } else if (baseError) {
        throw baseError;
      }

      if (!baseProfile) throw new Error("Perfil no encontrado.");

      // 3. Join with specific data
      const table = baseProfile.role === 'reclutador' ? 'recruiters' : 'candidates';
      const { data: specificData, error: specificError } = await supabase
        .from(table)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (specificError) {
        console.warn(`Could not fetch specific data for ${table}:`, specificError);
        setProfile(baseProfile);
      } else {
        setProfile({ ...baseProfile, ...specificData });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (!profile) {
        setProfile(null);
      }
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

  if (loadingAuth || (session && !profile)) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-medium animate-pulse">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  // Final safety check: if we have session but for some reason profile failed to load despite the wait
  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <h2 className="text-slate-900 font-bold mb-2">Error de sesión</h2>
        <p className="text-slate-500 text-sm mb-6">No se pudo cargar la información de tu perfil.</p>
        <button 
          onClick={() => handleLogout()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100"
        >
          Cerrar Sesión e Intentar de nuevo
        </button>
      </div>
    );
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