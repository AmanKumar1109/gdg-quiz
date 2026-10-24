import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Store, 
  Plus, 
  MapPin, 
  Sparkles, 
  Users, 
  HelpCircle, 
  ArrowRight, 
  ExternalLink, 
  Trash2, 
  X, 
  Check, 
  RefreshCw,
  Search,
  Building2,
  Trophy,
  Award,
  Zap,
  Gift
} from "lucide-react";
import { 
  getStoredBooths, 
  saveBoothToFirestore, 
  deleteBoothFromFirestore, 
  fetchBoothsFromFirestore,
  getStoredQuizzes,
  fetchQuizzesFromFirestore
} from "../data/quizStore";

export default function BoothsPage() {
  const navigate = useNavigate();
  const [booths, setBooths] = useState(() => getStoredBooths());
  const [quizzes, setQuizzes] = useState(() => getStoredQuizzes());
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states (Rewards & Description removed as per universal prize pool requirement)
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [zone, setZone] = useState("");
  const [lead, setLead] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#4285F4");

  const colorPresets = ["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#A855F7", "#EC4899"];

  const refreshData = async () => {
    setIsSyncing(true);
    try {
      const [fetchedBooths, fetchedQuizzes] = await Promise.all([
        fetchBoothsFromFirestore(),
        fetchQuizzesFromFirestore()
      ]);
      if (fetchedBooths) setBooths(fetchedBooths);
      if (fetchedQuizzes) setQuizzes(fetchedQuizzes);
    } catch (e) {
      console.warn("Using cached booths");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreateBooth = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBooth = {
      id: "booth-" + Date.now(),
      name: name.trim(),
      code: code.trim().toUpperCase() || `BOOTH-${Math.floor(100 + Math.random() * 900)}`,
      zone: zone.trim() || "Hall A • Booth Area",
      lead: lead.trim() || "DevFest Organizer",
      color: color || "#4285F4",
      status: "ACTIVE",
      reward: "Universal DevFest Prize Pool",
      description: description.trim() || `Interactive challenge booth at DevFest Ranchi 2026.`
    };

    // 1. Instantly close modal and reset form
    setShowAddModal(false);
    setName("");
    setCode("");
    setZone("");
    setLead("");
    setDescription("");

    // 2. Optimistic UI update
    setBooths(prev => [newBooth, ...prev.filter(b => b.id !== newBooth.id)]);

    // 3. Persist to Firestore & cache in background
    try {
      const updated = await saveBoothToFirestore(newBooth);
      if (updated && updated.length) {
        setBooths(updated);
      }
    } catch (err) {
      console.error("Failed saving booth to Firestore:", err);
    }
  };

  const handleDeleteBooth = async (boothId) => {
    if (window.confirm("Are you sure you want to delete this booth? All associated booth quizzes will remain.")) {
      const updated = await deleteBoothFromFirestore(boothId);
      setBooths(updated);
    }
  };

  const getQuizzesForBooth = (boothId) => {
    return quizzes.filter(q => q.boothId === boothId).length;
  };

  const filteredBooths = booths.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    b.zone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              DevFest On-Ground Experience
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {booths.length} Physical Booths Configured
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1 flex items-center gap-2.5">
            <Store className="w-7 h-7 text-purple-600" />
            <span>DevFest Interactive Booths</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage physical sponsor and community booths. All booth challenges count towards the <strong>Universal DevFest Grand Prize Pool</strong>!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshData}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh booths list from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-purple-600" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-200 hover:bg-purple-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add DevFest Booth</span>
          </button>
        </div>
      </div>

      {/* Universal Prize Pool Highlight Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 rounded-2xl border border-amber-300 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 border border-amber-500 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-950" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-950 uppercase tracking-wide">
              Universal DevFest Grand Prize Pool
            </div>
            <div className="text-xs font-semibold text-amber-900/80">
              Individual booths do not have separate prize pools. All track challenges and booth quizzes stack cumulative points & time towards the overall stage awards!
            </div>
          </div>
        </div>
        <span className="text-[11px] font-black uppercase text-amber-950 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
          Universal Scoring Active
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search booths by name, code, or hall zone..."
          className="w-full pl-10 pr-4 py-2.5 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-purple-600 shadow-xs"
        />
      </div>

      {/* Booths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooths.map((booth) => {
          const linkedQuizCount = getQuizzesForBooth(booth.id);

          return (
            <div
              key={booth.id}
              className="bg-white rounded-[24px] border border-slate-100/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Color Accent Bar + Code + Actions */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: booth.color || "#4285F4" }}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                        Booth PIN
                      </span>
                      <span className="text-xs font-black font-mono text-slate-700">
                        {booth.code}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteBooth(booth.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Booth"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Booth Title */}
                <h3 className="text-lg font-black text-slate-800 leading-snug mb-1.5">
                  {booth.name}
                </h3>

                {/* Booth Description */}
                {booth.description && (
                  <p className="text-xs font-medium text-slate-500 leading-relaxed mb-3 line-clamp-2">
                    {booth.description}
                  </p>
                )}

                {/* Location & Lead Info */}
                <div className="space-y-1.5 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{booth.zone || "Main Event Floor"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Lead: {booth.lead || "DevFest Team"}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Linked Quizzes Count */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Booth Quizzes:
                  </span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[11px] font-black border border-purple-200">
                    {linkedQuizCount} Prepared
                  </span>
                </div>

                {/* Direct CTA: Prepare Quiz for this Booth */}
                <button
                  onClick={() => {
                    navigate(`/create-quiz?boothId=${booth.id}&boothName=${encodeURIComponent(booth.name)}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#f8fafc] hover:bg-purple-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-purple-600 transition-all cursor-pointer group/btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 group-hover/btn:text-white" />
                  <span>Prepare Quiz for this Booth</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Booth Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-[24px] p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Register New DevFest Booth
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBooth} className="space-y-4">
              {/* Booth Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Booth Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gemini AI Experience Booth"
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                />
              </div>

              {/* Code & Zone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Booth Code / PIN
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. GEMINI-AI"
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-purple-600 uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Location / Zone
                  </label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="e.g. Hall A • Center"
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Lead & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Booth Lead / Organizer
                  </label>
                  <input
                    type="text"
                    value={lead}
                    onChange={(e) => setLead(e.target.value)}
                    placeholder="e.g. AI Track Core Lead"
                    className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Accent Color
                  </label>
                  <div className="flex gap-2 pt-1">
                    {colorPresets.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          color === c ? "scale-110 border-slate-800" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Booth Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Booth Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the topics, tech stack, and interactive activities at this booth..."
                  className="w-full p-3 bg-[#f8fafc] text-xs font-medium text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-purple-600 resize-none"
                />
              </div>

              {/* Universal Prize Pool Info Note */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] font-medium text-amber-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                <span>All quizzes prepared for this booth link into the <strong>Universal DevFest Prize Pool</strong> and stage scoreboard.</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-200 hover:bg-purple-700 cursor-pointer"
                >
                  Create Booth
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
