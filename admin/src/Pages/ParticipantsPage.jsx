import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  Users, 
  Trophy, 
  Search, 
  Award, 
  Flame, 
  Filter, 
  Download, 
  UserX, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  X, 
  Store, 
  Building2, 
  Ticket, 
  Check, 
  RefreshCw, 
  Cloud,
  Mail,
  User,
  Sparkles,
  Clock
} from "lucide-react";
import { 
  fetchParticipantsFromFirestore, 
  saveParticipantToFirestore, 
  saveBulkParticipantsToFirestore, 
  deleteParticipantFromFirestore,
  getStoredParticipants,
  getStoredBooths,
  fetchBoothsFromFirestore
} from "../data/quizStore";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState(() => getStoredParticipants());
  const [booths, setBooths] = useState(() => getStoredBooths());
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [boothFilter, setBoothFilter] = useState("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("manual"); // 'manual' | 'csv' | 'excel'

  // Manual Form State
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualTicket, setManualTicket] = useState("");
  const [manualOrg, setManualOrg] = useState("");
  const [manualTrack, setManualTrack] = useState("Beginner Track");
  const [manualBoothId, setManualBoothId] = useState("");
  const [manualScore, setManualScore] = useState(0);
  const [manualBadge, setManualBadge] = useState("Participant");

  // File Upload State (CSV & Excel)
  const [parsedRows, setParsedRows] = useState([]);
  const [fileError, setFileError] = useState("");
  const [fileName, setFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Tracks list
  const tracksList = [
    "Beginner Track",
    "Conference Track",
    "Advanced Track",
    "General / Open Track"
  ];

  // Refresh data from Firestore
  const loadData = async () => {
    setIsSyncing(true);
    try {
      const [fetchedParticipants, fetchedBooths] = await Promise.all([
        fetchParticipantsFromFirestore(),
        fetchBoothsFromFirestore()
      ]);
      if (fetchedParticipants) setParticipants(fetchedParticipants);
      if (fetchedBooths) setBooths(fetchedBooths);
    } catch (err) {
      console.warn("Using offline participants cache:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // -----------------------------------------------------------------
  // METHOD 1: ONE-ON-ONE MANUAL PARTICIPANT REGISTRATION
  // -----------------------------------------------------------------
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualEmail.trim()) {
      alert("Name and Email are required.");
      return;
    }

    const selectedBooth = booths.find(b => b.id === manualBoothId);

    const newParticipant = {
      id: "part-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      name: manualName.trim(),
      email: manualEmail.trim().toLowerCase(),
      ticketNumber: manualTicket.trim() || `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
      organization: manualOrg.trim() || "Independent Attendee",
      track: manualTrack,
      boothId: manualBoothId || null,
      boothName: selectedBooth ? selectedBooth.name : null,
      score: Number(manualScore) || 0,
      completed: 0,
      badge: manualBadge || "Participant",
      avatar: "",
      createdAt: new Date().toISOString()
    };

    // Close modal & reset form immediately for snappy UX
    setShowUploadModal(false);
    resetManualForm();

    // Optimistically update
    setParticipants(prev => [newParticipant, ...prev.filter(p => p.email !== newParticipant.email)]);
    showToast(`Added attendee ${newParticipant.name} successfully!`);

    // Persist to Firestore in background
    try {
      const updated = await saveParticipantToFirestore(newParticipant);
      if (updated) setParticipants(updated);
    } catch (err) {
      console.error("Firestore save error:", err);
    }
  };

  const resetManualForm = () => {
    setManualName("");
    setManualEmail("");
    setManualTicket("");
    setManualOrg("");
    setManualTrack("AI & Machine Learning");
    setManualBoothId("");
    setManualScore(0);
    setManualBadge("Participant");
  };

  // -----------------------------------------------------------------
  // HELPER: Normalize uploaded rows from CSV / Excel
  // -----------------------------------------------------------------
  const normalizeRow = (rawRow, index) => {
    // Find keys ignoring case, spaces, and punctuation
    const getVal = (possibleKeys) => {
      for (const [k, v] of Object.entries(rawRow)) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (possibleKeys.some(pk => cleanK.includes(pk.toLowerCase().replace(/[^a-z0-9]/g, "")))) {
          return v !== undefined && v !== null ? String(v).trim() : "";
        }
      }
      return "";
    };

    const name = getVal(["fullname", "name", "studentname", "attendee", "participant"]) || `Attendee ${index + 1}`;
    const email = getVal(["email", "mail", "emailaddress"]) || `attendee${index + 1}@devfest.org`;
    const ticket = getVal(["ticket", "roll", "regno", "id", "uid", "ticketnumber"]) || `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
    const org = getVal(["organization", "org", "college", "university", "company", "institute"]) || "DevFest Community";
    const track = getVal(["track", "domain", "stream", "field"]) || "General / Open Track";
    const boothCode = getVal(["boothcode", "booth", "assignedbooth", "zone"]);
    const scoreVal = getVal(["score", "points", "pts"]);
    const score = scoreVal ? Number(scoreVal) || 0 : 0;

    // Resolve booth if boothCode was provided
    let boothId = null;
    let boothName = null;
    if (boothCode) {
      const matched = booths.find(b => 
        (b.code && b.code.toLowerCase() === boothCode.toLowerCase()) || 
        (b.name && b.name.toLowerCase().includes(boothCode.toLowerCase()))
      );
      if (matched) {
        boothId = matched.id;
        boothName = matched.name;
      }
    }

    return {
      id: "part-" + Date.now() + "-" + index + "-" + Math.floor(Math.random() * 100),
      name,
      email: email.toLowerCase(),
      ticketNumber: ticket,
      organization: org,
      track,
      boothId,
      boothName: boothName || (boothCode ? boothCode : null),
      score,
      completed: 0,
      badge: score >= 500 ? "Top Contender" : "Participant",
      avatar: "",
      createdAt: new Date().toISOString()
    };
  };

  // -----------------------------------------------------------------
  // METHOD 2: CSV FILE BULK IMPORT
  // -----------------------------------------------------------------
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileError("");
    setParsedRows([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text) throw new Error("File is empty.");

        // Simple and robust CSV line parser
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          throw new Error("CSV must have at least a header row and 1 data row.");
        }

        const parseCSVLine = (line) => {
          const result = [];
          let current = "";
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              result.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]);
        const dataRows = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const rawObj = {};
          headers.forEach((h, idx) => {
            rawObj[h] = values[idx] || "";
          });
          dataRows.push(normalizeRow(rawObj, i));
        }

        if (dataRows.length === 0) {
          throw new Error("No valid data rows found in CSV.");
        }

        setParsedRows(dataRows);
      } catch (err) {
        setFileError(err.message || "Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  // -----------------------------------------------------------------
  // METHOD 3: EXCEL (.xlsx / .xls) BULK IMPORT
  // -----------------------------------------------------------------
  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileError("");
    setParsedRows([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Grab first sheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) throw new Error("No sheet found in Excel workbook.");

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (!jsonRows || jsonRows.length === 0) {
          throw new Error("Sheet is empty or has no data rows.");
        }

        const dataRows = jsonRows.map((row, idx) => normalizeRow(row, idx));
        setParsedRows(dataRows);
      } catch (err) {
        setFileError(err.message || "Failed to parse Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // -----------------------------------------------------------------
  // CONFIRM BULK IMPORT (CSV or Excel)
  // -----------------------------------------------------------------
  const handleConfirmBulkImport = async () => {
    if (parsedRows.length === 0) return;

    setIsImporting(true);
    const count = parsedRows.length;

    // Immediately close modal and show instant feedback
    setShowUploadModal(false);
    showToast(`Importing ${count} attendees to Firestore in background...`);

    // Optimistically update list
    setParticipants(prev => {
      const existingEmails = new Set(prev.map(p => p.email.toLowerCase()));
      const filteredNew = parsedRows.filter(p => !existingEmails.has(p.email.toLowerCase()));
      return [...filteredNew, ...prev];
    });

    try {
      const updated = await saveBulkParticipantsToFirestore(parsedRows);
      if (updated) setParticipants(updated);
      showToast(`Successfully saved ${count} participants to Firestore!`);
    } catch (err) {
      console.error("Bulk save error:", err);
      showToast(`Saved locally. (Firestore batch error: ${err.message})`);
    } finally {
      setIsImporting(false);
      setParsedRows([]);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // -----------------------------------------------------------------
  // SAMPLE TEMPLATE DOWNLOADERS (CSV & Excel)
  // -----------------------------------------------------------------
  const downloadSampleCSV = () => {
    const sampleHeaders = "name,email,ticketNumber,organization,track,boothCode,score\n";
    const sampleData = [
      "Aarav Sharma,aarav.dev@example.com,DEVFEST-101,BIT Mesra,AI & Machine Learning,GEMINI-AI,0",
      "Priya Kumari,priya.cloud@example.com,DEVFEST-102,NIT Jamshedpur,Web & Cloud,FIREBASE-01,0",
      "Rohan Verma,rohan.droid@example.com,DEVFEST-103,Ranchi University,Android & Kotlin,,0",
      "Sneha Singh,sneha.sec@example.com,DEVFEST-104,IIT ISM Dhanbad,Cyber & DevOps,CYBER-ZONE,0"
    ].join("\n");

    const blob = new Blob([sampleHeaders + sampleData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "devfest_participants_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleExcel = () => {
    const sampleRows = [
      {
        "Full Name": "Aarav Sharma",
        "Email Address": "aarav.dev@example.com",
        "Ticket Number": "DEVFEST-101",
        "College / Organization": "BIT Mesra",
        "Track": "AI & Machine Learning",
        "Booth Code": "GEMINI-AI",
        "Initial Score": 0
      },
      {
        "Full Name": "Priya Kumari",
        "Email Address": "priya.cloud@example.com",
        "Ticket Number": "DEVFEST-102",
        "College / Organization": "NIT Jamshedpur",
        "Track": "Web & Cloud",
        "Booth Code": "FIREBASE-01",
        "Initial Score": 0
      },
      {
        "Full Name": "Rohan Verma",
        "Email Address": "rohan.droid@example.com",
        "Ticket Number": "DEVFEST-103",
        "College / Organization": "Ranchi University",
        "Track": "Android & Kotlin",
        "Booth Code": "",
        "Initial Score": 0
      },
      {
        "Full Name": "Sneha Singh",
        "Email Address": "sneha.sec@example.com",
        "Ticket Number": "DEVFEST-104",
        "College / Organization": "IIT ISM Dhanbad",
        "Track": "Cyber & DevOps",
        "Booth Code": "CYBER-ZONE",
        "Initial Score": 0
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendees");
    XLSX.writeFile(workbook, "devfest_participants_template.xlsx");
  };

  // Export current list to CSV
  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert("No participants to export.");
      return;
    }
    const headers = "Name,Email,TicketNumber,Organization,Track,Booth,Score,CompletedQuizzes,Badge\n";
    const rows = participants.map(p => 
      `"${p.name || ""}","${p.email || ""}","${p.ticketNumber || ""}","${p.organization || ""}","${p.track || ""}","${p.boothName || ""}","${p.score || 0}","${p.completed || 0}","${p.badge || ""}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `devfest_participants_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete participant
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove attendee "${name}"?`)) {
      setParticipants(prev => prev.filter(p => p.id !== id));
      await deleteParticipantFromFirestore(id);
      showToast(`Removed attendee ${name}.`);
    }
  };

  // Filtering
  const filtered = participants.filter(p => {
    const matchesTrack = trackFilter === "all" || (p.track && p.track.toLowerCase().includes(trackFilter.toLowerCase()));
    const matchesBooth = boothFilter === "all" || p.boothId === boothFilter || (p.boothName && p.boothName.toLowerCase().includes(boothFilter.toLowerCase()));
    const matchesSearch = 
      (p.name && p.name.toLowerCase().includes(search.toLowerCase())) || 
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
      (p.ticketNumber && p.ticketNumber.toLowerCase().includes(search.toLowerCase())) ||
      (p.organization && p.organization.toLowerCase().includes(search.toLowerCase()));

    return matchesTrack && matchesBooth && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#f8fafc] min-h-screen">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xl shadow-emerald-200 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-indigo-50 px-2.5 py-1 rounded-full">
              DevFest Ranchi 2026 • Attendees
            </span>
            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Cloud className="w-3 h-3 text-emerald-500" />
              <span>{isSyncing ? "Syncing..." : "Firestore Live"}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
            Participant & Attendee Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Register and manage DevFest attendees via 1-on-1 manual entry, CSV bulk import, or Excel sheets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh from Firestore"
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-brand-primary" : ""}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl shadow-sm hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-brand-primary" />
            <span className="hidden sm:inline">Export</span> CSV
          </button>

          <button
            onClick={() => {
              setShowUploadModal(true);
              setParsedRows([]);
              setFileError("");
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-600 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload / Register Attendee</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-primary flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">{participants.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Registered</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">
              {new Set(participants.map(p => p.organization).filter(Boolean)).size}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Colleges / Orgs</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">
              {participants.length > 0 ? Math.max(...participants.map(p => Number(p.score) || 0)).toLocaleString() : 0}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Score pts</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-800">
              {participants.filter(p => p.boothId || p.boothName).length}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Booth Challengers</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-100/90 rounded-[24px] p-6 shadow-sm space-y-4">
        
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, ticket, or college..."
              className="w-full pl-9 pr-3 py-2 bg-[#f8fafc] text-xs font-semibold text-slate-700 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="px-3 py-2 bg-[#f8fafc] text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-brand-primary shrink-0"
            >
              <option value="all">All Tracks</option>
              {tracksList.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={boothFilter}
              onChange={(e) => setBoothFilter(e.target.value)}
              className="px-3 py-2 bg-[#f8fafc] text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-brand-primary shrink-0"
            >
              <option value="all">All Booths</option>
              {booths.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendees Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="py-14 px-4 text-center">
              <UserX className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">
                No participants found
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                You can add attendees one-on-one manually, or upload bulk lists using CSV or Excel.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-600 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Participants Now</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Rank</th>
                  <th className="pb-3 px-3">Attendee</th>
                  <th className="pb-3 px-3">Ticket & College</th>
                  <th className="pb-3 px-3">Primary Track</th>
                  <th className="pb-3 px-3">Booth Tag</th>
                  <th className="pb-3 px-3">Score</th>
                  <th className="pb-3 px-3">Badge</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-[#f8fafc]/80 transition-colors">
                    <td className="py-3 pl-2 font-bold">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                        idx === 0 ? "bg-amber-100 text-amber-800" :
                        idx === 1 ? "bg-slate-200 text-slate-800" :
                        idx === 2 ? "bg-orange-100 text-orange-800" :
                        "text-slate-400"
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                          {p.name ? p.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 leading-tight">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-300" />
                            <span>{p.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{p.ticketNumber || "N/A"}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {p.organization || "General Attendee"}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-brand-primary">
                      {p.track || "General Track"}
                    </td>

                    <td className="py-3 px-3">
                      {p.boothName ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Store className="w-3 h-3 text-purple-500" />
                          <span>{p.boothName}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">None</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-black text-rose-500 text-sm">
                        {(Number(p.score) || 0).toLocaleString()} pts
                      </div>
                      <div className="text-[10px] font-mono font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{p.totalTimeSeconds ? `${Math.floor(p.totalTimeSeconds / 60)}m ${p.totalTimeSeconds % 60}s` : "0s"}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-brand-primary">
                        {p.badge || "Participant"}
                      </span>
                    </td>

                    <td className="py-3 pr-2 text-right">
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Participant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3-WAY UPLOAD & REGISTRATION MODAL                            */}
      {/* ------------------------------------------------------------- */}
      {showUploadModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-[24px] p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-primary" />
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Participant Registration & Bulk Upload
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Choose one of 3 upload methods below to sync attendees with Firestore.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Mode Navigation Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-[#f8fafc] p-1.5 rounded-2xl border border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("manual");
                  setParsedRows([]);
                  setFileError("");
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeTab === "manual"
                    ? "bg-white text-brand-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <User className="w-4 h-4" />
                <span>1. One-on-One</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("csv");
                  setParsedRows([]);
                  setFileError("");
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeTab === "csv"
                    ? "bg-white text-brand-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>2. CSV Bulk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("excel");
                  setParsedRows([]);
                  setFileError("");
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer ${
                  activeTab === "excel"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>3. Excel (.xlsx)</span>
              </button>
            </div>

            {/* --------------------------------------------------------- */}
            {/* TAB 1: ONE-ON-ONE MANUAL FORM                             */}
            {/* --------------------------------------------------------- */}
            {activeTab === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Ticket / Roll Number
                    </label>
                    <input
                      type="text"
                      value={manualTicket}
                      onChange={(e) => setManualTicket(e.target.value)}
                      placeholder="e.g. DEVFEST-2026-042"
                      className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      College / Organization
                    </label>
                    <input
                      type="text"
                      value={manualOrg}
                      onChange={(e) => setManualOrg(e.target.value)}
                      placeholder="e.g. BIT Mesra / Tech Corp"
                      className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Primary Track
                    </label>
                    <select
                      value={manualTrack}
                      onChange={(e) => setManualTrack(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
                    >
                      {tracksList.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Assign to Booth (Optional)
                    </label>
                    <select
                      value={manualBoothId}
                      onChange={(e) => setManualBoothId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
                    >
                      <option value="">No specific booth (General)</option>
                      {booths.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Initial Points / Score
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={manualScore}
                      onChange={(e) => setManualScore(e.target.value)}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Badge / Status
                    </label>
                    <select
                      value={manualBadge}
                      onChange={(e) => setManualBadge(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#f8fafc] text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-brand-primary"
                    >
                      <option value="Participant">Participant</option>
                      <option value="Challenger">Challenger</option>
                      <option value="Top Contender">Top Contender</option>
                      <option value="VIP Delegate">VIP Delegate</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-600 cursor-pointer"
                  >
                    Save Attendee to Firestore
                  </button>
                </div>
              </form>
            )}

            {/* --------------------------------------------------------- */}
            {/* TAB 2: CSV BULK IMPORT                                    */}
            {/* --------------------------------------------------------- */}
            {activeTab === "csv" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-brand-primary block">Ready-to-use CSV Template</span>
                    <span className="text-[11px] text-slate-500">Columns: name, email, ticketNumber, organization, track, boothCode, score</span>
                  </div>
                  <button
                    type="button"
                    onClick={downloadSampleCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-brand-primary font-bold rounded-xl shadow-xs hover:bg-indigo-50 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Template</span>
                  </button>
                </div>

                {/* Upload Drag & Drop Zone */}
                <label className="border-2 border-dashed border-slate-200 hover:border-brand-primary rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#f8fafc]">
                  <Upload className="w-8 h-8 text-brand-primary mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    {fileName ? fileName : "Click or drag & drop .csv file here"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Accepts comma-separated .csv with attendee rows
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv,text/csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>

                {fileError && (
                  <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}

                {/* Parsed Rows Preview */}
                {parsedRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        Parsed Attendees: <span className="text-brand-primary">{parsedRows.length} found</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready to import
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#f8fafc] text-slate-500 font-bold sticky top-0">
                          <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Ticket</th>
                            <th className="p-2">Track</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.slice(0, 8).map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 font-semibold text-slate-800">{r.name}</td>
                              <td className="p-2 text-slate-500">{r.email}</td>
                              <td className="p-2 text-slate-500">{r.ticketNumber}</td>
                              <td className="p-2 text-brand-primary font-medium">{r.track}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedRows.length > 8 && (
                      <p className="text-[10px] text-slate-400 text-right">
                        ...and {parsedRows.length - 8} more attendees
                      </p>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setParsedRows([]);
                          setFileName("");
                        }}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Reset File
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmBulkImport}
                        disabled={isImporting}
                        className="px-5 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-600 cursor-pointer flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm & Import {parsedRows.length} Attendees</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------------------------------- */}
            {/* TAB 3: EXCEL (.xlsx / .xls) BULK IMPORT                   */}
            {/* --------------------------------------------------------- */}
            {activeTab === "excel" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-slate-600">
                  <div>
                    <span className="font-bold text-emerald-700 block">Pre-formatted Excel Spreadsheet</span>
                    <span className="text-[11px] text-slate-500">Supports .xlsx and .xls workbooks with flexible column headers</span>
                  </div>
                  <button
                    type="button"
                    onClick={downloadSampleExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 text-emerald-600 font-bold rounded-xl shadow-xs hover:bg-emerald-50 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel Template</span>
                  </button>
                </div>

                {/* Upload Drag & Drop Zone */}
                <label className="border-2 border-dashed border-emerald-200 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-emerald-50/20">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    {fileName ? fileName : "Click or drag & drop .xlsx / .xls Excel file here"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Direct Excel workbook import with automatic header detection
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    onChange={handleExcelUpload}
                    className="hidden"
                  />
                </label>

                {fileError && (
                  <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}

                {/* Parsed Rows Preview */}
                {parsedRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        Parsed from Excel: <span className="text-emerald-600 font-black">{parsedRows.length} attendees</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Excel Read Successfully
                      </span>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-[#f8fafc] text-slate-500 font-bold sticky top-0">
                          <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">College / Org</th>
                            <th className="p-2">Track</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.slice(0, 8).map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 font-semibold text-slate-800">{r.name}</td>
                              <td className="p-2 text-slate-500">{r.email}</td>
                              <td className="p-2 text-slate-500">{r.organization}</td>
                              <td className="p-2 text-brand-primary font-medium">{r.track}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parsedRows.length > 8 && (
                      <p className="text-[10px] text-slate-400 text-right">
                        ...and {parsedRows.length - 8} more attendees
                      </p>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setParsedRows([]);
                          setFileName("");
                        }}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Reset File
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmBulkImport}
                        disabled={isImporting}
                        className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 hover:bg-emerald-700 cursor-pointer flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm & Import {parsedRows.length} Attendees</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
