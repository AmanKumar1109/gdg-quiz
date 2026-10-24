import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  Store, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Zap
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleQuickFillSuperAdmin = () => {
    setEmail("admin@admin.com");
    setPassword("123456");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      navigate("/dashboard");
    } else {
      setErrorMsg(res.message || "Failed to log in.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Hero Column: DevFest Info */}
        <div className="lg:col-span-5 text-white space-y-6 hidden lg:block">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>DevFest Ranchi 2026</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
            Quiz Arena & Stage Leaderboard Control
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Manage track challenges, monitor on-ground booth participants, configure managers with fine-grained access, and broadcast real-time quiz results.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Super Admin Portal</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Complete stage control: all quizzes, winners, enrollments & manager permissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Booth Manager Portal</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Assigned booth managers only see their designated challenges and attendee stats.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100 space-y-6">
          
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                Admin Console
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
              Sign In to DevQuiz
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Enter your credentials to access your administrative dashboard.
            </p>
          </div>

          {/* Quick-fill Super Admin badge */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-indigo-900 font-semibold">
              <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0" />
              <div>
                <div className="font-bold text-[11px] text-indigo-950">Super Admin Demo Credentials</div>
                <div className="text-[10px] text-indigo-600 font-mono">admin@admin.com • 123456</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFillSuperAdmin}
              className="px-3 py-1.5 bg-brand-primary hover:bg-indigo-600 active:scale-95 text-white text-[11px] font-bold rounded-xl transition shadow-xs cursor-pointer shrink-0"
            >
              Fill Credentials
            </button>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin / Manager Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@admin.com or manager email"
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-brand-primary hover:bg-indigo-600 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Booth Managers: Your login is created and authorized by the DevFest Super Admin.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
