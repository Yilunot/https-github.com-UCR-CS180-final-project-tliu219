/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SessionLogger from './components/SessionLogger';
import FormAnalyzer from './components/FormAnalyzer';
import Login from './components/Login';
import { ViewState, Session, FormAnalysis, ArcherProfile } from './types';
import { motion } from 'motion/react';
import { Award, Calendar, Target as TargetIcon, Trash2 } from 'lucide-react';
import Onboarding from './components/Onboarding';
import Scorecard from './components/Scorecard';
import ArrowGuider from './components/ArrowGuider';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { calculateBraceHeight, calculateDrawLength, calculateArrowSpine, getIdealArrowLength } from './lib/archerUtils';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [analyses, setAnalyses] = useState<FormAnalysis[]>([]);
  const [profile, setProfile] = useState<ArcherProfile | null>(null);

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;
    try {
      const sessionRef = doc(db, 'users', user.uid, 'sessions', sessionId);
      await deleteDoc(sessionRef);
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        setActiveView('history');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/sessions/${sessionId}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setAuthLoading(false);
      if (!authUser) {
        setProfile(null);
        setSessions([]);
        setAnalyses([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Load Profile
    const loadProfile = async () => {
      setProfileLoading(true);
      const profileRef = doc(db, 'users', user.uid);
      try {
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as ArcherProfile);
        } else {
          setActiveView('onboarding');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();

    // Listen to Sessions
    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const q = query(sessionsRef, orderBy('date', 'desc'));
    
    const unsubscribeSessions = onSnapshot(q, (snapshot) => {
      const loadedSessions = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Session[];
      setSessions(loadedSessions);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${user.uid}/sessions`);
    });

    return () => {
      unsubscribeSessions();
    };
  }, [user]);

  const handleProfileComplete = async (newProfile: ArcherProfile) => {
    if (!user) return;
    try {
      // Ensure the profile ID matches the user UID for security rules
      const profileData = { ...newProfile, id: user.uid };
      await setDoc(doc(db, 'users', user.uid), profileData);
      setProfile(profileData);
      setActiveView('dashboard');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleSaveSession = async (session: Session) => {
    if (!user) return;
    try {
      const sessionRef = doc(collection(db, 'users', user.uid, 'sessions'));
      const sessionData = { ...session, id: sessionRef.id, archer_id: user.uid };
      await setDoc(sessionRef, sessionData);
      setSelectedSessionId(sessionRef.id);
      setActiveView('view_session');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/sessions`);
    }
  };

  const handleSaveAnalysis = (analysis: FormAnalysis) => {
    setAnalyses(prev => [...prev, analysis]);
    setActiveView('history');
  };

  const viewSessionDetail = (id: string) => {
    setSelectedSessionId(id);
    setActiveView('view_session');
  };

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-4 border-[#dcfc44] border-t-transparent rounded-full"
          />
          <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Syncing Tactical Data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={() => {}} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'onboarding':
        return <Onboarding onComplete={handleProfileComplete} initialData={profile || undefined} />;
      case 'arrow_tool':
        return <ArrowGuider />;
      case 'dashboard':
        return <Dashboard sessions={sessions} onViewSession={viewSessionDetail} />;
      case 'log_session':
        return <SessionLogger onSave={handleSaveSession} />;
      case 'analyze_form':
        return <FormAnalyzer onSave={handleSaveAnalysis} />;
      case 'view_session': {
        const session = sessions.find(s => s.id === selectedSessionId);
        if (!session) {
          setActiveView('history');
          return null;
        }
        return <Scorecard session={session} onBack={() => setActiveView('history')} />;
      }
      case 'profile':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold tracking-tight">Archer Profile</h2>
              <button 
                onClick={() => setActiveView('onboarding')}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-[#dcfc44] hover:border-[#dcfc44]/50 transition-all"
              >
                Edit Biometrics
              </button>
            </div>
            <div className="bg-[#151619] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-8">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-[#dcfc44] flex items-center justify-center text-black font-bold text-4xl uppercase shrink-0 shadow-[0_0_30px_rgba(220,252,68,0.2)]">
                  {profile?.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold">{profile?.name}</h4>
                  <p className="text-[10px] font-mono text-[#dcfc44] uppercase tracking-widest">{profile?.experience_level} LEVEL</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Bow Config</p>
                  <p className="text-sm font-bold uppercase">{profile?.bow_type} ({profile?.riser_length}" {profile?.limb_size})</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Draw Weight</p>
                  <p className="text-sm font-bold uppercase">{profile?.draw_weight} LBS</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Height</p>
                  <p className="text-sm font-bold uppercase">{profile?.height} CM</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Wingspan</p>
                  <p className="text-sm font-bold uppercase">{profile?.wingspan} CM</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Draw Length</p>
                  <p className="text-sm font-bold uppercase">{profile?.draw_length}"</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Arrow Length</p>
                  <p className="text-sm font-bold uppercase">{profile?.arrow_length}"</p>
                  <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase">Recommended: {profile ? getIdealArrowLength(profile.draw_length) : 0}"</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Spine</p>
                  <p className="text-sm font-bold uppercase">{profile?.arrow_spine}</p>
                  <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase">Recommended: {profile ? calculateArrowSpine(getIdealArrowLength(profile.draw_length), profile.draw_weight, profile.bow_type, profile.point_weight) : 0}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Anchor</p>
                  <p className="text-sm font-bold uppercase">{profile?.anchor_point}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Brace H.</p>
                  <p className="text-sm font-bold uppercase">{profile?.brace_height}"</p>
                  <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase">Recommended: {profile ? calculateBraceHeight(profile.riser_length || 25, profile.limb_size || 'medium') : 0}"</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-mono">Joined</p>
                  <p className="text-sm font-bold uppercase">{new Date(profile?.joined_date || 0).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            {/* Quick Stats in Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#151619] border border-white/10 p-6 rounded-2xl">
                 <h3 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-4">Training Discipline</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Consistency</span>
                      <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-[#dcfc44]" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Focus Score</span>
                      <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[72%] h-full bg-[#dcfc44]" />
                      </div>
                    </div>
                 </div>
              </div>
              <div className="bg-[#151619] border border-white/10 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                <TargetIcon className="w-8 h-8 text-[#dcfc44] mb-2" />
                <p className="text-xl font-bold">{sessions.length}</p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Active Missions</p>
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Mission Logs</h2>
            
            <div className="grid grid-cols-1 gap-12">
              <section>
                <div className="flex items-center gap-2 mb-6 p-2 border-b border-white/5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500">Historical Sessions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessions.length === 0 && <p className="text-gray-600 italic">No recorded sessions.</p>}
                  {sessions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(s => (
                    <div 
                      key={s.id} 
                      className="bg-[#151619] border border-white/10 p-5 rounded-2xl flex justify-between items-center group hover:border-[#dcfc44]/30 transition-all text-left w-full relative"
                    >
                      <button 
                        onClick={() => viewSessionDetail(s.id)}
                        className="flex-1 text-left"
                      >
                        <h4 className="font-bold mb-1 group-hover:text-[#dcfc44] transition-colors">{s.name}</h4>
                        <p className="text-[10px] text-gray-500 font-mono uppercase italic">{new Date(s.date).toLocaleDateString()}</p>
                      </button>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[#dcfc44] font-bold">{(s.shots.reduce((a, b) => a + b.score, 0) / s.shots.length || 0).toFixed(1)}</div>
                          <div className="text-[10px] text-gray-500 uppercase">{s.shots.length} SHOTS</div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}
                          className="p-2 hover:bg-red-500/10 text-gray-600 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-6 p-2 border-b border-white/5">
                  <Award className="w-4 h-4 text-gray-500" />
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500">Coaching Archives</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyses.length === 0 && <p className="text-gray-600 italic">No saved form analyses.</p>}
                  {analyses.slice().reverse().map(a => (
                    <div key={a.id} className="bg-[#151619] border border-white/10 rounded-2xl overflow-hidden group">
                      <div className="aspect-square w-full relative">
                        <img src={a.image_url || 'https://images.unsplash.com/photo-1541535881962-e668f28b4791?q=80&w=400&fit=crop'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#151619] via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{new Date(a.timestamp).toLocaleDateString()}</p>
                          <h4 className="font-bold text-sm">Biometric Scan</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        );
      default:
        return <Dashboard sessions={sessions} onViewSession={viewSessionDetail} />;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView} userName={profile?.name}>
      {renderView()}
    </Layout>
  );
}
