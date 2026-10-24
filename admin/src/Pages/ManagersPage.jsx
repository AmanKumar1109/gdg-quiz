import React, { useState, useEffect } from "react";
import { 
  fetchManagersFromFirestore, 
  getStoredManagers, 
  createManagerAccount, 
  deleteManagerFromFirestore,
  fetchBoothsFromFirestore,
  getStoredBooths
} from "../data/quizStore";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Store, 
  Trash2, 
  Key, 
  Copy, 
  Check, 
  Sparkles, 
  Lock, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  X,
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react";

export default function ManagersPage() {
  const [managers, setManagers] = useState(getStoredManagers());
  const [booths, setBooths] = useState(getStoredBooths());
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [assignedBoothId, setAssignedBoothId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState(["dashboard", "quizzes"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const availablePermissions = [
    { id: "dashboard", label: "Dashboard", desc: "View analytics and booth stats" },
    { id: "quizzes", label: "All Quizzes", desc: "Manage booth-scoped challenges" },
    { id: "create-quiz", label: "Create Quiz", desc: "Create markdown challenges for booth" },
    { id: "booths", label: "Booths & Zones", desc: "View booth directory" },
    { id: "participants", label: "Participants", desc: "View attendee scores and leaderboard" },
    { id: "settings", label: "Settings", desc: "Profile and preferences" }
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mgrs, bths] = await Promise.all([
        fetchManagersFromFirestore(),
        fetchBoothsFromFirestore()
      ]);
      setManagers(mgrs);
      setBooths(bths);
    } catch (err) {
      console.warn("Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4500);
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    let gen = "";
    for (let i = 0; i < 10; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
  };

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAllPermissions = () => {
    if (selectedPermissions.length === availablePermissions.length) {
      setSelectedPermissions(["dashboard", "quizzes"]);
    } else {
      setSelectedPermissions(availablePermissions.map(p => p.id));
    }
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in Name, Email and Password.");
      return;
    }

    setIsSubmitting(true);
    const selectedBooth = booths.find(b => b.id === assignedBoothId);

    try {
      const newManager = await createManagerAccount({
        name,
        email,
        password,
        assignedBoothId,
        assignedBoothName: selectedBooth ? selectedBooth.name : "All Booths",
        permissions: selectedPermissions
      });

      setManagers(prev => [newManager, ...prev.filter(m => m.id !== newManager.id)]);
      showToast(`Manager ${newManager.name} successfully registered in Firebase Auth and assigned to ${newManager.assignedBoothName}!`);
      setShowAddModal(false);
      setName("");
      setEmail("");
      setPassword("");
      setAssignedBoothId("");
      setSelectedPermissions(["dashboard", "quizzes"]);
    } catch (err) {
      alert("Error adding manager: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteManager = async (mgr) => {
    if (window.confirm(`Are you sure you want to delete manager "${mgr.name}" (${mgr.email})?`)) {
      const updated = await deleteManagerFromFirestore(mgr.id);
      setManagers(updated);
      showToast(`Manager "${mgr.name}" deleted.`);
    }
  };

  const copyCredentials = (mgr) => {
    const text = `DevFest Admin Portal Credentials:\nEmail: ${mgr.email}\nPassword: ${mgr.password || 'Contact Admin'}\nAssigned Booth: ${mgr.assignedBoothName}\nLogin: http://localhost:5174/login`;
    navigator.clipboard.writeText(text);
    setCopiedId(mgr.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#f8fafc] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Super Admin Security
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
            Booth Managers & Access Control (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Create manager accounts with Firebase Auth, assign physical booths, and restrict sidebar tab permissions.
          </p>
        </div>

        <button
          onClick={() => {
            handleGeneratePassword();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-600 active:scale-95 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Manager</span>
        </button>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs font-bold">{successToast}</div>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Active Managers</span>
            <div className="text-2xl font-black text-slate-800">{managers.length}</div>
            <span className="text-[10px] font-semibold text-purple-600">Firebase Auth Integrated</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Available Booths</span>
            <div className="text-2xl font-black text-slate-800">{booths.length}</div>
            <span className="text-[10px] font-semibold text-amber-600">On-ground arena booths</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Access Security</span>
            <div className="text-2xl font-black text-slate-800">Scoped</div>
            <span className="text-[10px] font-semibold text-emerald-600">Managers see only their booth quizzes</span>
          </div>
        </div>
      </div>

      {/* Managers Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-primary" />
              <span>Configured Booth Managers ({managers.length})</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Managers can log in with their email and generated password at /login.
            </p>
          </div>
        </div>

        {managers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">No managers configured yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click "Add New Manager" above to create an account with email, password, assigned physical booth, and granular sidebar permissions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Manager</th>
                  <th className="py-3 px-6">Assigned Booth</th>
                  <th className="py-3 px-6">Permitted Sidebar Tabs</th>
                  <th className="py-3 px-6">Credentials</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {managers.map((mgr) => (
                  <tr key={mgr.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Manager Name & Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-black shrink-0">
                          {mgr.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{mgr.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{mgr.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Booth */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200">
                        <Store className="w-3.5 h-3.5" />
                        <span>{mgr.assignedBoothName || "Unassigned"}</span>
                      </span>
                    </td>

                    {/* Permissions list */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(mgr.permissions || []).map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Credentials & Copy */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded-lg text-slate-600">
                          {mgr.password || "••••••••"}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCredentials(mgr)}
                          title="Copy manager login text"
                          className="p-1 text-slate-400 hover:text-brand-primary transition cursor-pointer"
                        >
                          {copiedId === mgr.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Delete action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteManager(mgr)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Manager"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD MANAGER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-150 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Booth Manager</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Creates Firebase Auth account & configures scoped access.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddManager} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manager Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manager Email Address (for Login) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul.cloud@devfest.org"
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              {/* Password with generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Secure</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password for manager login"
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] font-mono text-xs font-bold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              {/* Assigned Booth */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign to Physical DevFest Booth *
                </label>
                <select
                  required
                  value={assignedBoothId}
                  onChange={(e) => setAssignedBoothId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white"
                >
                  <option value="">-- Select Physical Booth --</option>
                  {booths.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) — {b.zone}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  This manager will ONLY see and control quizzes assigned to this specific booth.
                </p>
              </div>

              {/* Permissions Checklist */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Granted Sidebar Tabs & Permissions
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    {selectedPermissions.length === availablePermissions.length ? "Reset Selection" : "Select All"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#f8fafc] p-3 rounded-2xl border border-slate-200 max-h-40 overflow-y-auto">
                  {availablePermissions.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`p-2 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition select-none ${
                          isChecked
                            ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-bold"
                            : "bg-white border-slate-200 text-slate-600 font-medium"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-brand-primary pointer-events-none"
                        />
                        <span className="truncate">{perm.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-brand-primary hover:bg-indigo-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Manager..." : "Create Manager Account"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
