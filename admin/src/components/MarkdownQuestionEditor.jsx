import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Bold, 
  Italic, 
  Code, 
  FileCode2, 
  List, 
  Quote, 
  Eye, 
  Edit3, 
  Plus, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  AlertCircle
} from "lucide-react";

export default function MarkdownQuestionEditor({ onAddQuestion }) {
  const [activeTab, setActiveTab] = useState("write"); // 'write' | 'preview'
  const [questionMarkdown, setQuestionMarkdown] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [explanationMarkdown, setExplanationMarkdown] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const insertMarkdownSyntax = (prefix, suffix = "") => {
    const textarea = document.getElementById("question-markdown-input");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = questionMarkdown.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const updated = questionMarkdown.substring(0, start) + replacement + questionMarkdown.substring(end);
    setQuestionMarkdown(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 10);
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx].text = value;
    setOptions(updated);
  };

  const handleSetCorrect = (idx) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === idx,
    }));
    setOptions(updated);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionMarkdown.trim()) {
      setErrorMsg("Please enter the question text in markdown.");
      return;
    }
    const emptyOptions = options.some(opt => !opt.text.trim());
    if (emptyOptions) {
      setErrorMsg("Please fill out all 4 option choices.");
      return;
    }
    const correctIdx = options.findIndex(opt => opt.isCorrect);
    if (correctIdx === -1) {
      setErrorMsg("Please select the correct option.");
      return;
    }

    setErrorMsg("");
    onAddQuestion({
      id: "q-" + Date.now(),
      questionMarkdown,
      options: options.map(o => o.text),
      correctAnswer: correctIdx,
      explanationMarkdown
    });

    // Reset form for next question
    setQuestionMarkdown("");
    setOptions([
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setExplanationMarkdown("");
    setActiveTab("write");
  };

  return (
    <div className="bg-white border border-slate-100/90 rounded-[24px] p-6 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-indigo-50 px-2.5 py-0.5 rounded-full">
            Markdown Engine
          </span>
          <h3 className="text-base font-bold text-slate-800 mt-1">
            Question & Option Builder
          </h3>
        </div>

        {/* Tab switcher: Write vs Preview */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === "write"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write (MD)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-brand-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Markdown Question Field */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>Question Statement (Markdown supported)</span>
            </label>

            {/* Quick Markdown Toolbar */}
            {activeTab === "write" && (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-lg">
                <button
                  type="button"
                  title="Bold"
                  onClick={() => insertMarkdownSyntax("**", "**")}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Italic"
                  onClick={() => insertMarkdownSyntax("*", "*")}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Inline Code"
                  onClick={() => insertMarkdownSyntax("`", "`")}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Code Block"
                  onClick={() => insertMarkdownSyntax("```javascript\n", "\n```")}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Bullet List"
                  onClick={() => insertMarkdownSyntax("\n- ")}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Quote"
                  onClick={() => insertMarkdownSyntax("\n> ")}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded cursor-pointer"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {activeTab === "write" ? (
            <textarea
              id="question-markdown-input"
              rows={5}
              value={questionMarkdown}
              onChange={(e) => setQuestionMarkdown(e.target.value)}
              placeholder="### Type question here... You can use **bold**, `code snippets`, lists, or code blocks like:&#10;&#10;```js&#10;function greet() { return 'DevFest'; }&#10;```"
              className="w-full p-4 bg-[#f8fafc] text-slate-800 text-sm font-mono placeholder-slate-400 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-y"
            />
          ) : (
            <div className="w-full min-h-[140px] p-5 bg-[#f8fafc] border border-slate-200 rounded-2xl prose prose-sm max-w-none text-slate-800 font-sans">
              {questionMarkdown.trim() ? (
                <ReactMarkdown
                  components={{
                    pre: ({ node, ...props }) => (
                      <pre className="bg-[#1e1e2e] text-slate-100 p-3.5 rounded-xl text-xs overflow-x-auto my-2 border border-slate-700" {...props} />
                    ),
                    code: ({ node, inline, ...props }) => (
                      inline ? (
                        <code className="bg-indigo-50 text-brand-primary px-1.5 py-0.5 rounded text-xs font-mono font-bold" {...props} />
                      ) : (
                        <code {...props} />
                      )
                    )
                  }}
                >
                  {questionMarkdown}
                </ReactMarkdown>
              ) : (
                <span className="text-slate-400 italic text-xs">Nothing to preview yet. Write question in markdown above!</span>
              )}
            </div>
          )}
        </div>

        {/* 4 Multiple Choice Options */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Answer Choices (Select radio button for the correct answer)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-150 ${
                  opt.isCorrect 
                    ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200" 
                    : "bg-white border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSetCorrect(idx)}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    opt.isCorrect
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-300 hover:border-emerald-400 text-transparent"
                  }`}
                  title="Mark as correct answer"
                >
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </button>

                <span className="w-5 text-xs font-bold text-slate-400">
                  {String.fromCharCode(65 + idx)}.
                </span>

                <input
                  type="text"
                  required
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  className="flex-1 text-xs font-medium text-slate-700 bg-transparent outline-none placeholder-slate-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Explanation (Markdown) */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Answer Explanation & Insights (Markdown supported)</span>
          </label>
          <input
            type="text"
            value={explanationMarkdown}
            onChange={(e) => setExplanationMarkdown(e.target.value)}
            placeholder="e.g. `Gemini 1.5 Pro` introduced native multimodal context with up to 2M tokens."
            className="w-full px-4 py-2.5 bg-[#f8fafc] text-xs font-mono text-slate-700 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Add Question Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveQuestion}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-600 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question to Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
}
