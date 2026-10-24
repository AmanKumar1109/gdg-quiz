import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  HelpCircle,
  Code2,
  Atom,
  RotateCcw,
  ChevronRight,
  Zap,
} from "lucide-react";
import gsap from "gsap";

// ─── Bot knowledge base ───────────────────────────────────────────────────────
const BOT_RESPONSES = {
  greet: {
    triggers: ["hi", "hello", "hey", "good morning", "good evening", "start", "hii"],
    reply: () =>
      `Hello! I'm **StudyBot** — your personal learning assistant.\n\nI can help you with:\n- Course recommendations and pricing\n- Concept explanations for React, AI/ML, Physics and Math\n- Clearing your doubts step by step\n- Enrollment and access info\n\nWhat would you like to explore?`,
  },
  react: {
    triggers: ["react", "reactjs", "react.js", "hooks", "jsx", "redux", "component", "usestate", "useeffect", "context api"],
    reply: () =>
      `**React.js — Core Concepts**\n\n**useState** — Manages local component state. Triggers re-render when state changes.\n\n**useEffect** — Handles side effects like API calls, subscriptions, and DOM manipulations.\n\n**useContext** — Shares state globally without prop drilling through the component tree.\n\n**Redux Toolkit** — Production-grade global state management. Ideal for large applications.\n\n**React Router** — Client-side navigation between pages without full-page reloads.\n\nOur *Complete React.js Developer Course* covers all of this with 186 videos and 10 real-world projects. Do you have a specific concept you want explained?`,
  },
  ml: {
    triggers: ["machine learning", "ml", "ai", "artificial intelligence", "deep learning", "neural", "python ml", "tensorflow", "pytorch", "nlp", "llm", "gpt", "model", "dataset", "training"],
    reply: () =>
      `**Artificial Intelligence and Machine Learning**\n\n**Supervised Learning** — The model trains on labeled data to predict outputs for new inputs. Used for classification and regression.\n\n**Unsupervised Learning** — Finds hidden patterns in unlabeled data. Used for clustering and dimensionality reduction.\n\n**Neural Networks** — Layers of interconnected nodes that learn features hierarchically from raw data.\n\n**Backpropagation** — Computes gradients and updates weights to minimize prediction error.\n\n**Transformers** — The architecture behind GPT, BERT, and all modern Large Language Models.\n\nOur *AI and ML Zero to Hero* course covers all of this with TensorFlow, PyTorch, and 15 hands-on project builds.`,
  },
  physics: {
    triggers: ["physics", "class 12 physics", "electrostatics", "magnetism", "optics", "modern physics", "jee physics", "neet physics", "capacitor", "current", "circuit", "wave", "lens", "refraction", "photoelectric"],
    reply: () =>
      `**Class 12 Physics — Key Topics**\n\n**Electrostatics** — Coulomb's law, Electric field lines, Potential, Gauss's law, Capacitors and dielectrics.\n\n**Current Electricity** — Ohm's law, Kirchhoff's laws (KVL and KCL), Wheatstone bridge, Potentiometer.\n\n**Magnetism** — Biot-Savart law, Ampere's law, Faraday's law of electromagnetic induction, Lenz's law.\n\n**Optics** — Snell's law, Total internal reflection, Thin lens formula, Interference, Diffraction.\n\n**Modern Physics** — Photoelectric effect, de Broglie wavelength, Bohr's atomic model, Nuclear physics.\n\nOur course has 420 chapter-wise videos and 5000 solved problems covering full JEE and NEET syllabi. Share your specific doubt and I will explain it step by step.`,
  },
  math: {
    triggers: ["math", "maths", "mathematics", "calculus", "integration", "differentiation", "vectors", "matrix", "probability", "class 12 math", "limits", "derivative", "integral"],
    reply: () =>
      `**Class 12 Mathematics — Quick Reference**\n\n**Differentiation** — d/dx(sin x) = cos x, d/dx(eˣ) = eˣ, Chain rule: d/dx[f(g(x))] = f'(g(x)) · g'(x)\n\n**Integration** — Standard forms: integral of sin x = −cos x + C, integral of eˣ = eˣ + C. Integration by parts: integral of u dv = uv − integral of v du.\n\n**Vectors** — Dot product: A · B = |A||B|cos(theta). Cross product magnitude: |A × B| = |A||B|sin(theta).\n\n**Matrices** — Determinant, Inverse, Rank, System of linear equations using Cramer's rule.\n\n**Probability** — Bayes' theorem, Conditional probability, Binomial distribution.\n\nTell me which chapter you are stuck on and I will break it down clearly.`,
  },
  python: {
    triggers: ["python", "flask", "django", "fastapi", "pandas", "numpy", "scripting", "pip", "virtual env", "lambda", "list comprehension"],
    reply: () =>
      `**Python — Key Concepts**\n\n**List Comprehension** — Concise way to build lists: [x**2 for x in range(10) if x % 2 == 0]\n\n**Lambda Functions** — Anonymous single-expression functions: f = lambda x, y: x + y\n\n**Decorators** — Functions that wrap other functions to extend behavior without modifying them.\n\n**Generators** — Memory-efficient lazy iterators using the yield keyword instead of return.\n\n**Popular Libraries** — Data science: Pandas, NumPy. Web: Flask, FastAPI, Django. ML: Scikit-learn, TensorFlow.\n\n**Virtual Environment** — python -m venv venv then activate it to isolate project dependencies.\n\nOur Python Mastery course takes you from basics to building production REST APIs. What specific concept can I explain?`,
  },
  price: {
    triggers: ["price", "cost", "fee", "how much", "pricing", "discount", "offer", "rupees", "inr", "cheap", "affordable", "enroll", "buy"],
    reply: () =>
      `**Course Pricing — All Plans**\n\n**React.js Complete** — Rs. 799 (was Rs. 2,999)\n**AI and ML Zero to Hero** — Rs. 1,299 (was Rs. 4,999)\n**Class 12 Physics** — Rs. 599 (was Rs. 2,499)\n**Python Mastery** — Rs. 699 (was Rs. 2,499)\n**Class 12 Mathematics** — Rs. 499 (was Rs. 1,999)\n**MERN Full Stack Bootcamp** — Rs. 999 (was Rs. 3,999)\n\nAll courses include lifetime access, downloadable resources, and a certificate of completion. Click any course card in the Explore Courses section to enroll directly.`,
  },
  mern: {
    triggers: ["mern", "full stack", "node", "nodejs", "express", "mongodb", "backend", "api", "rest api", "graphql", "jwt", "authentication"],
    reply: () =>
      `**MERN Stack — Architecture Overview**\n\n**MongoDB** — NoSQL document database that stores data in flexible JSON-like format.\n\n**Express.js** — Lightweight Node.js framework for building RESTful APIs and middleware.\n\n**React.js** — Component-based frontend library for building interactive user interfaces.\n\n**Node.js** — JavaScript runtime that executes server-side code outside the browser.\n\n**Typical Request Flow** — Browser sends request to React, which calls the Express API, which queries MongoDB and returns data.\n\n**Authentication** — JWT tokens are issued on login and verified on every protected route. OAuth 2.0 with Passport.js for social login.\n\nOur MERN Bootcamp course builds 6 production-grade applications with full deployment to AWS and Vercel.`,
  },
  doubt: {
    triggers: ["doubt", "confused", "don't understand", "not clear", "explain", "help me", "stuck", "error", "problem", "issue", "concept", "what is", "how does", "how do"],
    reply: () =>
      `I am here to clear your doubt.\n\nTo give you the most accurate explanation, please tell me:\n\n**1. Subject or course** — React, AI/ML, Physics, Math, Python, or MERN\n**2. Specific topic** — For example: useEffect, backpropagation, Faraday's law\n**3. What part is unclear** — What you already understand and where it breaks down\n\nFor example:\n- "Explain the useEffect dependency array in React"\n- "How does gradient descent minimize the loss function?"\n- "Clarify electromagnetic induction with an example"\n\nI will give you a clear, step-by-step explanation.`,
  },
  certificate: {
    triggers: ["certificate", "certification", "badge", "completion", "linkedin"],
    reply: () =>
      `**Certificates and Credentials**\n\nAll our courses offer a Course Completion Certificate that is shareable as a PDF and can be added directly to your LinkedIn profile.\n\n**Eligibility Requirements:**\n- Complete a minimum of 90 percent of all video lessons\n- Submit the final course project\n- Pass the course assessment quiz with at least 70 percent score\n\nCertificates are issued automatically within 24 hours of completion. They are recognized by employers and colleges for internship and placement applications.`,
  },
  default: {
    reply: () =>
      `I did not quite understand that, but I am ready to help.\n\nYou can ask me things like:\n- "What topics are covered in the React course?"\n- "Explain how neural networks learn"\n- "What is the price of the AI and ML course?"\n- "I am stuck on integration in Class 12 Math"\n- "How does JWT authentication work in Node.js?"\n\nJust type your question and I will do my best to answer it clearly.`,
  },
};

const QUICK_PROMPTS = [
  { label: "React Hooks", icon: Code2, query: "Explain React hooks like useEffect and useState" },
  { label: "AI / ML Basics", icon: Sparkles, query: "What topics are covered in the AI and ML course?" },
  { label: "Physics Concepts", icon: Atom, query: "Explain Class 12 Physics key concepts for JEE" },
  { label: "Course Pricing", icon: Zap, query: "What are the course prices and discounts?" },
  { label: "Math Help", icon: BookOpen, query: "Help me with Class 12 calculus and integration" },
  { label: "Clear a Doubt", icon: HelpCircle, query: "I am confused about backpropagation in neural networks" },
];

function getBotReply(input) {
  const lower = input.toLowerCase();
  for (const key of Object.keys(BOT_RESPONSES)) {
    if (key === "default") continue;
    const { triggers, reply } = BOT_RESPONSES[key];
    if (triggers && triggers.some((t) => lower.includes(t))) return reply(input);
  }
  return BOT_RESPONSES.default.reply(input);
}

// Simple markdown parser — bold, inline code, lists, line breaks
function parseMarkdown(text) {
  let html = text;
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Inline code
  html = html.replace(
    /`(.*?)`/g,
    '<code style="background:#f1f5f9;color:#5e5ce6;padding:1px 5px;border-radius:4px;font-family:monospace;font-size:12px;">$1</code>'
  );
  // Bullet list items starting with "- "
  html = html.replace(/^- (.+)$/gm, '<li class="list-item">$1</li>');
  html = html.replace(/(<li class="list-item">.*?<\/li>\n?)+/gs, (match) => `<ul class="chat-list">${match}</ul>`);
  // Line breaks
  html = html.replace(/\n/g, "<br/>");
  return html;
}

function MessageBubble({ msg, isNew }) {
  const ref = useRef(null);
  useEffect(() => {
    if (isNew && ref.current) {
      gsap.fromTo(ref.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" });
    }
  }, [isNew]);

  const isBot = msg.role === "bot";

  return (
    <div ref={ref} className={`flex gap-3 ${isBot ? "items-start" : "items-end flex-row-reverse"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isBot
            ? "bg-gradient-to-br from-[#5e5ce6] to-[#807df6] shadow-md shadow-indigo-200"
            : "bg-slate-100"
        }`}
      >
        {isBot ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-slate-500" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-[13px] leading-[1.65] ${
          isBot
            ? "bg-white border border-slate-100 shadow-sm text-slate-700 rounded-tl-sm"
            : "text-white rounded-br-sm shadow-md shadow-indigo-200"
        }`}
        style={
          !isBot
            ? { background: "linear-gradient(135deg, #5e5ce6 0%, #807df6 100%)" }
            : {}
        }
      >
        {isBot ? (
          <>
            <style>{`
              .chat-list { margin: 6px 0; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
              .chat-list .list-item { display: flex; gap: 8px; }
              .chat-list .list-item::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: #5e5ce6; flex-shrink: 0; margin-top: 7px; }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
          </>
        ) : (
          <p>{msg.text}</p>
        )}
        <p
          className={`text-[10px] mt-2 font-medium ${isBot ? "text-slate-300" : "text-white/50"}`}
        >
          {msg.time}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5e5ce6] to-[#807df6] flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-100 shadow-sm px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-1">Thinking</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brand-primary/50 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const initMsg = {
    id: 1,
    role: "bot",
    text: `Hello! I'm **StudyBot** — your personal learning assistant.\n\nI can help you with:\n- Course recommendations and pricing\n- Concept explanations for React, AI/ML, Physics and Math\n- Clearing your doubts step by step\n- Enrollment and access info\n\nWhat would you like to explore?`,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isNew: false,
  };

  const [messages, setMessages] = useState([initMsg]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg = { id: Date.now(), role: "user", text: trimmed, time: now, isNew: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getBotReply(trimmed);
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isNew: true,
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 900 + Math.random() * 600);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([{ ...initMsg, id: Date.now(), isNew: true }]);
    setInput("");
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white">

      {/* ── Header ────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-6 pt-6 pb-5 relative overflow-hidden"
        style={{ background: "linear-gradient(140deg, #4a48e0 0%, #6f6cf5 55%, #9b98ff 100%)" }}
      >
        {/* Decorative background orbs */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.07)", filter: "blur(2px)" }} />
        <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.05)", filter: "blur(3px)" }} />
        <div className="absolute top-4 right-20 w-16 h-16 rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,0.06)" }} />

        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-3.5">
            {/* Avatar with ring */}
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}>
                <Bot style={{ width: 24, height: 24 }} className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
            </div>
            <div>
              <h1 className="text-[18px] font-black text-white tracking-tight leading-tight">StudyBot</h1>
              <p className="text-[12px] text-white/60 font-medium mt-0.5">Course &amp; Doubt Assistant</p>
            </div>
          </div>
          <button
            onClick={resetChat}
            title="Reset conversation"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-105"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <RotateCcw className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* Capability chips */}
        <div className="relative flex gap-2 flex-wrap">
          {[
            { Icon: Code2, label: "React & MERN" },
            { Icon: Sparkles, label: "AI & ML" },
            { Icon: Atom, label: "Physics & Math" },
            { Icon: BookOpen, label: "Doubts" },
          ].map(({ Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)" }}
            >
              <Icon style={{ width: 12, height: 12 }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Quick Prompts ─────────────────────────────────────── */}
      <div className="shrink-0 px-5 pt-4 pb-4" style={{ borderBottom: "1px solid #f1f3f9", background: "#fafbff" }}>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Quick questions</p>
        <div className="flex gap-2 flex-wrap">
          {QUICK_PROMPTS.map(({ label, icon: Icon, query }) => (
            <button
              key={label}
              onClick={() => sendMessage(query)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold text-slate-600 hover:text-brand-primary transition-all duration-150 cursor-pointer"
              style={{ background: "#fff", border: "1.5px solid #e8eaf6" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#5e5ce6"; e.currentTarget.style.background = "#f0f0fe"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8eaf6"; e.currentTarget.style.background = "#fff"; }}
            >
              <Icon style={{ width: 13, height: 13 }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-scroll px-6 py-6 flex flex-col gap-5 min-h-0"
        style={{
          background: "radial-gradient(circle at 20px 20px, #e8eaf6 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          backgroundColor: "#f9faff",
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} isNew={msg.isNew} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ─────────────────────────────────────────── */}
      <div className="shrink-0 px-5 pb-5 pt-3 bg-white" style={{ borderTop: "1px solid #f1f3f9" }}>
        <div
          className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{ background: "#f5f6ff", border: "1.5px solid #e2e3f8" }}
          onFocus={() => {}}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
            onKeyDown={handleKeyDown}
            onFocus={e => { e.currentTarget.parentElement.style.borderColor = "#5e5ce6"; e.currentTarget.parentElement.style.background = "#fff"; e.currentTarget.parentElement.style.boxShadow = "0 0 0 4px rgba(94,92,230,0.08)"; }}
            onBlur={e => { e.currentTarget.parentElement.style.borderColor = "#e2e3f8"; e.currentTarget.parentElement.style.background = "#f5f6ff"; e.currentTarget.parentElement.style.boxShadow = "none"; }}
            placeholder="Ask a doubt or explore a course..."
            className="flex-1 resize-none text-[13px] text-slate-700 placeholder-slate-400 outline-none bg-transparent leading-relaxed py-0.5 min-h-[26px] font-medium"
            style={{ maxHeight: 100 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{
              background: input.trim() && !isTyping
                ? "linear-gradient(135deg, #5e5ce6, #807df6)"
                : "#e8eaf6",
              boxShadow: input.trim() && !isTyping ? "0 4px 14px rgba(94,92,230,0.35)" : "none",
            }}
          >
            <Send
              style={{ width: 15, height: 15 }}
              className={input.trim() && !isTyping ? "text-white" : "text-slate-400"}
            />
          </button>
        </div>
        <p className="text-center text-[11px] text-slate-300 font-medium mt-2">
          Enter to send &nbsp;&middot;&nbsp; Answers are AI-generated
        </p>
      </div>
    </div>
  );
}
