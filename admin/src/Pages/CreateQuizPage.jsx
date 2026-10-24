import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { saveQuizToStore, getStoredBooths, fetchBoothsFromFirestore } from "../data/quizStore";

import MarkdownQuestionEditor from "../components/MarkdownQuestionEditor";
import { 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Clock, 
  Trophy, 
  Layers, 
  Zap, 
  ArrowRight,
  Code,
  Copy,
  Store,
  ShieldAlert,
  ListChecks,
  X
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isManager, currentUser } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const paramBoothId = searchParams.get("boothId") || (isManager ? currentUser?.assignedBoothId : "") || "";
  const paramBoothName = searchParams.get("boothName") || (isManager ? currentUser?.assignedBoothName : "") || "";

  // Quiz Meta Details
  const [quizType, setQuizType] = useState((paramBoothId || isManager) ? "BOOTH" : "TRACK"); // 'TRACK' | 'BOOTH'
  const [track, setTrack] = useState(isManager ? (currentUser?.assignedBoothName || "Booth Challenge") : "Beginner Track");
  const [title, setTitle] = useState(paramBoothName ? `${paramBoothName} Challenge` : "DevFest 2026: Beginner Track Challenge");
  const [difficulty, setDifficulty] = useState("Easy");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [status, setStatus] = useState("STOPPED");
  const [prizePool, setPrizePool] = useState("Universal DevFest Grand Prize Pool");
  const [description, setDescription] = useState("");
  const [rulesText, setRulesText] = useState(
    "Single attempt only per registered attendee ticket.\nOnce started, the countdown timer cannot be paused.\n+100 points for each correct answer.\n+150 points bonus on submitting all questions.\nFaster overall session timing breaks ties on the stage leaderboard.\nSwitching tabs during live challenge is strictly monitored."
  );
  const [assignedBoothId, setAssignedBoothId] = useState(paramBoothId);
  const [boothsList, setBoothsList] = useState(() => getStoredBooths());

  useEffect(() => {
    if (isManager && currentUser?.assignedBoothId) {
      setQuizType("BOOTH");
      setAssignedBoothId(currentUser.assignedBoothId);
      setTitle(`${currentUser.assignedBoothName || "Booth"} Challenge`);
      setTrack(currentUser.assignedBoothName || "Booth Challenge");
    }
  }, [isManager, currentUser]);


  useEffect(() => {
    fetchBoothsFromFirestore().then(b => {
      if (b && b.length > 0) setBoothsList(b);
    }).catch(() => {});
  }, []);



  // Questions List
  const [questions, setQuestions] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkMarkdownText, setBulkMarkdownText] = useState("");
  const [successToast, setSuccessToast] = useState(false);

  const tracks = [
    "Beginner Track",
    "Conference Track",
    "Advanced Track"
  ];

  const handleAddQuestion = (newQ) => {
    setQuestions(prev => [...prev, newQ]);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleBulkParse = () => {
    // Quick parser for markdown formatted questions
    // Format:
    // ### Question: What is ...?
    // - [x] Correct Option
    // - [ ] Wrong Option 1
    // - [ ] Wrong Option 2
    // - [ ] Wrong Option 3
    // *Explanation: ...*
    try {
      const blocks = bulkMarkdownText.split(/(?=###\s+)/g).filter(b => b.trim());
      const parsedQuestions = [];

      blocks.forEach((block, idx) => {
        const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
        const qLine = lines.find(l => l.startsWith("###"));
        const qText = qLine ? qLine.replace(/^###\s*/, "") : `Question ${idx + 1}`;
        
        const optionLines = lines.filter(l => l.startsWith("- ["));
        const options = [];
        let correctIdx = 0;

        optionLines.forEach((optLine, i) => {
          const isCorrect = optLine.includes("[x]") || optLine.includes("[X]");
          if (isCorrect) correctIdx = i;
          const cleanText = optLine.replace(/^-\s*\[[ xX]\]\s*/, "");
          options.push(cleanText);
        });

        // Ensure at least 4 options
        while (options.length < 4) {
          options.push(`Option ${String.fromCharCode(65 + options.length)}`);
        }

        const expLine = lines.find(l => l.startsWith("*Explanation:") || l.startsWith("Explanation:"));
        const explanation = expLine ? expLine.replace(/^\*?Explanation:\s*\*?/, "") : "";

        parsedQuestions.push({
          id: "bulk-q-" + Date.now() + "-" + idx,
          questionMarkdown: qText,
          options: options.slice(0, 4),
          correctAnswer: correctIdx,
          explanationMarkdown: explanation
        });
      });

      if (parsedQuestions.length > 0) {
        setQuestions(prev => [...prev, ...parsedQuestions]);
        setShowBulkModal(false);
        setBulkMarkdownText("");
      } else {
        alert("Could not parse questions. Please check the markdown format template.");
      }
    } catch (err) {
      alert("Error parsing markdown questions: " + err.message);
    }
  };

  const handlePublishQuiz = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please provide a Quiz Title.");
      return;
    }
    if (questions.length === 0) {
      alert("Please add at least 1 question using the Markdown Editor below.");
      return;
    }

    const isBooth = quizType === "BOOTH" && Boolean(assignedBoothId);
    const selectedBooth = isBooth ? boothsList.find(b => b.id === assignedBoothId) : null;

    const parsedRules = rulesText
      .split("\n")
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const newQuiz = {
      id: "quiz-" + Date.now(),
      title,
      track: isBooth ? (track || "Booth Challenge") : track,
      quizType: isBooth ? "BOOTH" : "TRACK",
      difficulty,
      durationMinutes: Number(durationMinutes),
      status,
      isLive: status === "LIVE",
      answerKeyReleased: false,
      participantsCount: 0,
      prizePool,
      description: description || `Official DevFest Ranchi 2026 challenge for ${track}.`,
      rules: parsedRules,
      boothId: isBooth ? assignedBoothId : null,
      boothName: selectedBooth ? selectedBooth.name : null,
      isBoothQuiz: isBooth,
      isTrackQuiz: !isBooth,
      createdAt: new Date().toISOString().split("T")[0],
      questions
    };

    try {
      await saveQuizToStore(newQuiz);
      setSuccessToast(true);

      setTimeout(() => {
        navigate(assignedBoothId ? "/booths" : "/quizzes");
      }, 1500);
    } catch (err) {
      alert("Saved locally! (Firestore error: " + err.message + ")");
      navigate("/quizzes");
    }
  };



  const sampleTemplate = `### What is Gemini 2.0 Flash?
- [x] High-speed multimodal AI model with sub-second latency
- [ ] Relational SQL database engine
- [ ] CSS responsive layout framework
- [ ] Android bytecode compiler
*Explanation: Gemini 2.0 Flash delivers high-performance multimodal generation with low latency.*

### What does the React 19 use() hook do?
- [x] Reads promises and context inside render conditionally
- [ ] Replaces JavaScript class inheritance
- [ ] Bundles assets into WebAssembly
- [ ] Deploys code to Google Cloud Run
*Explanation: The use API can read resources like promises or context directly inside render.*`;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#f8fafc] min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-indigo-50 px-2.5 py-1 rounded-full">
            DevFest 2026 Admin
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
            Create Quiz & Markdown Questions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Configure quiz details, write questions with rich Markdown, code blocks, and choices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Code className="w-4 h-4 text-brand-primary" />
            <span>Bulk Markdown Import</span>
          </button>

          <button
            type="button"
            onClick={handlePublishQuiz}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-600 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish Quiz ({questions.length} Qs)</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-bold">
            Quiz successfully created and published to the DevFest store! Redirecting to All Quizzes...
          </div>
        </div>
      )}

      {/* Grid: Left = Quiz Configuration & Questions List, Right = Markdown Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Quiz Metadata Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100/90 rounded-[24px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-4 h-4 text-brand-primary" />
              <span>Quiz Basic Settings</span>
            </h3>

            {/* Quiz Target Selector: Track vs Booth */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Quiz Purpose & Arena
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#f8fafc] p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setQuizType("TRACK");
                    setAssignedBoothId("");
                    if (!title || title.includes("Booth") || title.includes("Challenge")) {
                      setTitle(`DevFest 2026: ${track} Challenge`);
                    }
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    quizType === "TRACK"
                      ? "bg-brand-primary text-white shadow-sm shadow-indigo-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Track Quiz</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuizType("BOOTH");
                    if (boothsList.length > 0 && !assignedBoothId) {
                      setAssignedBoothId(boothsList[0].id);
                      setTitle(`${boothsList[0].name} Challenge`);
                    }
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    quizType === "BOOTH"
                      ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Booth Challenge</span>
                </button>
              </div>
            </div>

            {/* Target 1: Official DevFest 3 Tracks Selector */}
            {quizType === "TRACK" ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select DevFest Official Track *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {/* Beginner Track */}
                  <div
                    onClick={() => {
                      setTrack("Beginner Track");
                      setDifficulty("Easy");
                      setTitle("DevFest 2026: Beginner Track Challenge");
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      track === "Beginner Track"
                        ? "border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-200"
                        : "border-slate-200 bg-[#f8fafc] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Beginner Track</div>
                        <div className="text-[10px] text-slate-500 font-medium">Core concepts & freshers fundamentals</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Easy
                    </span>
                  </div>

                  {/* Conference Track */}
                  <div
                    onClick={() => {
                      setTrack("Conference Track");
                      setDifficulty("Medium");
                      setTitle("DevFest 2026: Conference Track Challenge");
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      track === "Conference Track"
                        ? "border-indigo-500 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-200"
                        : "border-slate-200 bg-[#f8fafc] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs font-black">
                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Conference Track</div>
                        <div className="text-[10px] text-slate-500 font-medium">Keynotes, speaker talks & tech trends</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Medium
                    </span>
                  </div>

                  {/* Advanced Track */}
                  <div
                    onClick={() => {
                      setTrack("Advanced Track");
                      setDifficulty("Hard");
                      setTitle("DevFest 2026: Advanced Track Challenge");
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      track === "Advanced Track"
                        ? "border-rose-500 bg-rose-50/70 shadow-xs ring-2 ring-rose-200"
                        : "border-slate-200 bg-[#f8fafc] hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs font-black">
                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Advanced Track</div>
                        <div className="text-[10px] text-slate-500 font-medium">Deep tech, system design & advanced engineering</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      Hard
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Target 2: Physical Booth Assignment */
              <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-purple-600" />
                    <span>Select DevFest Physical Booth *</span>
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200 shadow-xs">
                    Booth Challenge
                  </span>
                </label>
                <select
                  value={assignedBoothId}
                  onChange={(e) => {
                    setAssignedBoothId(e.target.value);
                    const found = boothsList.find(b => b.id === e.target.value);
                    if (found) {
                      setTitle(`${found.name} Challenge`);
                      setTrack(found.name);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white text-xs font-semibold text-slate-800 border border-purple-200 rounded-xl outline-none focus:border-purple-600 cursor-pointer"
                >
                  <option value="">-- Choose Physical Booth --</option>
                  {boothsList.map((booth) => (
                    <option key={booth.id} value={booth.id}>
                      {booth.name} ({booth.code}) — {booth.zone}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  Attendees will scan and unlock this quiz when visiting this booth in person!
                </p>
              </div>
            )}

            {/* Quiz Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quiz Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DevFest 2026: Beginner Track Challenge"
                className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* Difficulty Override */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-[#f8fafc] text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
              >
                <option value="Easy">Easy (Beginner Friendly)</option>
                <option value="Medium">Medium (Intermediate / Keynotes)</option>
                <option value="Hard">Hard (Advanced / Deep Dive)</option>
              </select>
            </div>

            {/* Specific Timing & Duration Control */}
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Specific Quiz Timing & Countdown</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {durationMinutes} Minutes Total
                </span>
              </div>

              {/* Timing Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-1.5 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
                      Number(durationMinutes) === mins
                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Custom input & Status in grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Custom Minutes (1 - 120m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  >
                    <option value="STOPPED">STOPPED (Start Later)</option>
                    <option value="LIVE">LIVE (Start Immediately)</option>
                  </select>
                </div>
              </div>

              <p className="text-[10px] text-amber-800/80 font-medium leading-tight">
                When attendees open this challenge in the user arena, a countdown timer of exactly <span className="font-bold">{durationMinutes} minutes</span> will run until submission!
              </p>
            </div>

            {/* Challenge Instructions & Rules Configurator */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-brand-primary" />
                  <span>Challenge Instructions & Rules *</span>
                </label>
                <span className="text-[10px] font-semibold text-slate-500">
                  1 line per rule
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                These rules will be displayed to attendees before they enroll/start in the quiz lobby.
              </p>
              <textarea
                rows={5}
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                placeholder="Enter rules, one per line..."
                className="w-full px-3 py-2 bg-white text-xs font-mono text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-2 focus:ring-indigo-100 transition-all leading-relaxed"
              />
              <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Attendees are limited to 1 attempt per registered ticket ID.</span>
              </div>
            </div>

            {/* Universal DevFest Prize Pool Banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 rounded-2xl border border-amber-300 space-y-1">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  Universal DevFest Grand Prize Pool
                </span>
              </div>
              <p className="text-[11px] text-amber-900/80 font-medium leading-tight">
                All track and booth quizzes feed into the universal stage prize pool. Cumulative points and faster overall session timing decide the final winners!
              </p>
            </div>

          </div>

          {/* Current Questions List */}
          <div className="bg-white border border-slate-100/90 rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-primary" />
                <span>Questions in Quiz ({questions.length})</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400">
                {questions.length > 0 ? "Ready to publish" : "No questions yet"}
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-[#f8fafc]">
                <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">
                  No questions added yet
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Use the Markdown builder on the right or the bulk importer to populate questions.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-[#f8fafc] hover:border-slate-300 transition-all text-left space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        Q{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 line-clamp-2 prose prose-sm max-w-none">
                      <ReactMarkdown>{q.questionMarkdown}</ReactMarkdown>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`px-2 py-1 rounded-lg truncate ${
                            optIdx === q.correctAnswer
                              ? "bg-emerald-100 text-emerald-800 font-bold"
                              : "bg-white text-slate-600 border border-slate-200/60"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Markdown Question Editor */}
        <div className="lg:col-span-7">
          <MarkdownQuestionEditor onAddQuestion={handleAddQuestion} />
        </div>

      </div>

      {/* Bulk Markdown Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div 
            className="w-full max-w-2xl bg-white rounded-[24px] p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-primary" />
                <h3 className="text-base font-bold text-slate-800">
                  Bulk Markdown Questions Importer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Paste Markdown questions following the checklist format below. The engine will automatically parse statements, choices, and explanations.
            </p>

            <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
              <span>Markdown Source:</span>
              <button
                type="button"
                onClick={() => setBulkMarkdownText(sampleTemplate)}
                className="flex items-center gap-1 text-brand-primary hover:underline text-[11px]"
              >
                <Copy className="w-3 h-3" />
                Load Sample Template
              </button>
            </div>

            <textarea
              rows={10}
              value={bulkMarkdownText}
              onChange={(e) => setBulkMarkdownText(e.target.value)}
              placeholder="Paste Markdown here..."
              className="w-full p-4 bg-[#f8fafc] text-xs font-mono text-slate-800 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary resize-y"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkParse}
                className="px-5 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-600 cursor-pointer"
              >
                Parse & Import Questions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
