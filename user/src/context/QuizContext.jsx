import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, increment, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const QuizContext = createContext();

const formatQuizItem = (data, id) => {
  const trk = (data.track || '').toLowerCase();
  
  let cat = 'beginner';
  if (trk.includes('conference')) cat = 'conference';
  else if (trk.includes('advanced')) cat = 'advanced';
  else if (data.isBoothQuiz || data.boothId) cat = 'booth';
  else if (trk.includes('beginner')) cat = 'beginner';

  let color = '#34A853';
  if (cat === 'conference') color = '#4285F4';
  else if (cat === 'advanced') color = '#EA4335';
  else if (cat === 'booth') color = '#A855F7';

  return {
    id: id || data.id,
    title: data.title || 'DevFest Track Challenge',
    track: data.track || 'Beginner Track',
    category: cat,
    difficulty: data.difficulty || 'Medium',
    status: data.status || 'LIVE',
    isLive: data.status === 'LIVE' || data.isLive === true,
    totalQuestions: Array.isArray(data.questions) ? data.questions.length : (Number(data.totalQuestions) || 0),
    durationMinutes: Number(data.durationMinutes) || 15,
    participantsCount: Number(data.participantsCount) || 0,
    prizePool: data.prizePool || '₹15,000 + GDG Trophy',
    description: data.description || 'Official DevFest Ranchi 2026 challenge.',
    boothId: data.boothId || null,
    boothName: data.boothName || null,
    isBoothQuiz: Boolean(data.isBoothQuiz || data.boothId),
    answerKeyReleased: Boolean(data.answerKeyReleased),
    accentColor: color,
    tags: Array.isArray(data.tags) ? data.tags : [data.track || 'DevFest 2026', data.difficulty || 'Challenge'],
    questions: (data.questions || []).map(q => ({
      ...q,
      question: q.question || (q.questionMarkdown ? q.questionMarkdown.replace(/^#+\s*/, '') : 'Challenge Question'),
      explanation: q.explanation || q.explanationMarkdown || ''
    }))
  };
};

export const QuizProvider = ({ children }) => {
  // Start strictly with empty quizzes (zero dummy data)
  const [quizzes, setQuizzes] = useState([]);
  const [booths, setBooths] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState(null);

  const [joinedQuizzes, setJoinedQuizzes] = useState(() => {
    try {
      const saved = localStorage.getItem('gdg_joined_quizzes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Profile / Attendee Session
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('devfest_current_attendee');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      isLoggedIn: false,
      id: '',
      name: '',
      email: '',
      ticketId: '',
      organization: '',
      track: 'General Track',
      avatar: '🚀',
      totalPoints: 0,
      totalTimeSeconds: 0,
      completedQuizzes: {}
    };
  });

  // Save joinedQuizzes & userProfile to localStorage
  useEffect(() => {
    localStorage.setItem('gdg_joined_quizzes', JSON.stringify(joinedQuizzes));
  }, [joinedQuizzes]);

  useEffect(() => {
    localStorage.setItem('devfest_current_attendee', JSON.stringify(userProfile));
  }, [userProfile]);

  // Auth Modal Controls
  const openAuthModal = (config = {}) => {
    setAuthModalConfig(config);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalConfig(null);
  };

  // -------------------------------------------------------------
  // REAL-TIME FIRESTORE SYNC: QUIZZES (UNCONDITIONAL SET)
  // -------------------------------------------------------------
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, "quizzes"), (snapshot) => {
        const fetched = [];
        snapshot.forEach(docSnap => {
          fetched.push(formatQuizItem(docSnap.data(), docSnap.id));
        });
        setQuizzes(fetched);
        setIsLiveConnected(true);
      }, (err) => {
        console.warn('Firestore quizzes listener warning:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase connection error:', e);
    }
  }, []);

  // -------------------------------------------------------------
  // REAL-TIME FIRESTORE SYNC: BOOTHS
  // -------------------------------------------------------------
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, "booths"), (snapshot) => {
        const fetchedBooths = [];
        snapshot.forEach(docSnap => {
          fetchedBooths.push({ id: docSnap.id, ...docSnap.data() });
        });
        setBooths(fetchedBooths);
      }, (err) => {
        console.warn('Firestore booths listener error:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Booths listener failed:', e);
    }
  }, []);

  // Tie-breaker sorting: Higher score ranks first; if scores are equal, lower total time taken ranks first!
  const sortParticipantsTieBreaker = (list) => {
    return [...list].sort((a, b) => {
      const scoreA = Number(a.score ?? a.totalPoints) || 0;
      const scoreB = Number(b.score ?? b.totalPoints) || 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      // Tie-Breaker: Faster completion time wins!
      const timeA = Number(a.totalTimeSeconds) || 999999;
      const timeB = Number(b.totalTimeSeconds) || 999999;
      return timeA - timeB;
    });
  };

  // -------------------------------------------------------------
  // REAL-TIME FIRESTORE SYNC: PARTICIPANTS & LEADERBOARD
  // -------------------------------------------------------------
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, "participants"), (snapshot) => {
        const fetched = [];
        snapshot.forEach(docSnap => {
          fetched.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Sort with Tie-Breaker (Score desc, Time asc)
        const sorted = sortParticipantsTieBreaker(fetched);

        const ranked = sorted.map((p, idx) => ({
          rank: idx + 1,
          id: p.id,
          name: p.name || 'Anonymous Coder',
          email: p.email || '',
          ticketNumber: p.ticketNumber || '',
          avatar: p.avatar || '👤',
          score: Number(p.score) || 0,
          totalTimeSeconds: Number(p.totalTimeSeconds) || 0,
          track: p.track || 'General Track',
          organization: p.organization || 'Attendee',
          badge: p.badge || (idx === 0 ? 'GDG Champion 🥇' : idx === 1 ? 'Runner-up 🥈' : idx === 2 ? 'Top 3 🥉' : 'Contender'),
          isCurrent: Boolean(
            userProfile.isLoggedIn && (
              (p.ticketNumber && userProfile.ticketId && p.ticketNumber.toUpperCase() === userProfile.ticketId.toUpperCase()) ||
              (p.email && userProfile.email && p.email.toLowerCase() === userProfile.email.toLowerCase())
            )
          )
        }));

        setLeaderboard(ranked);

        // Keep local cache devfest_participants updated
        try {
          localStorage.setItem("devfest_participants", JSON.stringify(fetched));
        } catch {}
      }, (err) => {
        console.warn('Firestore participants listener error:', err);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Leaderboard listener failed:', e);
    }
  }, [userProfile.isLoggedIn, userProfile.email, userProfile.ticketId]);

  // -------------------------------------------------------------
  // INSTANT CROSS-TAB & CROSS-PORT BROADCAST SYNC WITH ADMIN
  // -------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel("devfest_quiz_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "QUIZZES_SYNC") {
          const list = (event.data.data || []).map(d => formatQuizItem(d, d.id));
          setQuizzes(list);
        } else if (event.data?.type === "BOOTHS_SYNC") {
          setBooths(event.data.data || []);
        } else if (event.data?.type === "PARTICIPANTS_SYNC") {
          const raw = event.data.data || [];
          const sorted = sortParticipantsTieBreaker(raw);
          const list = sorted.map((p, idx) => ({
            rank: idx + 1,
            id: p.id,
            name: p.name || 'Anonymous Coder',
            email: p.email || '',
            ticketNumber: p.ticketNumber || '',
            avatar: p.avatar || '👤',
            score: Number(p.score) || 0,
            totalTimeSeconds: Number(p.totalTimeSeconds) || 0,
            track: p.track || 'General Track',
            organization: p.organization || 'Attendee',
            badge: p.badge || 'Participant',
            isCurrent: Boolean(
              userProfile.isLoggedIn && (
                (p.ticketNumber && userProfile.ticketId && p.ticketNumber.toUpperCase() === userProfile.ticketId.toUpperCase()) ||
                (p.email && userProfile.email && p.email.toLowerCase() === userProfile.email.toLowerCase())
              )
            )
          }));
          setLeaderboard(list);
        }
      };

      return () => channel.close();
    }
  }, [userProfile.isLoggedIn, userProfile.email, userProfile.ticketId]);

  // -------------------------------------------------------------
  // ATTENDEE AUTHENTICATION (STRICT FIRESTORE REGISTRY VERIFICATION)
  // -------------------------------------------------------------
  const loginAttendee = async (email, ticketId, name = '') => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanTicket = (ticketId || '').trim().toUpperCase();
    const cleanName = (name || '').trim();

    if (!cleanEmail || !cleanTicket || !cleanName) {
      return {
        success: false,
        message: 'Please provide your registered Name, DevFest Email, and Ticket ID.'
      };
    }

    // 1. Fetch fresh participants registry directly from Firestore
    let registry = [];
    try {
      const snapshot = await getDocs(collection(db, "participants"));
      snapshot.forEach(docSnap => {
        registry.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (err) {
      console.warn("Direct Firestore participants fetch notice, falling back to cache:", err);
    }

    // 2. Fallback to cached registry or live leaderboard if offline
    if (registry.length === 0) {
      try {
        const raw = localStorage.getItem("devfest_participants");
        if (raw) registry = JSON.parse(raw);
      } catch {}
      if (registry.length === 0 && leaderboard.length > 0) {
        registry = leaderboard;
      }
    }

    // 3. Confirm matching attendee in Firestore by Email & Ticket ID
    const match = registry.find(p => {
      const pEmail = (p.email || '').trim().toLowerCase();
      const pTicket = (p.ticketNumber || p.ticketId || p.id || '').trim().toUpperCase();
      return pEmail === cleanEmail && pTicket === cleanTicket;
    });

    if (!match) {
      // Diagnostic check: does email exist with different ticket or ticket exist with different email?
      const emailMatch = registry.find(p => (p.email || '').trim().toLowerCase() === cleanEmail);
      const ticketMatch = registry.find(p => (p.ticketNumber || p.ticketId || p.id || '').trim().toUpperCase() === cleanTicket);

      if (emailMatch && !ticketMatch) {
        return {
          success: false,
          message: `Ticket ID "${cleanTicket}" does not match the registered ticket for ${cleanEmail}. Please check your ticket pass.`
        };
      }

      if (!emailMatch && ticketMatch) {
        return {
          success: false,
          message: `Email "${cleanEmail}" does not match the registered email for Ticket ${cleanTicket}. Please enter the email used during ticket registration.`
        };
      }

      return {
        success: false,
        message: `No attendee found in DevFest Firestore registry matching Ticket ID "${cleanTicket}" and Email "${cleanEmail}". Access is denied.`
      };
    }

    // 4. Confirm Name matches registered attendee in Firestore
    const regName = (match.name || '').trim().toLowerCase();
    const inputName = cleanName.toLowerCase();
    const isNameMatch = regName === inputName || regName.includes(inputName) || inputName.includes(regName);
    if (!isNameMatch) {
      return {
        success: false,
        message: `The entered name ("${cleanName}") does not match the registered attendee ("${match.name}") for Ticket ${cleanTicket}. Access denied.`
      };
    }

    // 5. Build verified attendee session strictly from Firestore registry
    const participantId = match.id || `part-${cleanTicket}`;
    const participantName = match.name || cleanName || cleanEmail.split('@')[0];
    const currentScore = Number(match.score ?? match.totalPoints) || 0;
    const currentTime = Number(match.totalTimeSeconds) || 0;
    const track = match.track || 'General Track';
    const organization = match.organization || 'DevFest Attendee';
    const avatar = match.avatar || '🚀';
    const completedQuizzes = match.completedQuizzes || userProfile.completedQuizzes || {};

    const sessionData = {
      isLoggedIn: true,
      id: participantId,
      name: participantName,
      email: match.email ? match.email.toLowerCase() : cleanEmail,
      ticketId: match.ticketNumber || cleanTicket,
      organization,
      track,
      avatar,
      totalPoints: currentScore,
      totalTimeSeconds: currentTime,
      completedQuizzes
    };

    setUserProfile(sessionData);

    try {
      localStorage.setItem("devfest_user_profile", JSON.stringify(sessionData));
    } catch {}

    return {
      success: true,
      profile: sessionData,
      message: `Verified! Welcome, ${participantName}.`
    };
  };

  const logoutAttendee = () => {
    const emptySession = {
      isLoggedIn: false,
      id: '',
      name: '',
      email: '',
      ticketId: '',
      organization: '',
      track: 'General Track',
      avatar: '🚀',
      totalPoints: 0,
      totalTimeSeconds: 0,
      completedQuizzes: {}
    };
    setUserProfile(emptySession);
    localStorage.removeItem('devfest_current_attendee');
  };

  // Join Quiz Action
  const joinQuiz = async (quizId) => {
    if (!joinedQuizzes.includes(quizId)) {
      setJoinedQuizzes(prev => [...prev, quizId]);
    }

    // Increment participantsCount in Firestore dynamically
    try {
      const quizRef = doc(db, "quizzes", quizId);
      await updateDoc(quizRef, {
        participantsCount: increment(1)
      });
    } catch (err) {
      setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, participantsCount: (q.participantsCount || 0) + 1 } : q));
    }
  };

  // -------------------------------------------------------------
  // ACCUMULATE POINTS & TIMING (WITH TIE-BREAKER RULE)
  // -------------------------------------------------------------
  const submitQuizScore = async (quizId, pointsEarned, timeTakenSeconds = 0) => {
    const earned = Number(pointsEarned) || 0;
    const timeSpent = Math.max(1, Number(timeTakenSeconds) || 0);

    const prevPoints = Number(userProfile.totalPoints) || 0;
    const prevTime = Number(userProfile.totalTimeSeconds) || 0;

    const newTotalPoints = prevPoints + earned;
    const newTotalTime = prevTime + timeSpent;

    const completed = {
      ...(userProfile.completedQuizzes || {}),
      [quizId]: {
        points: earned,
        timeTakenSeconds: timeSpent,
        completedAt: new Date().toISOString()
      }
    };

    const updatedProfile = {
      ...userProfile,
      totalPoints: newTotalPoints,
      totalTimeSeconds: newTotalTime,
      completedQuizzes: completed
    };

    setUserProfile(updatedProfile);

    // Document ID for participant
    const participantDocId = userProfile.id || `part-${userProfile.ticketId || (userProfile.email ? userProfile.email.replace(/[^a-zA-Z0-9]/g, "_") : Date.now())}`;

    // Update Firestore participants collection with both score and cumulative time
    try {
      const partRef = doc(db, "participants", participantDocId);
      await setDoc(partRef, {
        id: participantDocId,
        name: userProfile.name || 'DevFest Attendee',
        email: userProfile.email || '',
        ticketNumber: userProfile.ticketId || '',
        score: newTotalPoints,
        totalPoints: newTotalPoints,
        totalTimeSeconds: newTotalTime,
        track: userProfile.track || 'General Track',
        avatar: userProfile.avatar || '🚀',
        quizzesCompletedCount: Object.keys(completed).length,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Score submission error in Firestore:', e);
    }

    // Update Leaderboard state immediately using Tie-Breaker rule
    setLeaderboard(prev => {
      const existingIdx = prev.findIndex(p => p.id === participantDocId || (p.ticketNumber && userProfile.ticketId && p.ticketNumber.toUpperCase() === userProfile.ticketId.toUpperCase()));
      let nextList = [...prev];
      if (existingIdx >= 0) {
        nextList[existingIdx] = {
          ...nextList[existingIdx],
          score: newTotalPoints,
          totalTimeSeconds: newTotalTime,
          isCurrent: true
        };
      } else {
        nextList.push({
          id: participantDocId,
          name: userProfile.name || 'DevFest Attendee',
          email: userProfile.email,
          ticketNumber: userProfile.ticketId,
          avatar: userProfile.avatar || '🚀',
          score: newTotalPoints,
          totalTimeSeconds: newTotalTime,
          track: userProfile.track || 'General Track',
          badge: 'Contender',
          isCurrent: true
        });
      }
      const sorted = sortParticipantsTieBreaker(nextList);
      return sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));
    });

    // Broadcast updated score & time to Admin & other tabs
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel("devfest_quiz_sync");
        bc.postMessage({
          type: "PARTICIPANTS_SYNC",
          data: leaderboard
        });
        bc.close();
      } catch {}
    }

    return { earned, newTotal: newTotalPoints, newTotalTime, timeSpent };
  };

  const isQuizJoined = (quizId) => joinedQuizzes.includes(quizId);

  // Dynamic Filtering Logic
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesCategory = 
      selectedCategory === 'all' || 
      quiz.category === selectedCategory || 
      (quiz.track && quiz.track.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (selectedCategory === 'booth' && (quiz.isBoothQuiz || quiz.boothId));

    const matchesDifficulty = 
      selectedDifficulty === 'all' || 
      (quiz.difficulty && quiz.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());

    const matchesSearch = 
      (quiz.title && quiz.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (quiz.track && quiz.track.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (Array.isArray(quiz.tags) && quiz.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        booths,
        leaderboard,
        isLiveConnected,
        filteredQuizzes,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedDifficulty,
        setSelectedDifficulty,
        joinedQuizzes,
        joinQuiz,
        submitQuizScore,
        isQuizJoined,
        userProfile,
        setUserProfile,
        isAuthModalOpen,
        authModalConfig,
        openAuthModal,
        closeAuthModal,
        loginAttendee,
        logoutAttendee
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
