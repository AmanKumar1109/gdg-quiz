import { db, getSecondaryAuth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  writeBatch,
  serverTimestamp 
} from "firebase/firestore";

const QUIZZES_COLLECTION = "quizzes";
const BOOTHS_COLLECTION = "booths";
const PARTICIPANTS_COLLECTION = "participants";
const MANAGERS_COLLECTION = "managers";

export const DEFAULT_QUIZZES = [];
export const DEFAULT_BOOTHS = [];

// Local cache helper
const getLocalQuizzesCache = () => {
  try {
    const raw = localStorage.getItem("devfest_admin_quizzes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const broadcastSync = (type, data) => {
  try {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const ch = new BroadcastChannel("devfest_quiz_sync");
      ch.postMessage({ type, data });
      ch.close();
    }
  } catch {}
};

const setLocalQuizzesCache = (data) => {
  try {
    localStorage.setItem("devfest_admin_quizzes", JSON.stringify(data));
    broadcastSync("QUIZZES_SYNC", data);
  } catch {}
};

/**
 * Fetch quizzes directly from Firestore with fallback to local cache
 */
export const fetchQuizzesFromFirestore = async () => {
  try {
    const colRef = collection(db, QUIZZES_COLLECTION);
    const snapshot = await getDocs(colRef);

    const fetched = [];
    snapshot.forEach(docSnap => {
      fetched.push({ id: docSnap.id, ...docSnap.data() });
    });

    setLocalQuizzesCache(fetched);
    return fetched;
  } catch (error) {
    console.warn("Firestore fetch error, using local fallback:", error);
    return getLocalQuizzesCache();
  }
};

/**
 * Save / Create quiz in Firestore & update cache
 */
export const saveQuizToFirestore = async (quiz) => {
  const current = getLocalQuizzesCache();
  const index = current.findIndex(q => q.id === quiz.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = quiz;
  } else {
    updated = [quiz, ...current];
  }
  setLocalQuizzesCache(updated);

  try {
    const docRef = doc(db, QUIZZES_COLLECTION, quiz.id);
    await setDoc(docRef, {
      ...quiz,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log("Successfully saved quiz to Firestore:", quiz.id);
  } catch (error) {
    console.error("Firestore save error:", error);
    throw error;
  }

  return updated;
};

/**
 * Delete quiz from Firestore & update cache
 */
export const deleteQuizFromFirestore = async (quizId) => {
  const current = getLocalQuizzesCache();
  const updated = current.filter(q => q.id !== quizId);
  setLocalQuizzesCache(updated);

  try {
    const docRef = doc(db, QUIZZES_COLLECTION, quizId);
    await deleteDoc(docRef);
    console.log("Successfully deleted quiz from Firestore:", quizId);
  } catch (error) {
    console.error("Firestore delete error:", error);
  }

  return updated;
};

/**
 * Toggle quiz status in Firestore & update cache
 */
export const setQuizLiveStatus = async (quizId, shouldStart) => {
  const current = getLocalQuizzesCache();
  const nextStatus = shouldStart ? "LIVE" : "STOPPED";

  const updated = current.map(q => {
    if (q.id === quizId) {
      return { ...q, status: nextStatus, isLive: shouldStart };
    }
    return q;
  });
  setLocalQuizzesCache(updated);

  try {
    const docRef = doc(db, QUIZZES_COLLECTION, quizId);
    await updateDoc(docRef, { 
      status: nextStatus,
      isLive: shouldStart,
      updatedAt: serverTimestamp() 
    });
    console.log(`Successfully set quiz ${quizId} status to ${nextStatus}`);
  } catch (error) {
    console.error("Firestore update status error:", error);
  }

  return updated;
};

export const toggleQuizStatusInFirestore = async (quizId) => {
  const current = getLocalQuizzesCache();
  const target = current.find(q => q.id === quizId);
  const isCurrentlyLive = target?.status === "LIVE";
  return await setQuizLiveStatus(quizId, !isCurrentlyLive);
};

/**
 * Release or un-release official answer key for a quiz
 */
export const toggleQuizAnswerKeyInFirestore = async (quizId) => {
  const current = getLocalQuizzesCache();
  let nextState = false;

  const updated = current.map(q => {
    if (q.id === quizId) {
      nextState = !q.answerKeyReleased;
      return { ...q, answerKeyReleased: nextState };
    }
    return q;
  });
  setLocalQuizzesCache(updated);

  try {
    const docRef = doc(db, QUIZZES_COLLECTION, quizId);
    await updateDoc(docRef, { 
      answerKeyReleased: nextState,
      updatedAt: serverTimestamp() 
    });
    console.log(`Successfully toggled answer key for ${quizId}:`, nextState);
  } catch (error) {
    console.error("Firestore update answer key error:", error);
  }

  return updated;
};

// Backward compatible sync functions
export const getStoredQuizzes = getLocalQuizzesCache;
export const saveQuizToStore = saveQuizToFirestore;
export const deleteQuizFromStore = deleteQuizFromFirestore;
export const toggleQuizStatusInStore = toggleQuizStatusInFirestore;
export const toggleQuizAnswerKey = toggleQuizAnswerKeyInFirestore;

// -------------------------------------------------------------
// BOOTHS MANAGEMENT & FIRESTORE INTEGRATION
// -------------------------------------------------------------
const getLocalBoothsCache = () => {
  try {
    const raw = localStorage.getItem("devfest_admin_booths");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalBoothsCache = (data) => {
  try {
    localStorage.setItem("devfest_admin_booths", JSON.stringify(data));
    broadcastSync("BOOTHS_SYNC", data);
  } catch {}
};

/**
 * Fetch booths directly from Firestore with fallback to local cache
 */
export const fetchBoothsFromFirestore = async () => {
  try {
    const colRef = collection(db, BOOTHS_COLLECTION);
    const snapshot = await getDocs(colRef);

    const fetched = [];
    snapshot.forEach(docSnap => {
      fetched.push({ id: docSnap.id, ...docSnap.data() });
    });

    setLocalBoothsCache(fetched);
    return fetched;
  } catch (error) {
    console.warn("Firestore booths fetch error, using local fallback:", error);
    return getLocalBoothsCache();
  }
};

/**
 * Save / Create booth in Firestore & update cache
 */
export const saveBoothToFirestore = async (booth) => {
  const current = getLocalBoothsCache();
  const index = current.findIndex(b => b.id === booth.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = booth;
  } else {
    updated = [booth, ...current];
  }
  setLocalBoothsCache(updated);

  try {
    const docRef = doc(db, BOOTHS_COLLECTION, booth.id);
    await setDoc(docRef, {
      ...booth,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log("Successfully saved booth to Firestore:", booth.id);
  } catch (error) {
    console.error("Firestore booth save error:", error);
  }

  return updated;
};

/**
 * Delete booth from Firestore & update cache
 */
export const deleteBoothFromFirestore = async (boothId) => {
  const current = getLocalBoothsCache();
  const updated = current.filter(b => b.id !== boothId);
  setLocalBoothsCache(updated);

  try {
    const docRef = doc(db, BOOTHS_COLLECTION, boothId);
    await deleteDoc(docRef);
    console.log("Successfully deleted booth from Firestore:", boothId);
  } catch (error) {
    console.error("Firestore booth delete error:", error);
  }

  return updated;
};

export const getStoredBooths = getLocalBoothsCache;
export const saveBoothToStore = saveBoothToFirestore;
export const deleteBoothFromStore = deleteBoothFromFirestore;

// -------------------------------------------------------------
// PARTICIPANTS MANAGEMENT & FIRESTORE INTEGRATION
// -------------------------------------------------------------
export const getLocalParticipantsCache = () => {
  try {
    const raw = localStorage.getItem("devfest_participants");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setLocalParticipantsCache = (data) => {
  try {
    localStorage.setItem("devfest_participants", JSON.stringify(data));
    broadcastSync("PARTICIPANTS_SYNC", data);
  } catch {}
};

/**
 * Fetch participants directly from Firestore with fallback to local cache
 */
export const fetchParticipantsFromFirestore = async () => {
  try {
    const colRef = collection(db, PARTICIPANTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const fetched = [];
    snapshot.forEach(docSnap => {
      fetched.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort descending by score, tie-breaker with lower total time taken
    fetched.sort((a, b) => {
      const scoreA = Number(a.score ?? a.totalPoints) || 0;
      const scoreB = Number(b.score ?? b.totalPoints) || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      const timeA = Number(a.totalTimeSeconds) || 999999;
      const timeB = Number(b.totalTimeSeconds) || 999999;
      return timeA - timeB;
    });
    setLocalParticipantsCache(fetched);
    return fetched;
  } catch (error) {
    console.warn("Firestore participants fetch error, using local fallback:", error);
    return getLocalParticipantsCache();
  }
};

/**
 * Save single participant to Firestore & update cache
 */
export const saveParticipantToFirestore = async (participant) => {
  const current = getLocalParticipantsCache();
  const index = current.findIndex(p => p.id === participant.id || (p.email && participant.email && p.email.toLowerCase() === participant.email.toLowerCase()));
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...current[index], ...participant };
  } else {
    updated = [participant, ...current];
  }
  setLocalParticipantsCache(updated);

  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, participant.id);
    await setDoc(docRef, {
      ...participant,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log("Successfully saved participant to Firestore:", participant.id);
  } catch (error) {
    console.error("Firestore participant save error:", error);
  }

  return updated;
};

/**
 * Bulk save participants to Firestore & update cache
 */
export const saveBulkParticipantsToFirestore = async (newParticipants) => {
  const current = getLocalParticipantsCache();
  const existingMap = new Map();
  current.forEach(p => {
    if (p.email) existingMap.set(p.email.toLowerCase(), p);
    if (p.id) existingMap.set(p.id, p);
  });

  const merged = [...current];
  const toWrite = [];

  for (const item of newParticipants) {
    const key = item.email ? item.email.toLowerCase() : item.id;
    if (existingMap.has(key)) {
      const idx = merged.findIndex(p => (p.email && p.email.toLowerCase() === key) || p.id === key);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...item };
        toWrite.push(merged[idx]);
      }
    } else {
      merged.unshift(item);
      toWrite.push(item);
      if (item.email) existingMap.set(item.email.toLowerCase(), item);
    }
  }

  setLocalParticipantsCache(merged);

  // Firestore batch writes (max 450 per batch)
  try {
    const batchSize = 450;
    for (let i = 0; i < toWrite.length; i += batchSize) {
      const chunk = toWrite.slice(i, i + batchSize);
      const batch = writeBatch(db);
      for (const p of chunk) {
        const docRef = doc(db, PARTICIPANTS_COLLECTION, p.id);
        batch.set(docRef, {
          ...p,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      await batch.commit();
    }
    console.log(`Successfully batch saved ${toWrite.length} participants to Firestore.`);
  } catch (error) {
    console.error("Firestore bulk participant save error:", error);
  }

  return merged;
};

/**
 * Delete participant from Firestore & update cache
 */
export const deleteParticipantFromFirestore = async (participantId) => {
  const current = getLocalParticipantsCache();
  const updated = current.filter(p => p.id !== participantId);
  setLocalParticipantsCache(updated);

  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, participantId);
    await deleteDoc(docRef);
    console.log("Successfully deleted participant from Firestore:", participantId);
  } catch (error) {
    console.error("Firestore participant delete error:", error);
  }

  return updated;
};

export const getStoredParticipants = getLocalParticipantsCache;
export const saveParticipantToStore = saveParticipantToFirestore;
export const deleteParticipantFromStore = deleteParticipantFromFirestore;

// -------------------------------------------------------------
// MANAGERS MANAGEMENT & ROLE-BASED ACCESS
// -------------------------------------------------------------
export const getLocalManagersCache = () => {
  try {
    const raw = localStorage.getItem("devfest_admin_managers");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setLocalManagersCache = (data) => {
  try {
    localStorage.setItem("devfest_admin_managers", JSON.stringify(data));
    broadcastSync("MANAGERS_SYNC", data);
  } catch {}
};

/**
 * Fetch managers from Firestore with local cache fallback
 */
export const fetchManagersFromFirestore = async () => {
  try {
    const colRef = collection(db, MANAGERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const fetched = [];
    snapshot.forEach(docSnap => {
      fetched.push({ id: docSnap.id, ...docSnap.data() });
    });
    setLocalManagersCache(fetched);
    return fetched;
  } catch (error) {
    console.warn("Firestore managers fetch error, using local fallback:", error);
    return getLocalManagersCache();
  }
};

/**
 * Create a new manager account with Firebase Auth and Firestore record
 */
export const createManagerAccount = async ({
  name,
  email,
  password,
  assignedBoothId,
  assignedBoothName,
  permissions = ["dashboard", "quizzes"]
}) => {
  const cleanEmail = email.trim().toLowerCase();
  const managerId = "mgr-" + Date.now();

  // 1. Try creating Firebase Authentication User via Secondary App
  let authUid = managerId;
  try {
    const secondaryAuth = getSecondaryAuth();
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
    if (userCredential?.user?.uid) {
      authUid = userCredential.user.uid;
    }
    console.log("Firebase Auth user created for manager:", cleanEmail);
  } catch (authError) {
    console.warn("Firebase Auth creation notice (continuing with Firestore doc):", authError.message);
  }

  const newManager = {
    id: authUid,
    name: name.trim(),
    email: cleanEmail,
    password: password, // preserved for manager login fallback & recovery
    role: "manager",
    assignedBoothId: assignedBoothId || "",
    assignedBoothName: assignedBoothName || "Unassigned Booth",
    permissions: permissions.length > 0 ? permissions : ["dashboard", "quizzes"],
    createdAt: new Date().toISOString()
  };

  // 2. Save in Firestore
  try {
    const docRef = doc(db, MANAGERS_COLLECTION, newManager.id);
    await setDoc(docRef, {
      ...newManager,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("Firestore manager save error:", err);
  }

  // 3. Update local cache
  const current = getLocalManagersCache();
  const updated = [newManager, ...current.filter(m => m.id !== newManager.id && m.email !== cleanEmail)];
  setLocalManagersCache(updated);

  return newManager;
};

/**
 * Delete manager from Firestore & update cache
 */
export const deleteManagerFromFirestore = async (managerId) => {
  const current = getLocalManagersCache();
  const updated = current.filter(m => m.id !== managerId);
  setLocalManagersCache(updated);

  try {
    const docRef = doc(db, MANAGERS_COLLECTION, managerId);
    await deleteDoc(docRef);
    console.log("Successfully deleted manager from Firestore:", managerId);
  } catch (error) {
    console.error("Firestore manager delete error:", error);
  }

  return updated;
};

export const getStoredManagers = getLocalManagersCache;


