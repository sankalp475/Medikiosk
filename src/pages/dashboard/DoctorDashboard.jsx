import { useState, useEffect } from "react";
import {
  HeartPulse,
  LogOut,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Activity,
  Search,
  RefreshCw,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  Pill,
  Save,
  Phone,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { clearUserSession, getStoredUser } from "../../auth/auth";
import { getStoredVisits, saveVisitConsultation } from "../../storage/db";

export default function DoctorDashboard() {
  const user = getStoredUser();
  const doctorName = user?.name || "Dr. Ananya Rao";
  const doctorDepartment = user?.department || "General Medicine";

  const [visits, setVisits] = useState([]);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saveToast, setSaveToast] = useState("");

  // Active visit form state
  const [doctorNotes, setDoctorNotes] = useState("");
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");
  const [prescriptionList, setPrescriptionList] = useState([]);
  const [pathyaAdvice, setPathyaAdvice] = useState("");
  const [activeTab, setActiveTab] = useState("summary"); // summary | evidence | prescription

  // Load visits on mount
  useEffect(() => {
    loadVisits();
  }, []);

  function loadVisits() {
    setIsRefreshing(true);
    const stored = getStoredVisits();
    setVisits(stored);
    if (!selectedVisitId && stored.length > 0) {
      // Default to the first priority or waiting patient
      const firstUrgent = stored.find((v) => v.isRedFlag && v.status !== "Completed");
      const firstWaiting = stored.find((v) => v.status === "Waiting");
      const defaultToSelect = firstUrgent || firstWaiting || stored[0];
      selectVisit(defaultToSelect);
    } else if (selectedVisitId) {
      const current = stored.find((v) => v.id === selectedVisitId);
      if (current) {
        populateVisitForm(current);
      }
    }
    setTimeout(() => setIsRefreshing(false), 300);
  }

  function selectVisit(visit) {
    if (!visit) return;
    setSelectedVisitId(visit.id);
    populateVisitForm(visit);
  }

  function populateVisitForm(visit) {
    setDoctorNotes(visit.doctorNotes || "");
    setProvisionalDiagnosis(visit.provisionalDiagnosis || "");
    setPrescriptionList(
      Array.isArray(visit.prescription) && visit.prescription.length > 0
        ? visit.prescription
        : [
            {
              drug: "Tab. Paracetamol 650mg",
              dosage: "1 tab",
              frequency: "SOS / As needed",
              duration: "3 days",
              instructions: "After meals with water",
            },
          ]
    );
    setPathyaAdvice(visit.pathyaAdvice || "");
  }

  function signOut() {
    clearUserSession();
    window.location.assign("/dashboard/doctor/login");
  }

  const selectedVisit = visits.find((v) => v.id === selectedVisitId);

  // Filtered queue
  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      v.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.patientUuid && v.patientUuid.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.abhaId && v.abhaId.includes(searchQuery));

    return matchesSearch;
  });

  // Sort queue: Red flags at top, then waiting, then in consultation, then completed
  const sortedVisits = [...filteredVisits].sort((a, b) => {
    if (a.isRedFlag && a.status !== "Completed" && (!b.isRedFlag || b.status === "Completed")) return -1;
    if (b.isRedFlag && b.status !== "Completed" && (!a.isRedFlag || a.status === "Completed")) return 1;
    if (a.status === "In Consultation" && b.status !== "In Consultation") return -1;
    if (b.status === "In Consultation" && a.status !== "In Consultation") return 1;
    if (a.status === "Waiting" && b.status === "Completed") return -1;
    if (b.status === "Waiting" && a.status === "Completed") return 1;
    return 0;
  });

  function handleStartConsultation() {
    if (!selectedVisit) return;
    const updated = saveVisitConsultation(selectedVisit.id, { status: "In Consultation" });
    setVisits(updated);
    showToast("Patient status moved to In Consultation");
  }

  function handleAddMedicine() {
    setPrescriptionList([
      ...prescriptionList,
      {
        drug: "",
        dosage: "1 tab",
        frequency: "Twice daily",
        duration: "5 days",
        instructions: "After meals",
      },
    ]);
  }

  function handleUpdateMedicine(index, field, value) {
    const updated = [...prescriptionList];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionList(updated);
  }

  function handleRemoveMedicine(index) {
    const updated = prescriptionList.filter((_, i) => i !== index);
    setPrescriptionList(updated);
  }

  function handleSaveConsultation(markCompleted = false) {
    if (!selectedVisit) return;
    const newStatus = markCompleted ? "Completed" : selectedVisit.status === "Waiting" ? "In Consultation" : selectedVisit.status;
    const updated = saveVisitConsultation(selectedVisit.id, {
      doctorNotes,
      provisionalDiagnosis,
      prescription: prescriptionList.filter((m) => m.drug.trim() !== ""),
      pathyaAdvice,
      status: newStatus,
    });
    setVisits(updated);
    showToast(markCompleted ? "Consultation finalized & marked completed!" : "Case sheet draft saved successfully");
  }

  function showToast(msg) {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(""), 3500);
  }

  function buildPrintablePassHtml(visit) {
    const rxItems = prescriptionList.length > 0 ? prescriptionList : visit.prescriptions || [];
    const diag = provisionalDiagnosis || visit.provisionalDiagnosis || "";
    const notes = doctorNotes || visit.doctorNotes || "";
    const pathya = pathyaAdvice || visit.pathyaAdvice || "";
    const dateStr = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>OPD_Pass_${visit.token}_${visit.patientName.replace(/[^a-zA-Z0-9]/g, '_')}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    body {
      background: #ffffff;
      color: #0f172a;
      font-size: 11.5px;
      line-height: 1.4;
      padding: 16px;
    }
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #cbd5e1;
    }
    .action-btn {
      background: #047857;
      color: white;
      border: none;
      padding: 7px 16px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
    }
    .action-btn:hover {
      background: #065f46;
    }
    .close-btn {
      background: white;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 7px 14px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
    }
    @media print {
      .action-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
    .pass-card {
      border: 2px solid #047857;
      border-radius: 10px;
      overflow: hidden;
    }
    .hospital-header {
      background: #047857;
      color: white;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hospital-name {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .hospital-sub {
      font-size: 10.5px;
      opacity: 0.9;
      margin-top: 2px;
    }
    .token-box {
      background: white;
      color: #047857;
      border: 2px solid #065f46;
      border-radius: 8px;
      padding: 5px 12px;
      text-align: center;
      min-width: 80px;
    }
    .token-num {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .token-lbl {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }
    .meta-bar {
      background: #ecfdf5;
      border-bottom: 1px solid #a7f3d0;
      padding: 6px 18px;
      font-size: 10.5px;
      font-weight: 600;
      color: #065f46;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px;
    }
    .card-body {
      padding: 14px 18px;
    }
    .alert-banner {
      background: #fef2f2;
      border: 1px solid #f87171;
      border-radius: 6px;
      padding: 6px 10px;
      color: #991b1b;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #047857;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      margin-top: 10px;
      margin-bottom: 6px;
    }
    .section-title:first-of-type {
      margin-top: 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .info-cell {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 5px 8px;
    }
    .cell-lbl {
      font-size: 9px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
    }
    .cell-val {
      font-size: 11.5px;
      color: #0f172a;
      font-weight: 700;
      margin-top: 1px;
    }
    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .vital-cell {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 6px 4px;
      text-align: center;
      background: #ffffff;
    }
    .vital-val {
      font-size: 13px;
      font-weight: 800;
      color: #047857;
    }
    .vital-lbl {
      font-size: 9px;
      color: #64748b;
      font-weight: 600;
      margin-top: 1px;
    }
    .text-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 7px 10px;
      font-size: 11px;
      color: #1e293b;
      line-height: 1.45;
    }
    .rx-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-top: 5px;
    }
    .rx-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 5px 8px;
      border: 1px solid #cbd5e1;
    }
    .rx-table td {
      padding: 5px 8px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }
    .footer-bar {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .sig-block {
      width: 200px;
      border-top: 1px solid #334155;
      text-align: center;
      padding-top: 3px;
      font-size: 10.5px;
      font-weight: 700;
      color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="close-btn" onclick="window.close()">✕ Close</button>
    <div style="font-size: 12px; font-weight: 600; color: #334155;">Patient OPD Clinical Pass &amp; Case Record</div>
    <button class="action-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
  </div>

  <div class="pass-card">
    <div class="hospital-header">
      <div>
        <div class="hospital-name">AAYUSH INTEGRATED SUPER-SPECIALTY HOSPITAL</div>
        <div class="hospital-sub">Central Clinical OPD Consultation Pass &amp; Medical Case Record</div>
        <div class="hospital-sub">NABH Accredited • Ministry of Health &amp; AYUSH Integrated Facility</div>
      </div>
      <div class="token-box">
        <div class="token-num">${visit.token}</div>
        <div class="token-lbl">OPD Token</div>
      </div>
    </div>

    <div class="meta-bar">
      <span><strong>Date:</strong> ${dateStr}</span>
      <span><strong>Consultant:</strong> ${doctorName} (${doctorDepartment}) • Room 104</span>
      <span><strong>Track:</strong> ${visit.track} Track</span>
    </div>

    <div class="card-body">
      ${
        visit.isRedFlag
          ? `<div class="alert-banner">
              ⚠️ <strong>CLINICAL TRIAGE RED FLAG:</strong> ${visit.redFlagReason || "Immediate Priority Attention Required"}
            </div>`
          : ""
      }

      <div class="section-title">Patient Identification &amp; Demographics</div>
      <div class="info-grid">
        <div class="info-cell">
          <div class="cell-lbl">Patient Full Name</div>
          <div class="cell-val">${visit.patientName}</div>
        </div>
        <div class="info-cell">
          <div class="cell-lbl">Age / Gender</div>
          <div class="cell-val">${visit.age} Years / ${visit.sex}</div>
        </div>
        <div class="info-cell">
          <div class="cell-lbl">Phone Number</div>
          <div class="cell-val">${visit.phone || "—"}</div>
        </div>
        <div class="info-cell">
          <div class="cell-lbl">ABHA ID</div>
          <div class="cell-val">${visit.abhaId || "—"}</div>
        </div>
        <div class="info-cell">
          <div class="cell-lbl">Patient UUID</div>
          <div class="cell-val">${visit.patientUuid || visit.id}</div>
        </div>
        <div class="info-cell">
          <div class="cell-lbl">Triage Priority</div>
          <div class="cell-val" style="color:${visit.isRedFlag ? "#dc2626" : "#047857"}">
            ${visit.isRedFlag ? "Immediate Emergency Priority" : "Routine OPD"}
          </div>
        </div>
      </div>

      <div class="section-title">Recorded Vitals at Triage</div>
      <div class="vitals-grid">
        <div class="vital-cell">
          <div class="vital-val">${visit.vitals?.bp || "—"}</div>
          <div class="vital-lbl">BP (mmHg)</div>
        </div>
        <div class="vital-cell">
          <div class="vital-val">${visit.vitals?.pulse || "—"} <span style="font-size:9px">bpm</span></div>
          <div class="vital-lbl">Heart Rate</div>
        </div>
        <div class="vital-cell">
          <div class="vital-val">${visit.vitals?.spo2 || "—"}%</div>
          <div class="vital-lbl">Oxygen SpO2</div>
        </div>
        <div class="vital-cell">
          <div class="vital-val">${visit.vitals?.temp || "—"}°F</div>
          <div class="vital-lbl">Temperature</div>
        </div>
        <div class="vital-cell">
          <div class="vital-val">${visit.vitals?.respRate || "—"} <span style="font-size:9px">/min</span></div>
          <div class="vital-lbl">Resp Rate</div>
        </div>
      </div>

      <div class="section-title">Chief Complaints &amp; Clinical Intake</div>
      <div class="text-box">
        <strong>Reported Complaint:</strong> ${visit.intakeSummary || "Routine OPD Consultation"}
        ${
          visit.symptoms?.length > 0
            ? `<br/><br/><strong>Reported Symptoms:</strong> ` +
              visit.symptoms
                .map((s) => `${s.name} (Duration: ${s.duration || "N/A"}, Severity: ${s.severity || "Moderate"})`)
                .join(" • ")
            : ""
        }
        ${
          visit.track === "Ayurveda" && visit.ayushProfile
            ? `<br/><br/><strong>Ayurveda Clinical Profile:</strong> Prakriti: ${visit.ayushProfile.prakriti || "—"} | Agni: ${visit.ayushProfile.agni || "—"} | Koshtha: ${visit.ayushProfile.koshtha || "—"}`
            : ""
        }
      </div>

      ${
        diag
          ? `<div class="section-title">Provisional / Confirmed Diagnosis</div>
             <div class="text-box" style="font-weight:700; color:#047857;">
               ${diag}
             </div>`
          : ""
      }

      ${
        notes
          ? `<div class="section-title">Physician Consultation Notes</div>
             <div class="text-box">
               ${notes}
             </div>`
          : ""
      }

      <div class="section-title">Prescribed Medications (Rx)</div>
      ${
        rxItems.length > 0
          ? `<table class="rx-table">
              <thead>
                <tr>
                  <th style="width:25px">#</th>
                  <th>Medication / Formulation</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                ${rxItems
                  .map(
                    (p, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.dosage || "—"}</td>
                    <td>${p.frequency || "—"}</td>
                    <td>${p.duration || "—"}</td>
                    <td>${p.instructions || "As directed"}</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : `<div class="text-box" style="font-style:italic; color:#64748b;">No medication items prescribed yet.</div>`
      }

      ${
        pathya
          ? `<div class="section-title">Pathya / Diet &amp; Lifestyle Guidance</div>
             <div class="text-box" style="background:#fefce8; border-color:#fef08a; color:#854d0e;">
               ${pathya}
             </div>`
          : ""
      }

      <div class="footer-bar">
        <div>
          <div style="font-size:9.5px; color:#64748b;">MediKiosk Integrated Hospital Information System</div>
          <div style="font-size:9px; color:#94a3b8;">Valid for 7 days from issue date. Computer generated document.</div>
        </div>
        <div class="sig-block">
          ${doctorName}<br/>
          <span style="font-size:8.5px; font-weight:normal; color:#64748b;">Authorized Signatory / Medical Officer</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  <\/script>
</body>
</html>`;
  }

  function handlePrintSummary() {
    if (!selectedVisit) return;
    const html = buildPrintablePassHtml(selectedVisit);

    try {
      const printWindow = window.open("", "_blank", "width=850,height=900");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        return;
      }
    } catch (e) {
      console.warn("Popup blocked, falling back to hidden iframe:", e);
    }

    // Fallback: hidden iframe print
    let iframe = document.getElementById("patient-print-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "patient-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 350);
  }

  return (
    <main className="min-h-screen bg-slate-200/60 font-sans text-slate-900 lg:h-screen lg:overflow-hidden lg:flex lg:flex-col">
      {/* 1. Universal Top Navbar (Identical to Admin Dashboard) */}
      <header className="shrink-0 border-b border-slate-200 bg-white shadow-2xs">
        <div className="navbar mx-auto max-w-7xl px-4 py-3.5 sm:px-6 sm:py-4 min-h-[76px] sm:min-h-[84px]">
          <div className="flex flex-1 items-center gap-3.5">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300/80 shadow-xs">
              <HeartPulse className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <p className="text-3xl sm:text-4xl font-black leading-none tracking-[-0.03em] text-slate-950">
                  Medi<span className="text-emerald-700">Kiosk</span>
                </p>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700">
                  Allopathy &amp; Ayurveda
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">Clinic Patient Intake &amp; Registration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm sm:text-base font-semibold text-slate-600 sm:inline">Today, 12 September 2026</span>
            <button
              className="btn btn-md border-slate-200 bg-white text-sm font-bold text-slate-700 hover:border-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors rounded-xl px-4 shadow-xs"
              type="button"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Full height flex column that fits in screen */}
      <div className="mx-auto flex-1 w-full max-w-7xl px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col min-h-0 lg:overflow-hidden">
        {/* 2. Doctor Info Banner — dark emerald */}
        <div className="shrink-0 rounded-xl bg-emerald-800 px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm shadow-emerald-900/20 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
              Physician OPD Consultation Console
            </p>
            <h1 className="mt-0.5 text-xl sm:text-2xl font-bold tracking-tight text-white">
              {doctorName} — {doctorDepartment}
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-emerald-100/90">
            Aayush Integrated Super-Specialty Hospital • Room 104 • Central OPD
          </p>
        </div>

        {/* Floating Toast Notification */}
        {saveToast && (
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-xs shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* 3. Main 2-Column Doctor Workspace (Queue on left, Case Sheet on right) */}
        <div className="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-12 flex-1 min-h-0 lg:overflow-hidden pb-1">
          {/* LEFT COLUMN: Consultation Queue (compact width: lg:col-span-4 xl:col-span-3) */}
          <section className="lg:col-span-4 xl:col-span-3 flex flex-col rounded-xl bg-white p-3 shadow-sm shadow-slate-300/40 min-h-0 h-full overflow-hidden">
            {/* Queue Header & Refresh */}
            <div className="shrink-0 flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Today&apos;s Queue</h2>
                <p className="text-[10px] text-slate-500">Live triage priority arrivals</p>
              </div>
              <button
                type="button"
                onClick={loadVisits}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                title="Poll now"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
                <span>Sync</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, token, ABHA ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm w-full pl-9 pr-3 text-xs bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-emerald-600 rounded-xl"
              />
            </div>

            {/* Queue List Cards with Scrollbar */}
            <div className="mt-2 flex-1 overflow-y-auto space-y-2 pr-0.5 min-h-0 [scrollbar-width:thin]">
              {sortedVisits.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <User className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  No patients matching current criteria.
                </div>
              ) : (
                sortedVisits.map((v) => {
                  const isSelected = selectedVisitId === v.id;
                  return (
                    <article
                      key={v.id}
                      onClick={() => selectVisit(v)}
                      className={`group relative cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/40 shadow-sm"
                          : v.isRedFlag && v.status !== "Completed"
                          ? "border-rose-300 bg-rose-50/30 hover:border-rose-400"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-black ${
                              v.isRedFlag && v.status !== "Completed"
                                ? "bg-rose-100 text-rose-900 border border-rose-200"
                                : "bg-slate-100 text-slate-800 border border-slate-200"
                            }`}
                          >
                            {v.token}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {v.patientName}
                          </h3>
                        </div>

                        {/* Urgent patient rounded indicator */}
                        {v.isRedFlag && v.status !== "Completed" && (
                          <span
                            className="h-3 w-3 shrink-0 rounded-full bg-red-600 ring-2 ring-red-300 shadow-xs animate-pulse"
                            title="Urgent Priority Triage"
                          />
                        )}
                      </div>

                      {/* Demographics & Track */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span>
                          {v.age}y / {v.sex}
                        </span>
                        <span>•</span>
                        <span
                          className={`font-medium ${
                            v.track === "Ayurveda" ? "text-amber-700" : "text-emerald-700"
                          }`}
                        >
                          {v.track} Track
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {v.waitTime}
                        </span>
                      </div>

                      {/* Primary Symptom Snip */}
                      <p className="mt-2 line-clamp-1 text-xs text-slate-600">
                        <strong className="text-slate-700">Complaint:</strong> {v.symptoms?.[0]?.name || v.intakeSummary}
                      </p>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          {/* RIGHT COLUMN: Active Patient Case Sheet & Consultation Console (expanded width: lg:col-span-8 xl:col-span-9) */}
          <section className="lg:col-span-8 xl:col-span-9 flex flex-col rounded-xl bg-white p-3 sm:p-3.5 shadow-sm shadow-slate-300/40 min-h-0 h-full overflow-hidden">
            {!selectedVisit ? (
              <div className="my-auto py-12 text-center text-slate-400">
                <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No Patient Selected</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select a patient from the queue on the left to begin consultation.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full min-h-0">
                {/* Patient Case Sheet Top Bar (Fixed at top of card) */}
                <div className="shrink-0 flex flex-col gap-2 pb-2.5 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-sm border-slate-300 bg-slate-100 font-bold text-slate-800">
                        {selectedVisit.token}
                      </span>
                      <h2 className="text-lg font-bold text-slate-950">{selectedVisit.patientName}</h2>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {selectedVisit.track} Track
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>{selectedVisit.age} yrs • {selectedVisit.sex}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" /> {selectedVisit.phone}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> ABHA: {selectedVisit.abhaId}
                      </span>
                    </div>
                  </div>

                  {/* Consultation Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrintSummary}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
                      title="Print Clinical OPD Pass"
                    >
                      <Printer className="h-3.5 w-3.5 text-slate-600" /> Print Pass
                    </button>

                    {selectedVisit.status === "Waiting" && (
                      <button
                        type="button"
                        onClick={handleStartConsultation}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                      >
                        <Stethoscope className="h-3.5 w-3.5" /> Call / Begin
                      </button>
                    )}

                    {selectedVisit.status === "In Consultation" && (
                      <button
                        type="button"
                        onClick={() => handleSaveConsultation(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Finalize &amp; Complete
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable Patient Clinical Data & Console Body */}
                <div className="flex-1 min-h-0 overflow-y-auto py-2.5 pr-1 space-y-3 [scrollbar-width:thin]">
                {/* RED-FLAG PRIORITY WARNING (Unmissable banner per PS text) */}
                {selectedVisit.isRedFlag && selectedVisit.status !== "Completed" && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-rose-900 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                          Immediate Clinical Alert — Triage Red Flag
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-rose-950">
                          {selectedVisit.redFlagReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vitals Summary Strip */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-center">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2">
                    <p className="text-[10px] font-medium uppercase text-slate-400">Blood Pressure</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedVisit.vitals?.bp || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2">
                    <p className="text-[10px] font-medium uppercase text-slate-400">Heart Pulse</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedVisit.vitals?.pulse || "—"}</p>
                  </div>
                  <div
                    className={`rounded-xl border p-2 ${
                      parseInt(selectedVisit.vitals?.spo2 || "100") < 94
                        ? "border-rose-300 bg-rose-50 text-rose-900"
                        : "border-slate-200 bg-slate-50/80 text-slate-900"
                    }`}
                  >
                    <p className="text-[10px] font-medium uppercase text-slate-400">SpO2 Level</p>
                    <p className="text-xs font-bold mt-0.5">{selectedVisit.vitals?.spo2 || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2">
                    <p className="text-[10px] font-medium uppercase text-slate-400">Temperature</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedVisit.vitals?.temp || "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2">
                    <p className="text-[10px] font-medium uppercase text-slate-400">Weight</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedVisit.vitals?.weight || "—"}</p>
                  </div>
                </div>

                {/* Sub-Tabs for Case Sheet Details */}
                <div className="flex gap-2 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("summary")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      activeTab === "summary"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Intake &amp; Source Evidence
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("prescription")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                      activeTab === "prescription"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Doctor Review &amp; Prescription ({prescriptionList.length})
                  </button>
                </div>

                {/* TAB 1: AI INTAKE SUMMARY & SOURCE EVIDENCE */}
                {activeTab === "summary" && (
                  <div className="space-y-4">
                    {/* AI-Drafted Clinical Narrative Summary */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">
                          AI-Drafted Intake Summary (From Multilingual Triage Questionnaire)
                        </h4>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-800 font-medium">
                        {selectedVisit.intakeSummary}
                      </p>
                      <p className="mt-2 text-[10px] text-emerald-700/80 italic">
                        *Source evidence verified from patient voice and tap responses. Clinician review required before signing.
                      </p>
                    </div>

                    {/* Source Evidence: Symptoms Table */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-2">Reported Symptoms &amp; Duration Breakdown</h4>
                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                              <th className="px-3 py-1.5 font-semibold">Symptom</th>
                              <th className="px-3 py-1.5 font-semibold">Severity</th>
                              <th className="px-3 py-1.5 font-semibold">Duration</th>
                              <th className="px-3 py-1.5 font-semibold">Reported Patient Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedVisit.symptoms?.map((s, idx) => (
                              <tr key={idx} className="border-b border-slate-200 even:bg-slate-50/60">
                                <td className="px-3 py-2 font-semibold text-slate-900">{s.name}</td>
                                <td className="px-3 py-2">
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      s.severity === "Severe"
                                        ? "bg-rose-100 text-rose-800"
                                        : s.severity === "Moderate"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {s.severity}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-slate-600">{s.duration}</td>
                                <td className="px-3 py-2 text-slate-600">{s.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Ayurvedic Assessment Profile (if applicable) */}
                    {selectedVisit.track === "Ayurveda" && selectedVisit.ayurvedicProfile && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                        <h4 className="text-xs font-bold text-amber-900 mb-2">
                          Ayurvedic Clinical Profile (Dashavidha / Prakriti Assessment)
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                          <div className="rounded-lg bg-white p-2 border border-amber-200">
                            <span className="text-[10px] text-slate-400 uppercase font-medium">Deha Prakriti</span>
                            <p className="font-bold text-amber-900">{selectedVisit.ayurvedicProfile.prakriti}</p>
                          </div>
                          <div className="rounded-lg bg-white p-2 border border-amber-200">
                            <span className="text-[10px] text-slate-400 uppercase font-medium">Vikriti (Imbalance)</span>
                            <p className="font-bold text-amber-900">{selectedVisit.ayurvedicProfile.vikriti}</p>
                          </div>
                          <div className="rounded-lg bg-white p-2 border border-amber-200">
                            <span className="text-[10px] text-slate-400 uppercase font-medium">Agni State</span>
                            <p className="font-bold text-amber-900">{selectedVisit.ayurvedicProfile.agni}</p>
                          </div>
                          <div className="rounded-lg bg-white p-2 border border-amber-200">
                            <span className="text-[10px] text-slate-400 uppercase font-medium">Koshtha</span>
                            <p className="font-bold text-amber-900">{selectedVisit.ayurvedicProfile.koshtha}</p>
                          </div>
                          <div className="rounded-lg bg-white p-2 border border-amber-200 sm:col-span-2">
                            <span className="text-[10px] text-slate-400 uppercase font-medium">Nidra (Sleep)</span>
                            <p className="font-bold text-amber-900">{selectedVisit.ayurvedicProfile.sleep}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Medical Background & Allergies */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <span className="text-[11px] font-bold text-slate-700">Known Drug Allergies:</span>
                        <p className="mt-1 text-xs text-rose-700 font-semibold">
                          {selectedVisit.allergies?.join(", ") || "No known allergies"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                        <span className="text-[11px] font-bold text-slate-700">Current Medications:</span>
                        <p className="mt-1 text-xs text-slate-700 font-medium">
                          {selectedVisit.medications?.join(", ") || "None reported"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: DOCTOR CLINICAL REVIEW & PRESCRIPTION */}
                {activeTab === "prescription" && (
                  <div className="space-y-4">
                    {/* Provisional Diagnosis Field */}
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-800 mb-1">
                        Doctor&apos;s Provisional Clinical Diagnosis:
                      </label>
                      <input
                        type="text"
                        value={provisionalDiagnosis}
                        onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                        placeholder="e.g. Acute Coronary Syndrome (rule out NSTEMI) / Amlapitta with Ardhavabhedaka"
                        className="input input-sm border-slate-300 bg-white text-xs focus:border-emerald-600 focus:outline-emerald-600 rounded-xl"
                      />
                    </div>

                    {/* Doctor Clinical Notes */}
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-800 mb-1">
                        Physical Examination &amp; Clinical Findings:
                      </label>
                      <textarea
                        rows={3}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Record heart sounds, chest auscultation, palpation, pulse examination notes..."
                        className="textarea textarea-bordered text-xs bg-white border-slate-300 focus:border-emerald-600 focus:outline-emerald-600 rounded-xl"
                      />
                    </div>

                    {/* Structured Prescription Table */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Pill className="h-3.5 w-3.5 text-emerald-600" />
                          Prescription / Medication Chart:
                        </h4>
                        <button
                          type="button"
                          onClick={handleAddMedicine}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-300 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" /> Add Medicine
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                              <th className="px-2.5 py-1.5 font-semibold">Medicine / Formulation</th>
                              <th className="px-2.5 py-1.5 font-semibold">Dosage</th>
                              <th className="px-2.5 py-1.5 font-semibold">Frequency</th>
                              <th className="px-2.5 py-1.5 font-semibold">Duration</th>
                              <th className="px-2.5 py-1.5 font-semibold">Instructions</th>
                              <th className="px-2 py-1.5 text-center font-semibold">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prescriptionList.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-4 text-center text-xs text-slate-400">
                                  No medicines added yet. Click &quot;Add Medicine&quot; above.
                                </td>
                              </tr>
                            ) : (
                              prescriptionList.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-200 even:bg-slate-50/50">
                                  <td className="p-1.5">
                                    <input
                                      type="text"
                                      value={item.drug}
                                      onChange={(e) => handleUpdateMedicine(idx, "drug", e.target.value)}
                                      placeholder="Medicine name"
                                      className="input input-xs w-full bg-white border-slate-300 text-xs"
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <input
                                      type="text"
                                      value={item.dosage}
                                      onChange={(e) => handleUpdateMedicine(idx, "dosage", e.target.value)}
                                      placeholder="1 tab / 5ml"
                                      className="input input-xs w-24 bg-white border-slate-300 text-xs"
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <input
                                      type="text"
                                      value={item.frequency}
                                      onChange={(e) => handleUpdateMedicine(idx, "frequency", e.target.value)}
                                      placeholder="BD / OD"
                                      className="input input-xs w-28 bg-white border-slate-300 text-xs"
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <input
                                      type="text"
                                      value={item.duration}
                                      onChange={(e) => handleUpdateMedicine(idx, "duration", e.target.value)}
                                      placeholder="5 days"
                                      className="input input-xs w-20 bg-white border-slate-300 text-xs"
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <input
                                      type="text"
                                      value={item.instructions}
                                      onChange={(e) => handleUpdateMedicine(idx, "instructions", e.target.value)}
                                      placeholder="After meals"
                                      className="input input-xs w-full bg-white border-slate-300 text-xs"
                                    />
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMedicine(idx)}
                                      className="btn btn-ghost btn-xs text-rose-600 hover:bg-rose-50"
                                      title="Remove item"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pathya / Dietary & Lifestyle Advice */}
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-800 mb-1">
                        Dietary &amp; Lifestyle Advice (Pathya / Apathya Guidance):
                      </label>
                      <textarea
                        rows={2}
                        value={pathyaAdvice}
                        onChange={(e) => setPathyaAdvice(e.target.value)}
                        placeholder="Pathya (Do's): Warm hydration, light meals, proper sleep. Apathya (Don'ts): Oily/spicy food, late dinners..."
                        className="textarea textarea-bordered text-xs bg-white border-slate-300 focus:border-emerald-600 focus:outline-emerald-600 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                </div>

                {/* Consultation Footer Actions (Fixed at bottom of card) */}
                <div className="shrink-0 flex flex-col gap-2 pt-2.5 border-t border-slate-200 sm:flex-row sm:items-center sm:justify-between bg-white">
                  <span className="text-[11px] text-slate-400">
                    Visit ID: <strong className="font-mono text-slate-600">{selectedVisit.id}</strong> • Auto-stored in local database
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveConsultation(false)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Save className="h-3.5 w-3.5 text-slate-600" /> Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveConsultation(true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Save &amp; Finalize Case
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
