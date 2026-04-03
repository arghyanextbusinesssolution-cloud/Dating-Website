'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import CheckInCalendar from '@/components/CheckInCalendar';

/**
 * ✨ Soul Button - Your Inner Work Space
 * 
 * The Soul button represents your journey of inner growth and conscious connection.
 * This is where you prepare yourself for meaningful love - not just swipe for it.
 */

type PathChoice = 'check-in' | 'reflect' | 'grow' | null;
type Section = 'check-in' | 'journal' | 'readiness' | 'rituals' | 'growth' | 'library';
type Emotion = 'calm' | 'heavy' | 'open' | 'confused' | 'hopeful';
type Need = 'connection' | 'healing' | 'clarity' | 'growth' | 'rest';
type Energy = 'low' | 'balanced' | 'high';

export default function SoulPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [pathChoice, setPathChoice] = useState<PathChoice>(null);
  const [activeSection, setActiveSection] = useState<Section>('check-in');
  const [hasMatches, setHasMatches] = useState(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null);
  const [checkInData, setCheckInData] = useState({
    emotion: null as Emotion | null,
    need: null as Need | null,
    energy: null as Energy | null,
  });
  const [todayCheckIn, setTodayCheckIn] = useState<any>(null);
  const [savingCheckIn, setSavingCheckIn] = useState(false);
  const [soulScore, setSoulScore] = useState<number | null>(null);
  const [loadingCheckIn, setLoadingCheckIn] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // Check if user has matches
    checkMatches();
    // Fetch user profile photo
    fetchUserProfile();
    // Fetch today's check-in and soul score
    fetchTodayCheckIn();
    fetchSoulScore();
  }, [user, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/profiles/me');
      if (response.data.success && response.data.profile) {
        const photo = response.data.profile.photos?.find((p: any) => p.isPrimary)?.url || response.data.profile.photos?.[0]?.url;
        setUserProfilePhoto(photo || null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkMatches = async () => {
    try {
      const response = await api.get('/matches/my-matches');
      if (response.data.success && response.data.matches?.length > 0) {
        setHasMatches(true);
      }
    } catch (error) {
      console.error('Error checking matches:', error);
    }
  };

  const handlePathChoice = (path: PathChoice) => {
    setPathChoice(path);
    setShowWelcome(false);
    if (path === 'check-in') {
      setActiveSection('check-in');
    } else if (path === 'reflect') {
      setActiveSection('journal');
    } else if (path === 'grow') {
      setActiveSection('readiness');
    }
  };

  const fetchTodayCheckIn = async () => {
    try {
      setLoadingCheckIn(true);
      const response = await api.get('/soul/check-in');
      if (response.data.success && response.data.checkIn) {
        setTodayCheckIn(response.data.checkIn);
        setCheckInData({
          emotion: response.data.checkIn.emotion,
          need: response.data.checkIn.need,
          energy: response.data.checkIn.energy,
        });
      }
    } catch (error) {
      console.error('Error fetching check-in:', error);
    } finally {
      setLoadingCheckIn(false);
    }
  };

  const fetchSoulScore = async () => {
    try {
      const response = await api.get('/soul/score');
      if (response.data.success) {
        setSoulScore(response.data.score);
      }
    } catch (error) {
      console.error('Error fetching soul score:', error);
    }
  };

  const saveCheckIn = async () => {
    if (!checkInData.emotion || !checkInData.need || !checkInData.energy) {
      return;
    }

    setSavingCheckIn(true);
    try {
      const response = await api.post('/soul/check-in', {
        emotion: checkInData.emotion,
        need: checkInData.need,
        energy: checkInData.energy,
      });

      if (response.data.success) {
        setTodayCheckIn(response.data.checkIn);
        await fetchSoulScore();
        showNotification('You\'ve aligned with yourself today. ✨');
        // Don't clear check-in data since it's saved
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        showNotification(error.response.data.message || 'You have already checked in today.', 'info');
        await fetchTodayCheckIn(); // Refresh to show today's check-in
      } else {
        showNotification('Error saving check-in. Please try again.', 'error');
      }
    } finally {
      setSavingCheckIn(false);
    }
  };

  const journalPrompts = [
    "What did today teach you about love?",
    "What are you healing from right now?",
    "What does conscious connection mean to you?",
    "How do you want to show up in relationships?",
    "What boundaries are you learning to set?",
    "What are you grateful for in your journey?",
  ];

  const readinessStages = [
    {
      id: 'knowing-self',
      title: 'Knowing Self',
      description: 'Understanding who you are at your core',
      questions: [
        "What are my core values?",
        "What do I need to feel safe and loved?",
        "What are my relationship patterns?",
      ],
      status: 'completed',
    },
    {
      id: 'healing-patterns',
      title: 'Healing Patterns',
      description: 'Working through old wounds and patterns',
      questions: [
        "What patterns am I ready to release?",
        "What healing do I need to do?",
        "How can I love myself more fully?",
      ],
      status: 'in-progress',
    },
    {
      id: 'conscious-love',
      title: 'Conscious Love',
      description: 'Preparing for conscious relationships',
      questions: [
        "What does conscious love mean to me?",
        "How do I communicate my needs?",
        "What am I ready to give and receive?",
      ],
      status: 'locked',
    },
    {
      id: 'sacred-partnership',
      title: 'Sacred Partnership',
      description: 'Ready for deep, meaningful connection',
      questions: [
        "What does sacred partnership look like?",
        "How do I create intimacy safely?",
        "What does commitment mean to me?",
      ],
      status: 'locked',
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <ResponsiveLayout userProfilePhoto={userProfilePhoto}>
      {showWelcome ? (
        <>
          {/* Mobile Welcome Screen */}
          <div className="md:hidden min-h-screen bg-white/10 flex flex-col pb-20">
            <div className="flex-1 flex items-center justify-center px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8 w-full max-w-md mx-auto"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-8xl mb-4"
                >
                  ✨
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Come back to yourself.</h1>
                <p className="text-lg text-gray-600 mb-8">Choose today's path</p>

                <div className="space-y-4">
                  {[
                    { id: 'check-in' as PathChoice, label: 'Check In', icon: '💭', desc: 'Quick emotional check-in' },
                    { id: 'reflect' as PathChoice, label: 'Reflect', icon: '📝', desc: 'Journal and reflect' },
                    { id: 'grow' as PathChoice, label: 'Grow', icon: '🌱', desc: 'Continue your journey' },
                  ].map((path) => (
                    <motion.button
                      key={path.id}
                      onClick={() => handlePathChoice(path.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-lg text-left flex items-center gap-4 hover:shadow-xl transition-shadow"
                    >
                      <span className="text-4xl">{path.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{path.label}</h3>
                        <p className="text-sm text-gray-600">{path.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Desktop/Tablet Direct Content - Bypass welcome screen */}
          <div className="hidden md:flex min-h-screen bg-transparent flex-col pb-6">
            <SoulPageContent
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              hasMatches={hasMatches}
              soulScore={soulScore}
              todayCheckIn={todayCheckIn}
              checkInData={checkInData}
              setCheckInData={setCheckInData}
              saveCheckIn={saveCheckIn}
              savingCheckIn={savingCheckIn}
              journalPrompts={journalPrompts}
              readinessStages={readinessStages}
            />
          </div>
        </>
      ) : (
        <div className="min-h-screen bg-transparent flex flex-col pb-20 md:pb-6">
          <SoulPageContent
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            hasMatches={hasMatches}
            soulScore={soulScore}
            todayCheckIn={todayCheckIn}
            checkInData={checkInData}
            setCheckInData={setCheckInData}
            saveCheckIn={saveCheckIn}
            savingCheckIn={savingCheckIn}
            journalPrompts={journalPrompts}
            readinessStages={readinessStages}
            onBack={() => setShowWelcome(true)}
          />
        </div>
      )}

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed left-1/2 top-4 z-[100] px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 min-w-[300px] max-w-[90vw] ${notification.type === 'success'
                ? 'bg-purple-500/80 border-purple-400 text-white shadow-purple-500/30'
                : notification.type === 'error'
                  ? 'bg-red-500/80 border-red-400 text-white shadow-red-500/30'
                  : 'bg-white/80 border-white/50 text-gray-800 shadow-gray-500/20'
              }`}
          >
            <span className="text-xl">
              {notification.type === 'success' ? '✨' : notification.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <p className="font-bold text-sm tracking-tight">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </ResponsiveLayout>
  );
}

// Sub-component for Soul Page Content to handle both mobile (after welcome) and desktop
function SoulPageContent({
  activeSection,
  setActiveSection,
  hasMatches,
  soulScore,
  todayCheckIn,
  checkInData,
  setCheckInData,
  saveCheckIn,
  savingCheckIn,
  journalPrompts,
  readinessStages,
  onBack
}: any) {
  return (
    <div className="relative">
      {/* Top Navigation / Tabs */}
      <div className="bg-white/40 backdrop-blur-xl sticky top-0 z-50 px-4 py-3 md:py-2 shadow-sm border-b border-white/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex items-center justify-between md:justify-start gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="md:hidden w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/40 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <h1 className="text-xl md:text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl md:text-xl">✨</span>
              <span className="hidden md:inline">Soul Journey</span>
              <span className="md:hidden">Soul</span>
            </h1>
            <div className="md:hidden w-10" />
          </div>

          {/* Section Tabs - More compact on desktop */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {[
              { id: 'check-in', label: 'Check-In', icon: '💭' },
              { id: 'journal', label: 'Journal', icon: '📝' },
              { id: 'readiness', label: 'Readiness', icon: '🌱' },
              { id: 'rituals', label: 'Rituals', icon: '🕯️', show: hasMatches },
              { id: 'growth', label: 'Growth', icon: '✨' },
              { id: 'library', label: 'Library', icon: '📚' },
            ].filter(s => s.show !== false).map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as Section)}
                className={`flex-shrink-0 px-4 py-1.5 md:px-3 md:py-1 rounded-full text-sm font-medium transition-all ${activeSection === section.id
                  ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-md text-white shadow-md'
                  : 'bg-white/30 backdrop-blur-sm text-gray-700 hover:bg-white/50 border border-white/20 hover:border-white/40'
                  }`}
              >
                <span className="mr-1.5">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-6 md:py-4 overflow-y-auto w-full max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Daily Check-In Section */}
          {activeSection === 'check-in' && (
            <motion.div
              key="check-in"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 md:space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-start">
                {/* Left Column: Calendar & Score (Desktop: 5/12) */}
                <div className="md:col-span-5 space-y-6 md:space-y-4">
                  <div className="bg-white/30 backdrop-blur-xl rounded-3xl md:rounded-2xl shadow-xl md:shadow-md p-6 md:p-4 border border-white/40">
                    <CheckInCalendar />
                  </div>

                  {soulScore !== null && (
                    <div className="bg-gradient-to-br from-purple-500/40 via-blue-500/40 to-pink-500/40 backdrop-blur-xl rounded-3xl md:rounded-2xl shadow-xl md:shadow-md p-6 md:p-4 text-white border border-white/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg md:text-base font-semibold mb-1">Soul Score</h3>
                          <p className="text-sm md:text-xs opacity-90">Alignment index</p>
                        </div>
                        <div className="text-5xl md:text-3xl font-bold">{soulScore}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Check-In Form (Desktop: 7/12) */}
                <div className="md:col-span-7 bg-white/30 backdrop-blur-xl rounded-3xl md:rounded-2xl shadow-xl md:shadow-md p-6 md:p-4 border border-white/40">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl md:text-lg font-bold text-gray-800">Daily Check-In</h2>
                      <p className="text-gray-600 md:text-sm">Quick alignment ritual</p>
                    </div>
                    {todayCheckIn && (
                      <span className="text-xs bg-green-500/20 backdrop-blur-sm text-green-800 px-3 py-1 rounded-full border border-green-500/30 font-medium">
                        ✓ Balanced
                      </span>
                    )}
                  </div>

                  <div className="space-y-6 md:space-y-4">
                    {/* Current Emotion */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-1.5">How are you feeling?</label>
                      <div className="grid grid-cols-5 gap-3 md:gap-2">
                        {(['calm', 'heavy', 'open', 'confused', 'hopeful'] as Emotion[]).map((emotion) => (
                          <button
                            key={emotion}
                            onClick={() => !todayCheckIn && setCheckInData({ ...checkInData, emotion })}
                            disabled={!!todayCheckIn}
                            className={`aspect-square rounded-xl md:rounded-lg text-2xl md:text-xl transition-transform ${todayCheckIn ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                              } ${checkInData.emotion === emotion ? 'ring-2 ring-purple-500 bg-white/40 shadow-lg' : 'bg-white/20 border border-white/30'
                              }`}
                          >
                            {emotion === 'calm' && '😌'}
                            {emotion === 'heavy' && '😔'}
                            {emotion === 'open' && '😊'}
                            {emotion === 'confused' && '😕'}
                            {emotion === 'hopeful' && '✨'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Current Need */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-1.5">What do you need?</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(['connection', 'healing', 'clarity', 'growth', 'rest'] as Need[]).map((need) => (
                          <button
                            key={need}
                            onClick={() => !todayCheckIn && setCheckInData({ ...checkInData, need })}
                            disabled={!!todayCheckIn}
                            className={`p-2.5 md:p-2 rounded-xl md:rounded-lg text-left text-sm md:text-xs transition-all ${todayCheckIn ? 'opacity-50 cursor-not-allowed' : ''
                              } ${checkInData.need === need
                                ? 'bg-purple-500/80 text-white shadow-md backdrop-blur-md'
                                : 'bg-white/20 text-gray-700 hover:bg-white/40 border border-white/20 hover:border-purple-200'
                              }`}
                          >
                            <span className="capitalize">{need}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Energy Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-1.5">Your energy today?</label>
                      <div className="grid grid-cols-3 gap-3 md:gap-2">
                        {(['low', 'balanced', 'high'] as Energy[]).map((energy) => (
                          <button
                            key={energy}
                            onClick={() => !todayCheckIn && setCheckInData({ ...checkInData, energy })}
                            disabled={!!todayCheckIn}
                            className={`p-3 md:p-2 rounded-xl md:rounded-lg font-medium text-sm md:text-xs transition-all ${todayCheckIn ? 'opacity-50 cursor-not-allowed' : ''
                              } ${checkInData.energy === energy
                                ? 'bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white shadow-md backdrop-blur-md'
                                : 'bg-white/20 text-gray-700 hover:bg-white/40 border border-white/20 hover:border-purple-200'
                              }`}
                          >
                            <span className="capitalize">{energy}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {!todayCheckIn && checkInData.emotion && checkInData.need && checkInData.energy && (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={saveCheckIn}
                        disabled={savingCheckIn}
                        className="w-full bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white py-3 rounded-xl md:rounded-lg font-semibold shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 backdrop-blur-md"
                      >
                        {savingCheckIn ? 'Saving...' : 'Align Now ✨'}
                      </motion.button>
                    )}
                    {todayCheckIn && (
                      <div className="w-full bg-green-500/10 backdrop-blur-sm border border-green-500/20 text-green-800 py-3 rounded-xl md:rounded-lg text-sm text-center font-medium">
                        You're aligned for today.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Journal Section */}
          {activeSection === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                <div className="bg-white/30 backdrop-blur-xl rounded-3xl md:rounded-2xl shadow-xl md:shadow-md p-6 md:p-4 border border-white/40">
                  <h2 className="text-2xl md:text-lg font-bold text-gray-800 mb-4 md:mb-2">Reflection Prompts</h2>
                  <div className="space-y-3 md:space-y-2">
                    {journalPrompts.slice(0, 4).map((prompt: string, index: number) => (
                      <button
                        key={index}
                        className="w-full p-4 md:p-3 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-xl md:rounded-lg text-left transition-colors border border-white/30"
                      >
                        <p className="text-gray-700 font-medium text-sm md:text-xs">{prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/30 backdrop-blur-xl rounded-3xl md:rounded-2xl shadow-xl md:shadow-md p-6 md:p-4 border border-white/40 space-y-4">
                  <div>
                    <h2 className="text-2xl md:text-lg font-bold text-gray-800 mb-2">Free Journal</h2>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-3 md:px-3 md:py-2 bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl md:rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm md:text-xs text-gray-800"
                      placeholder="Write freely about your journey..."
                    />
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 bg-purple-500/80 backdrop-blur-md text-white py-2 rounded-xl md:rounded-lg font-medium text-sm md:text-xs shadow-md">Save Entry</button>
                      <button className="px-4 bg-white/20 backdrop-blur-sm text-gray-700 py-2 rounded-xl md:rounded-lg font-medium text-sm md:text-xs border border-white/30">Gratitude</button>
                    </div>
                  </div>
                  <div className="p-4 md:p-3 bg-blue-500/10 backdrop-blur-sm rounded-xl md:rounded-lg border border-blue-500/20">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm md:text-xs">💜 Relationship Lessons</h4>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-blue-500/20 rounded-lg outline-none resize-none text-xs text-gray-800"
                      placeholder="Insights on love..."
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Spiritual Readiness Path */}
          {activeSection === 'readiness' && (
            <motion.div
              key="readiness"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white/30 backdrop-blur-xl rounded-3xl md:rounded-2xl shadow-xl md:shadow-md p-6 md:p-4 border border-white/40 mb-4">
                <h2 className="text-2xl md:text-lg font-bold text-gray-800 mb-1">Spirituality Roadmap</h2>
                <p className="text-gray-600 md:text-sm">Guided path to conscious connection</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {readinessStages.map((stage: any, index: number) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white/30 backdrop-blur-xl rounded-2xl p-4 shadow-md border border-white/40 flex flex-col justify-between ${stage.status === 'locked' ? 'opacity-60 grayscale' : ''
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-gray-800">{stage.title}</h3>
                        {stage.status === 'completed' && <span className="text-xl">✅</span>}
                        {stage.status === 'in-progress' && <span className="text-xl animate-pulse">🌱</span>}
                        {stage.status === 'locked' && <span className="text-lg opacity-50">🔒</span>}
                      </div>
                      <p className="text-xs text-gray-600 mb-4 leading-relaxed">{stage.description}</p>
                    </div>

                    {stage.status !== 'locked' && (
                      <div className="space-y-2">
                        <div className="p-2 bg-purple-500/10 backdrop-blur-sm rounded-lg text-xs text-gray-700 italic border border-purple-500/20">
                          {stage.questions[0]}
                        </div>
                        <button className="w-full bg-purple-500/80 backdrop-blur-md text-white py-2 rounded-lg font-medium text-xs shadow-sm hover:shadow-md transition-all">
                          {stage.status === 'completed' ? 'Review' : 'Continue'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Connection Rituals */}
          {activeSection === 'rituals' && hasMatches && (
            <motion.div
              key="rituals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white/30 backdrop-blur-xl rounded-3xl md:rounded-2xl shadow-xl md:shadow-md p-6 md:p-4 border border-white/40 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl md:text-lg font-bold text-gray-800">Connection Rituals</h2>
                  <p className="text-gray-600 md:text-sm">Deepen your bond through shared spiritual work</p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 md:p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-inner">
                    <h3 className="font-bold text-gray-800 mb-2 md:text-base">Day 1: Setting Intentions Together</h3>
                    <p className="text-sm text-gray-600 mb-4 italic">"What makes you feel safe with someone?"</p>
                    <button className="w-full bg-purple-500/80 backdrop-blur-md text-white py-2.5 rounded-xl md:rounded-lg font-semibold text-sm shadow-md">
                      Start Synchronized Ritual
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { day: 2, prompt: "Commitment", icon: '💜' },
                      { day: 3, prompt: "Love Expression", icon: '🌙' },
                      { day: 4, prompt: "Future Dreams", icon: '✨' },
                    ].map((ritual) => (
                      <div key={ritual.day} className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 opacity-60">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{ritual.icon}</span>
                          <h3 className="font-bold text-gray-800 text-xs">Day {ritual.day}</h3>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{ritual.prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Solo Growth Mode */}
          {activeSection === 'growth' && (
            <motion.div
              key="growth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white/30 backdrop-blur-xl rounded-3xl md:rounded-2xl shadow-xl md:shadow-md p-6 md:p-4 border border-white/40 text-center">
                <h2 className="text-2xl md:text-lg font-bold text-gray-800 mb-1">Solo Growth Sanctuary</h2>
                <p className="text-gray-600 md:text-sm">Become the beacon you want to attract</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: '💜', title: 'Healing', desc: 'Transform old wounds', className: 'bg-purple-500/10 border-purple-500/20' },
                  { icon: '🌿', title: 'Self-Love', desc: 'Daily self-honoring', className: 'bg-pink-500/10 border-pink-500/20' },
                  { icon: '🕊️', title: 'Letting Go', desc: 'Release the heavy', className: 'bg-blue-500/10 border-blue-500/20' },
                  { icon: '🧘', title: 'Peace', desc: 'Dwell in calm', className: 'bg-green-500/10 border-green-500/20' },
                ].map((activity, index) => (
                  <div key={index} className={`p-4 ${activity.className} backdrop-blur-md rounded-2xl border flex flex-col items-center text-center group hover:bg-white/40 transition-all cursor-pointer shadow-sm`}>
                    <span className="text-4xl md:text-3xl mb-3 group-hover:scale-110 transition-transform">{activity.icon}</span>
                    <h3 className="font-bold text-gray-800 mb-1 text-sm">{activity.title}</h3>
                    <p className="text-[11px] text-gray-600 mb-4">{activity.desc}</p>
                    <span className="text-purple-600 font-bold text-[10px] uppercase tracking-widest mt-auto">Explore →</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Soul Library */}
          {activeSection === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white/30 backdrop-blur-xl rounded-3xl md:rounded-2xl shadow-xl md:shadow-md p-6 md:p-4 border border-white/40 overflow-hidden relative">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-lg font-bold text-gray-800 mb-1">Soul Library</h2>
                    <p className="text-gray-600 md:text-sm">Wisdom for the conscious path</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold text-purple-600 border border-purple-500/30">ALL GUIDES</span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold text-gray-400 border border-white/10">LATEST</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '📖', title: 'Intention Dating', desc: 'Connecting with soul depth' },
                  { icon: '💬', title: 'Sacred Communication', desc: 'Speaking from your center' },
                  { icon: '🌱', title: 'Healing Your Heart', desc: 'Opening for true love' },
                  { icon: '🧘', title: 'Guided Reflections', desc: 'Daily internal alignment' },
                ].map((resource, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-white/30 backdrop-blur-xl rounded-2xl border border-white/40 hover:bg-white/50 transition-all cursor-pointer shadow-sm">
                    <span className="text-3xl flex-shrink-0">{resource.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1 text-sm">{resource.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">{resource.desc}</p>
                      <button className="text-purple-600 font-bold text-[10px] uppercase tracking-widest">Open Archive →</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
