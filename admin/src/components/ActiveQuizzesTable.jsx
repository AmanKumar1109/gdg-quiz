import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  getStoredQuizzes, 
  fetchQuizzesFromFirestore, 
  deleteQuizFromFirestore, 
  setQuizLiveStatus,
  toggleQuizAnswerKey 
} from "../data/quizStore";
import { 
  Plus, 
  HelpCircle, 
  Clock, 
  Users, 
  Trash2, 
  Sparkles,
  Search, 
  Play, 
  Square, 
  Key, 
  CheckCircle2, 
  Eye, 
  X,
  Cloud,
  Store
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ActiveQuizzesTable({ limit }) {
  const { isManager, currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState(getStoredQuizzes());
  const [filterTrack, setFilterTrack] = useState("all");
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Preview Answer Key Modal State
  const [previewQuiz, setPreviewQuiz] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const refresh = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchQuizzesFromFirestore();
      setQuizzes(data);
    } catch (e) {
      console.warn("Could not sync Firestore, showing cached quizzes");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz challenge from Firestore?")) {
      const updated = await deleteQuizFromFirestore(id);
      setQuizzes(updated);
      showToast("Quiz deleted successfully.");
    }
  };

  const handleStartStop = async (quiz) => {
    const isLive = quiz.status === "LIVE";
    const nextStart = !isLive;
    const updated = await setQuizLiveStatus(quiz.id, nextStart);
    setQuizzes(updated);
    showToast(nextStart ? `"${quiz.title}" is now LIVE! Attendees can join.` : `"${quiz.title}" has been STOPPED.`);
  };

  const handleToggleAnswerKey = async (quiz) => {
    const updated = await toggleQuizAnswerKey(quiz.id);
    setQuizzes(updated);
    const updatedQuiz = updated.find(q => q.id === quiz.id);
    if (updatedQuiz?.answerKeyReleased) {
      showToast(`Official Answer Key RELEASED for "${quiz.title}"!`);
    } else {
      showToast(`Answer Key retracted for "${quiz.title}".`);
    }
  };

  const filtered = quizzes.filter(q => {
    // If logged in as Manager, strictly scope to their assigned booth
    if (isManager && currentUser?.assignedBoothId) {
      const isMyBooth = q.boothId === currentUser.assignedBoothId || 
        (q.boothName && currentUser.assignedBoothName && q.boothName.toLowerCase() === currentUser.assignedBoothName.toLowerCase());
      if (!isMyBooth) return false;
    }

    let matchesTrack = true;
    if (filterTrack === "booth") {
      matchesTrack = Boolean(q.isBoothQuiz || q.boothId);
    } else if (filterTrack !== "all") {
      matchesTrack = q.track && q.track.toLowerCase().includes(filterTrack.toLowerCase());
    }
    const matchesSearch = 
      (q.title && q.title.toLowerCase().includes(search.toLowerCase())) || 
      (q.track && q.track.toLowerCase().includes(search.toLowerCase())) ||
      (q.boothName && q.boothName.toLowerCase().includes(search.toLowerCase()));
    return matchesTrack && matchesSearch;
  });

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div className="bg-white border border-slate-100/90 rounded-[24px] p-6 shadow-sm space-y-4">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 border border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Scoped Manager Notice */}
      {isManager && currentUser?.assignedBoothName && (
        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center gap-2.5 text-xs font-bold text-purple-900">
          <Store className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Managing Challenges for: <strong className="underline">{currentUser.assignedBoothName}</strong> (Super Admin Scoped)</span>
        </div>
      )}

      {/* Table Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>DevFest Challenge Tracks</span>
              <span className="text-[10px] bg-indigo-50 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                {filtered.length} Quizzes
              </span>
            </h3>
            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Cloud className="w-3 h-3 text-emerald-500" />
              <span>{isSyncing ? "Syncing..." : "Firestore Live"}</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Start / Stop quizzes in real time & release official answer keys for attendees
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/create-quiz"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quiz</span>
          </Link>
        </div>
      </div>

      {/* Optional Filters */}
      {!limit && (
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or track..."
              className="w-full pl-9 pr-3 py-2 bg-[#f8fafc] text-xs font-medium text-slate-700 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
            />
          </div>

          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="px-3 py-2 bg-[#f8fafc] text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-brand-primary shrink-0"
          >
            <option value="all">All Tracks & Booths</option>
            <option value="Beginner">Beginner Track</option>
            <option value="Conference">Conference Track</option>
            <option value="Advanced">Advanced Track</option>
            <option value="booth">Booth Challenges</option>
          </select>
        </div>
      )}

      {/* Quizzes List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pl-1">Quiz Title & Track</th>
              <th className="pb-3 px-3">Timing</th>
              <th className="pb-3 px-3">Live Status</th>
              <th className="pb-3 px-3">Live Controls</th>
              <th className="pb-3 px-3">Answer Key</th>
              <th className="pb-3 pr-1 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  No quizzes found. Tap "Create Quiz" to build one!
                </td>
              </tr>
            ) : (
              displayed.map((quiz) => {
                const isLive = quiz.status === "LIVE";
                return (
                  <tr key={quiz.id} className="hover:bg-[#f8fafc]/80 transition-colors group">
                    
                    {/* Title & Track */}
                    <td className="py-3.5 pl-1 max-w-[240px]">
                      <div className="font-bold text-slate-800 truncate leading-snug">
                        {quiz.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                        {quiz.isBoothQuiz || quiz.boothId ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            <Store className="w-3 h-3 text-purple-500" />
                            <span>{quiz.boothName || quiz.track || "Booth Challenge"}</span>
                          </span>
                        ) : quiz.track?.includes("Beginner") ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Beginner Track
                          </span>
                        ) : quiz.track?.includes("Conference") ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Conference Track
                          </span>
                        ) : quiz.track?.includes("Advanced") ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            Advanced Track
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-brand-primary">
                            {quiz.track || "DevFest Track"}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">
                          • {quiz.questions ? quiz.questions.length : 0} Qs
                        </span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{quiz.durationMinutes || 15}m</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {quiz.participantsCount || 0} Joined
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isLive
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-300"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-600 animate-pulse" : "bg-slate-400"}`} />
                        {isLive ? "LIVE" : "STOPPED"}
                      </span>
                    </td>

                    {/* Start / Stop Button */}
                    <td className="py-3.5 px-3">
                      {isLive ? (
                        <button
                          onClick={() => handleStartStop(quiz)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 transition shadow-sm cursor-pointer"
                          title="Stop this quiz so attendees cannot join"
                        >
                          <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                          <span>Stop Quiz</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartStop(quiz)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm cursor-pointer"
                          title="Start this quiz so attendees can join and play"
                        >
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                          <span>Start Quiz</span>
                        </button>
                      )}
                    </td>

                    {/* Release Answer Key Button */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleAnswerKey(quiz)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                            quiz.answerKeyReleased
                              ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                              : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                          }`}
                          title={quiz.answerKeyReleased ? "Click to retract answer key" : "Click to release answer key to attendees"}
                        >
                          <Key className={`w-3.5 h-3.5 ${quiz.answerKeyReleased ? "text-amber-700" : "text-slate-500"}`} />
                          <span>{quiz.answerKeyReleased ? "Key Released" : "Release Ans Key"}</span>
                        </button>

                        {/* Preview Questions & Answers */}
                        {quiz.questions && quiz.questions.length > 0 && (
                          <button
                            onClick={() => setPreviewQuiz(quiz)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Preview Answer Key"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3.5 pr-1 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDelete(quiz.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Answer Key Preview Modal */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setPreviewQuiz(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 z-10 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Official Answer Key
                </span>
                <h3 className="text-lg font-black text-slate-800 mt-1">
                  {previewQuiz.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewQuiz(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 flex-1">
              {(previewQuiz.questions || []).map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">
                    {qIdx + 1}. {q.question || q.questionMarkdown}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(q.options || []).map((opt, optIdx) => {
                      const isCorrect = optIdx === q.correctAnswer;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                            isCorrect 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold" 
                              : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {(q.explanation || q.explanationMarkdown) && (
                    <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] font-medium text-indigo-900 mt-1">
                      <strong>Explanation:</strong> {q.explanation || q.explanationMarkdown}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Status: {previewQuiz.answerKeyReleased ? "Released to Attendees" : "Hidden from Attendees"}
              </span>
              <button
                onClick={() => {
                  handleToggleAnswerKey(previewQuiz);
                  setPreviewQuiz(prev => ({ ...prev, answerKeyReleased: !prev.answerKeyReleased }));
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  previewQuiz.answerKeyReleased
                    ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    : "bg-brand-primary text-white hover:bg-indigo-600"
                }`}
              >
                {previewQuiz.answerKeyReleased ? "Retract Answer Key" : "Release Key Now"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
