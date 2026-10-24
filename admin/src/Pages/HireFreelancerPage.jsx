import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  Star,
  MapPin,
  Clock,
  Briefcase,
  MessageSquare,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Send,
  Zap,
  Shield,
  Award,
} from "lucide-react";
import gsap from "gsap";

const CATEGORIES = ["All", "Web Dev", "AI / ML", "Mobile", "UI/UX", "Data Science", "Content"];

const FREELANCERS = [
  {
    id: 1,
    name: "Arjun Mehta",
    title: "Full Stack React & Node.js Developer",
    avatar: "AM",
    avatarBg: "from-violet-500 to-indigo-600",
    category: "Web Dev",
    location: "Bangalore, IN",
    rating: 4.9,
    reviews: 148,
    rate: 2500,
    currency: "₹",
    unit: "/ hr",
    completedJobs: 87,
    responseTime: "< 1 hr",
    skills: ["React.js", "Node.js", "MongoDB", "TypeScript", "AWS"],
    bio: "Senior full-stack developer with 6+ years building production-grade MERN applications. Delivered 80+ projects across startups and enterprises.",
    verified: true,
    topRated: true,
    available: true,
  },
  {
    id: 2,
    name: "Priya Nair",
    title: "AI / ML Engineer & Data Scientist",
    avatar: "PN",
    avatarBg: "from-pink-500 to-rose-600",
    category: "AI / ML",
    location: "Hyderabad, IN",
    rating: 4.8,
    reviews: 93,
    rate: 3200,
    currency: "₹",
    unit: "/ hr",
    completedJobs: 54,
    responseTime: "< 2 hrs",
    skills: ["Python", "TensorFlow", "PyTorch", "LLM Fine-tuning", "MLOps"],
    bio: "ML engineer specialising in NLP, computer vision, and deploying LLM-powered products. Kaggle Expert with published research.",
    verified: true,
    topRated: true,
    available: true,
  },
  {
    id: 3,
    name: "Rahul Sharma",
    title: "UI/UX Designer & Figma Expert",
    avatar: "RS",
    avatarBg: "from-amber-400 to-orange-500",
    category: "UI/UX",
    location: "Mumbai, IN",
    rating: 4.9,
    reviews: 201,
    rate: 1800,
    currency: "₹",
    unit: "/ hr",
    completedJobs: 132,
    responseTime: "< 30 min",
    skills: ["Figma", "Framer", "Prototyping", "Design Systems", "Webflow"],
    bio: "Award-winning UI/UX designer who has worked with 50+ brands. Specialises in SaaS dashboards, mobile apps, and design system creation.",
    verified: true,
    topRated: false,
    available: true,
  },
  {
    id: 4,
    name: "Sneha Kapoor",
    title: "React Native & Flutter Developer",
    avatar: "SK",
    avatarBg: "from-teal-400 to-emerald-600",
    category: "Mobile",
    location: "Pune, IN",
    rating: 4.7,
    reviews: 67,
    rate: 2200,
    currency: "₹",
    unit: "/ hr",
    completedJobs: 41,
    responseTime: "< 3 hrs",
    skills: ["React Native", "Flutter", "Firebase", "REST APIs", "App Store"],
    bio: "Cross-platform mobile developer with expertise in building high-performance apps published on both Google Play and App Store.",
    verified: true,
    topRated: false,
    available: false,
  },
  {
    id: 5,
    name: "Dev Anand Pillai",
    title: "Data Scientist & Analytics Engineer",
    avatar: "DP",
    avatarBg: "from-sky-400 to-blue-600",
    category: "Data Science",
    location: "Chennai, IN",
    rating: 4.8,
    reviews: 112,
    rate: 2800,
    currency: "₹",
    unit: "/ hr",
    completedJobs: 73,
    responseTime: "< 1 hr",
    skills: ["Python", "SQL", "Tableau", "Power BI", "Spark", "dbt"],
    bio: "Data scientist and analytics engineer with experience in building end-to-end data pipelines, dashboards, and predictive models for e-commerce and fintech.",
    verified: true,
    topRated: true,
    available: true,
  },
  {
    id: 6,
    name: "Ananya Reddy",
    title: "Technical Content Writer & SEO Strategist",
    avatar: "AR",
    avatarBg: "from-fuchsia-500 to-purple-600",
    category: "Content",
    location: "Delhi, IN",
    rating: 4.6,
    reviews: 88,
    rate: 900,
    currency: "₹",
    unit: "/ hr",
    completedJobs: 158,
    responseTime: "< 2 hrs",
    skills: ["Technical Writing", "SEO", "Blog Content", "React Docs", "Copy"],
    bio: "Technical writer and SEO strategist with bylines in major dev publications. Creates documentation, tutorials, and growth-driven blog content for SaaS products.",
    verified: true,
    topRated: false,
    available: true,
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{ width: 11, height: 11 }}
          className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
        />
      ))}
    </div>
  );
}

function HireModal({ freelancer, onClose }) {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
    gsap.fromTo(cardRef.current, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.5)" });
  }, []);

  const close = () => {
    gsap.to(cardRef.current, { opacity: 0, y: 24, scale: 0.96, duration: 0.2, ease: "power2.in" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, ease: "power2.in", onComplete: onClose });
  };

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setTimeout(close, 2000);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.5)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === overlayRef.current && close()}
    >
      <div ref={cardRef} className="bg-white rounded-[28px] w-full max-w-[480px] overflow-hidden shadow-2xl">
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4a48e0 0%, #7b78f7 100%)" }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${freelancer.avatarBg} flex items-center justify-center text-base font-black text-white shadow-lg`}>
                {freelancer.avatar}
              </div>
              <div>
                <h2 className="text-[16px] font-black text-white">{freelancer.name}</h2>
                <p className="text-[11px] text-white/65 font-medium mt-0.5">{freelancer.title}</p>
              </div>
            </div>
            <button onClick={close} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer transition-colors">
              <X style={{ width: 15, height: 15 }} className="text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        {sent ? (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 style={{ width: 32, height: 32 }} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-slate-800">Request Sent!</h3>
              <p className="text-[13px] text-slate-500 mt-1">{freelancer.name} will respond within {freelancer.responseTime}.</p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-4">
            {/* Rate info */}
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold">Hourly Rate</p>
                <p className="text-[20px] font-black text-slate-800 leading-tight">
                  {freelancer.currency}{freelancer.rate.toLocaleString()}
                  <span className="text-[12px] font-semibold text-slate-400 ml-1">{freelancer.unit}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400 font-semibold">Avg. Response</p>
                <p className="text-[13px] font-bold text-emerald-600">{freelancer.responseTime}</p>
              </div>
            </div>

            {/* Budget input */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Your Budget (₹)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-semibold text-slate-700 outline-none focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Describe your project</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${freelancer.name.split(" ")[0]}, I need help with...`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-medium text-slate-700 outline-none focus:border-brand-primary focus:bg-white resize-none transition-colors leading-relaxed"
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-black text-white transition-all duration-200 cursor-pointer disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #5e5ce6, #807df6)", boxShadow: "0 6px 20px rgba(94,92,230,0.35)" }}
            >
              <Send style={{ width: 16, height: 16 }} />
              Send Hire Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FreelancerCard({ f, index }) {
  const cardRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.5, delay: index * 0.07, ease: "power2.out" }
    );
  }, [index]);

  const handleHover = (enter) => {
    gsap.to(cardRef.current, {
      y: enter ? -5 : 0,
      scale: enter ? 1.01 : 1,
      boxShadow: enter
        ? "0 16px 40px -8px rgba(94,92,230,0.14), 0 4px 12px -4px rgba(0,0,0,0.06)"
        : "0 1px 3px 0 rgba(0,0,0,0.04)",
      duration: 0.25, ease: "power2.out",
    });
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        className="bg-white rounded-[22px] border border-slate-100 overflow-hidden shadow-sm flex flex-col"
      >
        {/* Top bar */}
        <div className="px-5 pt-5 pb-4 flex items-start gap-3.5">
          {/* Avatar */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.avatarBg} flex items-center justify-center text-[18px] font-black text-white shrink-0 shadow-md`}>
            {f.avatar}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-[14px] font-black text-slate-800 leading-tight">{f.name}</h3>
              {f.verified && (
                <CheckCircle2 style={{ width: 13, height: 13 }} className="text-brand-primary shrink-0" />
              )}
              {f.topRated && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>
                  Top Rated
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug line-clamp-1">{f.title}</p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <StarRating rating={f.rating} />
              <span className="text-[11px] font-bold text-slate-700">{f.rating}</span>
              <span className="text-[10px] text-slate-400 font-medium">({f.reviews})</span>
            </div>
          </div>

          {/* Rate */}
          <div className="text-right shrink-0">
            <p className="text-[18px] font-black text-slate-800 leading-tight">
              {f.currency}{f.rate.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">{f.unit}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-slate-100" />

        {/* Bio */}
        <div className="px-5 pt-3 pb-3">
          <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">{f.bio}</p>
        </div>

        {/* Skills */}
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {f.skills.map((s) => (
            <span key={s} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
              {s}
            </span>
          ))}
        </div>

        {/* Footer stats */}
        <div className="mx-5 mb-4 mt-1 bg-slate-50 rounded-2xl px-4 py-2.5 flex items-center justify-between border border-slate-100">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Briefcase style={{ width: 12, height: 12 }} className="text-slate-400" />
            {f.completedJobs} jobs done
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Clock style={{ width: 12, height: 12 }} className="text-slate-400" />
            Replies {f.responseTime}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span
              className={`w-2 h-2 rounded-full ${f.available ? "bg-emerald-400" : "bg-slate-300"}`}
              style={f.available ? { boxShadow: "0 0 5px #34d399" } : {}}
            />
            <span className={f.available ? "text-emerald-600" : "text-slate-400"}>
              {f.available ? "Available" : "Busy"}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            disabled={!f.available}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-black text-white transition-all duration-150 cursor-pointer disabled:opacity-40 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #5e5ce6, #807df6)", boxShadow: "0 4px 14px rgba(94,92,230,0.28)" }}
          >
            <Zap style={{ width: 14, height: 14 }} />
            Hire Now
          </button>
          <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary-light transition-all cursor-pointer">
            <MessageSquare style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>

      {showModal && <HireModal freelancer={f} onClose={() => setShowModal(false)} />}
    </>
  );
}

export default function HireFreelancerPage() {
  const headerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
  }, []);

  const filtered = FREELANCERS.filter((f) => {
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    const matchSearch =
      !search.trim() ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-full bg-[#f8fafc] flex flex-col">
      {/* ── Hero Header ─────────────────────────────── */}
      <div
        ref={headerRef}
        className="relative overflow-hidden px-8 pt-8 pb-8 shrink-0"
        style={{ background: "linear-gradient(135deg, #4a48e0 0%, #6f6cf5 55%, #9b98ff 100%)" }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="absolute -bottom-16 left-1/3 w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.04)" }} />

        <div className="relative">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <Briefcase style={{ width: 20, height: 20 }} className="text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-black text-white leading-tight tracking-tight">Hire a Freelancer</h1>
              <p className="text-[12px] text-white/60 font-medium">Connect with top verified professionals</p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex gap-4 mt-4 mb-5">
            {[
              { icon: Shield, label: "Verified Profiles" },
              { icon: CheckCircle2, label: "Secure Payments" },
              { icon: Award, label: "Top Rated Talent" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon style={{ width: 13, height: 13 }} className="text-white/70" />
                <span className="text-[11px] font-semibold text-white/70">{label}</span>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 max-w-xl"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
            <Search style={{ width: 17, height: 17 }} className="text-white/60 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, skill, or expertise..."
              className="flex-1 bg-transparent text-[13px] text-white placeholder-white/50 outline-none font-medium"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/60 hover:text-white cursor-pointer">
                <X style={{ width: 15, height: 15 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────── */}
      <div className="shrink-0 px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-[12px] font-bold transition-all duration-150 cursor-pointer"
              style={
                activeCategory === cat
                  ? { background: "linear-gradient(135deg,#5e5ce6,#807df6)", color: "white", boxShadow: "0 3px 12px rgba(94,92,230,0.3)" }
                  : { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }
              }
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-semibold shrink-0">
          <SlidersHorizontal style={{ width: 14, height: 14 }} />
          {filtered.length} found
        </div>
      </div>

      {/* ── Freelancer Grid ──────────────────────────── */}
      <div className="flex-1 px-8 py-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Search style={{ width: 28, height: 28 }} className="text-slate-300" />
            </div>
            <h3 className="text-[15px] font-black text-slate-400">No freelancers found</h3>
            <p className="text-[13px] text-slate-400 mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((f, i) => (
              <FreelancerCard key={f.id} f={f} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
