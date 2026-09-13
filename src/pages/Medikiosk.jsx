import { useState } from "react";
import {
  HeartPulse,
  Languages,
  Globe,
  BookOpen,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Activity,
  Phone,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  User,
  Mic,
  MicOff,
  Printer,
  QrCode,
  Building2,
  Brain,
  Utensils,
  Thermometer,
  Eye,
  Info,
} from "lucide-react";
import {
  UI_TEXTS,
  RED_FLAG_ITEMS,
  CHIEF_COMPLAINTS,
  AYURVEDA_PRAKRITI_OPTIONS,
  AYURVEDA_AGNI_OPTIONS,
  AYURVEDA_KOSHTHA_OPTIONS,
  AYURVEDA_SLEEP_OPTIONS,
} from "../data/patientQuestionnaire.js";
import {
  lookupAbhaRecord,
  registerNewPatientVisit,
  mockAbhaRecords,
} from "../storage/db.js";

const LANGUAGE_OPTIONS = [
  { id: "en", label: "English", icon: Globe },
  { id: "hi", label: "हिन्दी", icon: Languages },
  { id: "ml", label: "മലയാളം", icon: BookOpen },
];

export default function Medikiosk() {
  const [lang, setLang] = useState(null); // by default no language is selected
  const t = UI_TEXTS[lang || "en"];

  // Kiosk Initial Screen State: false shows grand Patient Self-Registration & Clinical Case Intake box with language selection; true opens intake flow
  const [isStarted, setIsStarted] = useState(false);

  // Stepper: 1: Identification, 2: Allopathy/Ayurveda Track, 3: Emergency Path, 4: Clinical Intake & Complaints, 5: Pass Issued
  const [currentStep, setCurrentStep] = useState(1);

  // Helper: Click on any language to set language and immediately advance to questionnaire
  function handleSelectLanguageAndStart(selectedLang) {
    setLang(selectedLang);
    setIsStarted(true);
  }

  // Step 1: Patient ID State
  const [idMethod, setIdMethod] = useState("abha"); // abha | guest
  const [abhaInput, setAbhaInput] = useState("");
  const [idError, setIdError] = useState("");
  const [isAbhaVerified, setIsAbhaVerified] = useState(false);

  // Patient Demographic Profile
  const [patientName, setPatientName] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("Male"); // Male | Female | Other
  const [phone, setPhone] = useState("");
  const [abhaId, setAbhaId] = useState("");
  const [patientUuid, setPatientUuid] = useState("");

  // Helper: Calculate Age from DOB
  function handleDobChange(e) {
    const val = e.target.value;
    setDob(val);
    if (!val) {
      setAge("");
      return;
    }
    const birthDate = new Date(val);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    if (calculatedAge >= 0 && calculatedAge <= 125) {
      setAge(calculatedAge);
      setIdError("");
    } else {
      setAge("");
      setIdError("Please enter a valid Date of Birth.");
    }
  }

  // Step 2: Emergency Red-Flag State
  const [isRedFlag, setIsRedFlag] = useState(false);
  const [selectedRedFlags, setSelectedRedFlags] = useState([]);

  // Step 3: Track & Chief Complaints State
  const [track, setTrack] = useState("Allopathy"); // Allopathy | Ayurveda
  const [selectedCategory, setSelectedCategory] = useState("chest_breathing");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const [customComplaintText, setCustomComplaintText] = useState("");

  // Step 4: Clinical Details & Ayurveda / LMP State
  const [duration, setDuration] = useState("3 days");
  const [severity, setSeverity] = useState("Moderate");
  const [selectedPrakriti, setSelectedPrakriti] = useState("vata_pitta");
  const [selectedAgni, setSelectedAgni] = useState("vishama");
  const [selectedKoshtha, setSelectedKoshtha] = useState("madhyama");
  const [selectedSleep, setSelectedSleep] = useState("sound");
  const [allergies, setAllergies] = useState("None known");
  const [medications, setMedications] = useState("None reported");
  const [lmpStatus, setLmpStatus] = useState("Regular (28 days)");
  const [pregnancyCheck, setPregnancyCheck] = useState("No");

  // Step 5: Finalized Generated Visit
  const [generatedVisit, setGeneratedVisit] = useState(null);

  // Helper: Handle ABHA Verification
  function handleAbhaVerification(inputOverride) {
    const query = inputOverride || abhaInput;
    setIdError("");
    if (!query || query.trim().length < 5) {
      setIdError("Please enter a valid ABHA Number or select a demo patient.");
      return;
    }

    const record = lookupAbhaRecord(query);
    if (record) {
      setPatientName(record.patientName);
      setDob(record.dob || "");
      if (record.dob) {
        const birth = new Date(record.dob);
        const today = new Date();
        let calculated = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          calculated--;
        }
        setAge(calculated);
      } else {
        setAge(record.age);
      }
      setSex(record.sex);
      setPhone(record.phone);
      setAbhaId(record.abhaId);
      setPatientUuid(record.patientUuid);
      setIsAbhaVerified(true);
      setIdError("");
    } else {
      // Mock instant creation if user typed custom ABHA
      const cleanNum = query.replace(/[^0-9]/g, "");
      const formatted = cleanNum.length >= 14 ? cleanNum.slice(0, 14).replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, "$1-$2-$3-$4") : query;
      setPatientName("Aaditya Kashyap");
      setDob("1990-04-12");
      setAge(36);
      setSex("Male");
      setPhone("+91 98110 44219");
      setAbhaId(formatted);
      setPatientUuid(`MED-IN-${Math.floor(10000 + Math.random() * 90000)}`);
      setIsAbhaVerified(true);
    }
  }

  // Handle Demo Shortcut
  function applyDemoAbha(demo) {
    setAbhaInput(demo.abhaId);
    handleAbhaVerification(demo.abhaId);
  }

  // Step Navigation Validators
  function handleProceedFromStep1() {
    setIdError("");
    if (!patientName.trim()) {
      setIdError("Please enter the patient full name.");
      return;
    }
    if (!dob) {
      setIdError("Please select or confirm Date of Birth (DOB).");
      return;
    }
    if (age === "" || Number(age) < 0 || Number(age) > 125) {
      setIdError("Please select a valid Date of Birth.");
      return;
    }
    if (idMethod === "guest" && !phone.trim()) {
      setIdError("Please enter a valid contact phone number.");
      return;
    }
    setCurrentStep(2);
  }

  // Toggle Red Flag Items
  function toggleRedFlag(rf) {
    if (selectedRedFlags.some((item) => item.id === rf.id)) {
      const updated = selectedRedFlags.filter((item) => item.id !== rf.id);
      setSelectedRedFlags(updated);
      setIsRedFlag(updated.length > 0);
    } else {
      const updated = [...selectedRedFlags, rf];
      setSelectedRedFlags(updated);
      setIsRedFlag(true);
    }
  }

  // Toggle Symptom Selection
  function toggleSymptom(s) {
    if (selectedSymptoms.some((item) => item.id === s.id)) {
      setSelectedSymptoms(selectedSymptoms.filter((item) => item.id !== s.id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, s]);
    }
  }

  // Simulate Voice Dictation
  function toggleVoiceInput() {
    if (voiceActive) {
      setVoiceActive(false);
    } else {
      setVoiceActive(true);
      // Simulated spoken transcription after 1.5s
      setTimeout(() => {
        setCustomComplaintText((prev) =>
          prev ? `${prev}, feeling burning sensation in chest after eating` : "Severe dull ache in upper abdomen and frequent burning sensation"
        );
        setVoiceActive(false);
      }, 1600);
    }
  }

  // Step 4 Completion: Register Visit & Generate Smart Pass
  function handleFinalizeRegistration() {
    // Construct clinical intake narrative
    const primarySymptomsList = selectedSymptoms.map((s) => s[lang] || s.en);
    const complaintSummary = customComplaintText
      ? `${customComplaintText}. ${primarySymptomsList.join(", ")}`
      : primarySymptomsList.length > 0
      ? primarySymptomsList.join(", ")
      : "General health review requested";

    const redFlagReasons = selectedRedFlags.map((r) => r.reason).join(" • ");

    const formattedSymptoms = selectedSymptoms.map((s) => ({
      name: s[lang] || s.en,
      severity: severity,
      duration: duration,
      notes: "Reported at patient intake kiosk",
    }));

    const ayurvedicProfile =
      track === "Ayurveda"
        ? {
            prakriti: selectedPrakriti,
            agni: selectedAgni,
            koshtha: selectedKoshtha,
            sleep: selectedSleep,
          }
        : null;

    const newVisitPayload = {
      patientName: patientName.trim(),
      dob: dob || "",
      age: Number(age),
      sex: sex,
      phone: phone.trim() || "+91 99999 00000",
      abhaId: abhaId || "Unregistered Guest",
      patientUuid: patientUuid || `MED-IN-${Math.floor(10000 + Math.random() * 90000)}`,
      track: track,
      isRedFlag: isRedFlag,
      redFlagReason: redFlagReasons,
      intakeSummary: `${age}y ${sex} presenting with ${complaintSummary}. Duration: ${duration}, Severity: ${severity}.`,
      symptoms: formattedSymptoms,
      ayurvedicProfile: ayurvedicProfile,
      allergies: allergies ? [allergies] : ["None known"],
      medications: medications ? [medications] : ["None reported"],
    };

    const registered = registerNewPatientVisit(newVisitPayload);
    setGeneratedVisit(registered);
    setCurrentStep(5);
  }

  // Reset for next patient
  function handleStartNewIntake() {
    setLang(null);
    setIsStarted(false);
    setCurrentStep(1);
    setIdMethod("abha");
    setAbhaInput("");
    setIdError("");
    setIsAbhaVerified(false);
    setPatientName("");
    setDob("");
    setAge("");
    setSex("Male");
    setPhone("");
    setAbhaId("");
    setPatientUuid("");
    setIsRedFlag(false);
    setSelectedRedFlags([]);
    setTrack("Allopathy");
    setSelectedSymptoms([]);
    setCustomComplaintText("");
    setGeneratedVisit(null);
  }

  // Print Pass isolated popup
  function handlePrintPassCard() {
    if (!generatedVisit) return;
    const printWindow = window.open("", "_blank", "width=850,height=900");
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>OPD_Pass_${generatedVisit.token}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; font-family: sans-serif; }
    body { padding: 20px; color: #0f172a; }
    .card { border: 2px solid #047857; border-radius: 12px; overflow: hidden; }
    .header { background: #047857; color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
    .token { background: white; color: #047857; font-size: 24px; font-weight: 900; padding: 6px 16px; border-radius: 8px; border: 2px solid #065f46; }
    .body { padding: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
    .item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; }
    .lbl { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
    .val { font-size: 13px; font-weight: bold; margin-top: 2px; }
    .alert { background: #fef2f2; border: 1px solid #f87171; color: #991b1b; padding: 10px; border-radius: 6px; font-weight: bold; margin-bottom: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h2 style="margin:0; font-size:18px;">AAYUSH INTEGRATED SUPER-SPECIALTY HOSPITAL</h2>
        <p style="margin:4px 0 0; font-size:11px; opacity:0.9;">Patient OPD Consultation Token &amp; Routing Pass</p>
      </div>
      <div class="token">${generatedVisit.token}</div>
    </div>
    <div class="body">
      ${generatedVisit.isRedFlag ? `<div class="alert">⚠️ IMMEDIATE EMERGENCY PRIORITY — REPORT TO ROOM 104 IMMEDIATELY</div>` : ""}
      <div class="grid">
        <div class="item"><div class="lbl">Patient Name</div><div class="val">${generatedVisit.patientName}</div></div>
        <div class="item"><div class="lbl">Age / Gender</div><div class="val">${generatedVisit.age} Years / ${generatedVisit.sex}</div></div>
        <div class="item"><div class="lbl">ABHA ID</div><div class="val">${generatedVisit.abhaId}</div></div>
        <div class="item"><div class="lbl">Patient UUID</div><div class="val">${generatedVisit.patientUuid}</div></div>
        <div class="item"><div class="lbl">Clinical Track</div><div class="val">${generatedVisit.track} Track</div></div>
        <div class="item"><div class="lbl">Assigned OPD Room</div><div class="val">Room 104 • Central Consultation</div></div>
      </div>
      <div style="margin-top:20px; font-size:12px; color:#475569;">
        <strong>Reported Complaint:</strong> ${generatedVisit.intakeSummary}
      </div>
      <div style="margin-top:24px; text-align:right; font-size:11px; color:#64748b;">
        Issued: ${new Date().toLocaleString("en-IN")} • Valid for today only
      </div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); };<\/script>
</body>
</html>`;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  return (
    <main className="min-h-screen bg-slate-200/60 font-sans text-slate-900 flex flex-col lg:h-screen lg:overflow-hidden">
      {/* 1. Universal Top Navbar — IDENTICAL to Admin/Doctor Console, NO Logout Button */}
      <header className="shrink-0 border-b border-slate-200 bg-white shadow-2xs">
        <div className="navbar mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-3.5 min-h-[74px] sm:min-h-[80px]">
          <div className="flex flex-1 items-center gap-3.5">
            <div className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300/80 shadow-xs">
              <HeartPulse className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-black leading-none tracking-[-0.03em] text-slate-950">
                  Medi<span className="text-emerald-700">Kiosk</span>
                </p>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700">
                  {t.allopathyAyurvedaBadge}
                </span>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-500">{t.kioskSubtitle}</p>
            </div>
          </div>

          {/* Right Side: Date (NO LOGOUT BUTTON) */}
          <div className="flex items-center gap-4">
            <span className="hidden text-sm sm:text-base font-semibold text-slate-600 sm:inline">Today, 12 September 2026</span>
          </div>
        </div>
      </header>

      {/* Main Container - Fitted to screen on desktop */}
      <div className="mx-auto flex-1 w-full max-w-7xl px-3 py-2.5 sm:px-6 sm:py-3 lg:py-4 flex flex-col min-h-0 justify-center">
        {!isStarted ? (
          /* INITIAL LANDING SCREEN:
             Patient OPD Registration card with language buttons.
             Each button has language icon on left and language name on right.
             Clicking any language immediately begins registration in that language. */
          <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
            <div className="my-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-center flex flex-col items-center justify-center gap-4 sm:gap-5">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-xs">
                <HeartPulse className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                  Patient OPD Registration
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Select your language to begin
                </p>
              </div>

              {/* 3-Language Action Buttons: Icon on Left, Language Name on Right */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-1">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setLang(opt.id);
                        setIsStarted(true);
                      }}
                      className="group flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 hover:bg-emerald-700 hover:border-emerald-700 px-4 py-3.5 text-slate-800 hover:text-white transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 group-hover:bg-white/20 group-hover:text-white transition-colors shadow-2xs">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-base font-bold">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-400">
                ABHA Verification • Walk-in Guest • Ayush Path
              </p>
            </div>
          </div>
        ) : (
          /* 5-STEP CLINICAL INTAKE FLOW (Fitted to Single Screen on Desktop) */
          <div className="flex-1 flex flex-col items-center justify-center py-1 sm:py-2 lg:py-3 w-full min-h-0">
            <div className="w-full max-w-3xl flex flex-col gap-2.5 sm:gap-3 my-auto min-h-0">
              {/* Scaled Minimal Progress Stepper */}
              <div className="flex items-center justify-between gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none]">
                {[
                  { step: 1, label: t.step1Title },
                  { step: 2, label: t.step2Title },
                  { step: 3, label: t.step3Title },
                  { step: 4, label: t.step4Title },
                  { step: 5, label: t.step5Title },
                ].map((s) => {
                  const cleanLabel = s.label.replace(/^\d+\.\s*/, "");
                  const isActive = currentStep === s.step;
                  const isCompleted = currentStep > s.step;
                  return (
                    <div
                      key={s.step}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all shrink-0 text-xs sm:text-sm ${
                        isActive
                          ? "bg-emerald-700 text-white font-bold shadow-xs ring-2 ring-emerald-200"
                          : isCompleted
                          ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200"
                          : "bg-slate-100 text-slate-500 font-medium"
                      }`}
                    >
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-black ${
                        isActive ? "bg-white text-emerald-800" : isCompleted ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-600"
                      }`}>
                        {isCompleted ? "✓" : s.step}
                      </span>
                      <span className="hidden sm:inline font-semibold">{cleanLabel}</span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Step Content Container — Proper Form Dimensions & Natural Height */}
              <div className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 lg:p-7 shadow-sm border border-slate-200/90 flex flex-col min-h-0">
                {/* STEP 1: PATIENT IDENTIFICATION */}
                {currentStep === 1 && (
                  <div className="w-full space-y-4">
                    <div className="text-center pb-0.5">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.step1Title.replace(/^\d+\.\s*/, "")}</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                        Select identification method to initiate case intake
                      </p>
                    </div>

                    {/* ID Tabs: ABHA ID vs New Guest Walk-in */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setIdMethod("abha");
                          setIsAbhaVerified(false);
                          setIdError("");
                        }}
                        className={`py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                          idMethod === "abha" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {t.abhaTab}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIdMethod("guest");
                          setIsAbhaVerified(false);
                          setPatientName("");
                          setDob("");
                          setAge("");
                          setPhone("");
                          setAbhaId("Unregistered Guest");
                          setIdError("");
                        }}
                        className={`py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                          idMethod === "guest" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {t.guestTab}
                      </button>
                    </div>

                    {/* ID Method Form Fields */}
                    <div className="space-y-3">
                      {idMethod === "abha" && (
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">
                              Ayushman Bharat Health Account (ABHA ID):
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={t.abhaPlaceholder}
                                value={abhaInput}
                                onChange={(e) => setAbhaInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAbhaVerification()}
                                className="input h-10 sm:h-11 flex-1 bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                              />
                              <button
                                type="button"
                                onClick={() => handleAbhaVerification()}
                                className="btn h-10 sm:h-11 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl px-5 shadow-xs"
                              >
                                {t.fetchAbhaBtn}
                              </button>
                            </div>
                          </div>

                          {/* Fast Demo Autofill Chips */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="text-[11px] uppercase font-bold text-slate-400">Demo test:</span>
                            {mockAbhaRecords.map((demo) => (
                              <button
                                key={demo.abhaId}
                                type="button"
                                onClick={() => applyDemoAbha(demo)}
                                className="rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors border border-slate-200/80"
                              >
                                {demo.patientName} ({demo.sex}, {demo.dob})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Guest Walk-in Warning */}
                      {idMethod === "guest" && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 shadow-xs flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                              {t.guestWarningTitle}
                            </h3>
                            <p className="text-xs text-amber-900 leading-relaxed font-medium">
                              {t.guestWarning}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Error Banner */}
                      {idError && (
                        <div className="rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs sm:text-sm font-bold text-rose-800 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                          <span>{idError}</span>
                        </div>
                      )}

                      {/* Demographic Form — Full Sized Inputs */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                            Patient Demographics
                          </span>
                          {isAbhaVerified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> ABHA Verified Record
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.fullName} *</label>
                            <input
                              type="text"
                              value={patientName}
                              onChange={(e) => setPatientName(e.target.value)}
                              placeholder="e.g. Ramesh Patel"
                              className="input h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs sm:text-sm font-bold text-slate-800">
                                {t.dob} *
                              </label>
                              {age !== "" && (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                  {t.calculatedAge}: {age}y
                                </span>
                              )}
                            </div>
                            <input
                              type="date"
                              value={dob}
                              max={new Date().toISOString().split("T")[0]}
                              onChange={handleDobChange}
                              className="input h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">
                              {t.gender} *
                            </label>
                            <select
                              value={sex}
                              onChange={(e) => setSex(e.target.value)}
                              className="select h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            >
                              <option value="Male">{t.genderMale}</option>
                              <option value="Female">{t.genderFemale}</option>
                              <option value="Other">{t.genderOther}</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.phone} *</label>
                            <input
                              type="text"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="input h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={handleProceedFromStep1}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
                      >
                        <span>{t.continueBtn}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: CLINICAL TRACK SELECTION (ALLOPATHY OR AYURVEDA) */}
                {currentStep === 2 && (
                  <div className="w-full space-y-4">
                    <div className="text-center pb-0.5">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        {t.trackSelectionHeader}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
                        Select your preferred medical system for today's consultation
                      </p>
                    </div>

                    {/* Generous 2 Choice Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {/* Allopathy Card */}
                      <div
                        onClick={() => setTrack("Allopathy")}
                        className={`cursor-pointer rounded-2xl border-2 p-4 sm:p-5 transition-all flex items-start gap-3.5 shadow-xs ${
                          track === "Allopathy"
                            ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl shrink-0 transition-colors ${
                            track === "Allopathy"
                              ? "bg-emerald-700 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <Stethoscope className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-slate-900">
                            {t.allopathyTrack}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                            {t.allopathyTrackDesc}
                          </p>
                        </div>
                      </div>

                      {/* Ayurveda Card */}
                      <div
                        onClick={() => setTrack("Ayurveda")}
                        className={`cursor-pointer rounded-2xl border-2 p-4 sm:p-5 transition-all flex items-start gap-3.5 shadow-xs ${
                          track === "Ayurveda"
                            ? "border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl shrink-0 transition-colors ${
                            track === "Ayurveda"
                              ? "bg-amber-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-slate-900">
                            {t.ayurvedaTrack}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                            {t.ayurvedaTrackDesc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" /> {t.backBtn}
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                      >
                        <span>{t.continueBtn}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: EMERGENCY PRIORITY PATH (RED-FLAG SAFETY GATE) */}
                {currentStep === 3 && (
                  <div className="w-full space-y-4">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 sm:p-5 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                          <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-black text-rose-950 uppercase tracking-wide">
                            {t.redFlagHeader}
                          </h2>
                          <p className="text-xs sm:text-sm text-rose-800 mt-0.5 font-medium">{t.redFlagSub}</p>
                        </div>
                      </div>

                      {/* Red Flag Options List */}
                      <div className="mt-3 space-y-1.5">
                        {RED_FLAG_ITEMS.map((rf) => {
                          const isSelected = selectedRedFlags.some((item) => item.id === rf.id);
                          return (
                            <div
                              key={rf.id}
                              onClick={() => toggleRedFlag(rf)}
                              className={`cursor-pointer rounded-xl border p-2.5 sm:p-3 transition-all flex items-center justify-between gap-3 ${
                                isSelected
                                  ? "border-rose-600 bg-rose-600 text-white font-bold shadow-xs"
                                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-800"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`h-4.5 w-4.5 shrink-0 rounded-md border flex items-center justify-center text-xs ${
                                    isSelected ? "bg-white text-rose-700 border-white font-black" : "border-slate-300"
                                  }`}
                                >
                                  {isSelected && "✓"}
                                </span>
                                <span className="text-xs sm:text-sm font-semibold">{rf[lang] || rf.en}</span>
                              </div>
                              <span className={`text-[11px] uppercase font-bold shrink-0 px-2 py-0.5 rounded-md ${
                                isSelected ? "bg-rose-700 text-white" : "bg-rose-50 text-rose-700"
                              }`}>
                                High Priority
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Emergency Alert Banner if any red flag selected */}
                      {isRedFlag && (
                        <div className="mt-2.5 rounded-xl border border-rose-500 bg-rose-600 p-2.5 text-white shadow-xs animate-pulse">
                          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider">{t.immediateEmergencyAlert}</p>
                          <p className="text-xs mt-0.5 opacity-95">{t.emergencyActionMsg}</p>
                        </div>
                      )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" /> {t.backBtn}
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-colors ${
                          isRedFlag ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-700 hover:bg-emerald-800"
                        }`}
                      >
                        <span>{isRedFlag ? "Proceed with Urgent Path Marker" : t.continueBtn}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: CLINICAL INTAKE & CHIEF COMPLAINTS */}
                {currentStep === 4 && (
                  <div className="w-full space-y-3.5 flex flex-col min-h-0">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 shrink-0">
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">{t.step4Title.replace(/^\d+\.\s*/, "")}</h2>
                        <p className="text-xs text-slate-500">
                          Track: <span className="font-bold text-emerald-700">{track === "Ayurveda" ? t.ayurvedaTrack : t.allopathyTrack}</span>
                        </p>
                      </div>
                      {/* Voice Microphone Input Button */}
                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold transition-all shadow-xs ${
                          voiceActive ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60"
                        }`}
                        title={t.voicePrompt}
                      >
                        {voiceActive ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                        <span>{voiceActive ? "Listening..." : "Voice Input"}</span>
                      </button>
                    </div>

                    <div className="overflow-y-auto pr-1 space-y-3.5 max-h-[calc(100vh-310px)] [scrollbar-width:thin]">
                      {/* Chief Complaints Category Tabs */}
                      <div>
                        <div className="mb-1.5">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-800">{t.chiefComplaintHeader}</h3>
                          <p className="text-[11px] text-slate-500">{t.chiefComplaintSub}</p>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
                          {CHIEF_COMPLAINTS.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold shrink-0 transition-colors ${
                                selectedCategory === cat.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {cat[lang] || cat.en}
                            </button>
                          ))}
                        </div>

                        {/* Symptom Tap Chips */}
                        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {CHIEF_COMPLAINTS.find((c) => c.id === selectedCategory)?.symptoms.map((s) => {
                            const isChecked = selectedSymptoms.some((item) => item.id === s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => toggleSymptom(s)}
                                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                                  isChecked ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold" : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                                }`}
                              >
                                <span>{s[lang] || s.en}</span>
                                <span className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center text-xs ${
                                  isChecked ? "bg-emerald-700 text-white border-emerald-700" : "border-slate-300"
                                }`}>
                                  {isChecked && "✓"}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Notes */}
                        <div className="mt-2.5">
                          <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">
                            Describe your symptoms in your own words (or voice dictation):
                          </label>
                          <textarea
                            rows={2}
                            value={customComplaintText}
                            onChange={(e) => setCustomComplaintText(e.target.value)}
                            placeholder="e.g. Throbbing headache since morning, worsening with bright screen light..."
                            className="textarea textarea-bordered w-full bg-slate-50 text-xs sm:text-sm rounded-xl border-slate-300 focus:bg-white focus:border-emerald-600 p-2.5"
                          />
                        </div>
                      </div>

                      {/* Duration & Severity */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.durationLabel}</label>
                          <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="select h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600"
                          >
                            <option value="1-3 days">1 to 3 days (Acute onset)</option>
                            <option value="1-2 weeks">1 to 2 weeks</option>
                            <option value="1-3 months">1 to 3 months (Sub-acute)</option>
                            <option value="Over 3 months">Over 3 months (Chronic persistent)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.severityLabel}</label>
                          <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="select h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600"
                          >
                            <option value="Mild">{t.severityMild}</option>
                            <option value="Moderate">{t.severityMod}</option>
                            <option value="Severe">{t.severitySev}</option>
                          </select>
                        </div>
                      </div>

                      {/* AYURVEDA SPECIFIC MODULE (DASHAVIDHA PARIKSHA) */}
                      {track === "Ayurveda" && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs uppercase tracking-wide">
                            <Sparkles className="h-4 w-4 text-amber-700" />
                            <span>Ayurvedic Clinical Profile (Dashavidha Pariksha)</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Deha Prakriti */}
                            <div>
                              <label className="text-xs font-bold text-amber-950 block mb-1">{t.prakritiHeader}:</label>
                              <select
                                value={selectedPrakriti}
                                onChange={(e) => setSelectedPrakriti(e.target.value)}
                                className="select h-10 w-full bg-white border-amber-300 text-xs rounded-xl px-3 focus:border-amber-700"
                              >
                                {AYURVEDA_PRAKRITI_OPTIONS.map((opt) => (
                                  <option key={opt.id} value={opt.id}>{opt[lang] || opt.en}</option>
                                ))}
                              </select>
                            </div>

                            {/* Agni State */}
                            <div>
                              <label className="text-xs font-bold text-amber-950 block mb-1">{t.agniHeader}:</label>
                              <select
                                value={selectedAgni}
                                onChange={(e) => setSelectedAgni(e.target.value)}
                                className="select h-10 w-full bg-white border-amber-300 text-xs rounded-xl px-3 focus:border-amber-700"
                              >
                                {AYURVEDA_AGNI_OPTIONS.map((opt) => (
                                  <option key={opt.id} value={opt.id}>{opt[lang] || opt.en}</option>
                                ))}
                              </select>
                            </div>

                            {/* Koshtha State */}
                            <div>
                              <label className="text-xs font-bold text-amber-950 block mb-1">{t.koshthaHeader}:</label>
                              <select
                                value={selectedKoshtha}
                                onChange={(e) => setSelectedKoshtha(e.target.value)}
                                className="select h-10 w-full bg-white border-amber-300 text-xs rounded-xl px-3 focus:border-amber-700"
                              >
                                {AYURVEDA_KOSHTHA_OPTIONS.map((opt) => (
                                  <option key={opt.id} value={opt.id}>{opt[lang] || opt.en}</option>
                                ))}
                              </select>
                            </div>

                            {/* Sleep Pattern */}
                            <div>
                              <label className="text-xs font-bold text-amber-950 block mb-1">{t.sleepHeader}:</label>
                              <select
                                value={selectedSleep}
                                onChange={(e) => setSelectedSleep(e.target.value)}
                                className="select h-10 w-full bg-white border-amber-300 text-xs rounded-xl px-3 focus:border-amber-700"
                              >
                                {AYURVEDA_SLEEP_OPTIONS.map((opt) => (
                                  <option key={opt.id} value={opt.id}>{opt[lang] || opt.en}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Past History & Allergies */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.allergiesHeader}</label>
                          <input
                            type="text"
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                            placeholder="e.g. Penicillin, Sulfa, Dust..."
                            className="input h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.medicationsHeader}</label>
                          <input
                            type="text"
                            value={medications}
                            onChange={(e) => setMedications(e.target.value)}
                            placeholder="e.g. Amlodipine 5mg, Metformin..."
                            className="input h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600"
                          />
                        </div>
                      </div>

                      {/* CONDITIONAL LMP OVERLAY: Female patients aged 10 to 60 */}
                      {sex === "Female" && Number(age) >= 10 && Number(age) <= 60 && (
                        <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-3 space-y-2">
                          <span className="text-xs font-black text-pink-900 uppercase tracking-wide flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5 text-pink-700" />
                            <span>{t.lmpHeader}</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-bold text-pink-950 block mb-1">{t.lmpLabel}:</label>
                              <select
                                value={lmpStatus}
                                onChange={(e) => setLmpStatus(e.target.value)}
                                className="select h-10 w-full bg-white border-pink-300 text-xs rounded-xl px-3"
                              >
                                <option value="Regular (28-30 days)">Regular cycles (28-30 days)</option>
                                <option value="Irregular cycles">Irregular / Oligomenorrhea</option>
                                <option value="Within last 2 weeks">Within last 2 weeks</option>
                                <option value="Over 6 weeks ago">Over 6 weeks ago (Delayed)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-pink-950 block mb-1">{t.pregnancyLabel}:</label>
                              <select
                                value={pregnancyCheck}
                                onChange={(e) => setPregnancyCheck(e.target.value)}
                                className="select h-10 w-full bg-white border-pink-300 text-xs rounded-xl px-3"
                              >
                                <option value="No">No</option>
                                <option value="Yes (Confirmed)">Yes (Confirmed pregnancy)</option>
                                <option value="Uncertain">Uncertain</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" /> {t.backBtn}
                      </button>

                      <button
                        type="button"
                        onClick={handleFinalizeRegistration}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-7 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                      >
                        <CheckCircle2 className="h-4.5 w-4.5" />
                        <span>{t.confirmHeader}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: SMART OPD CONSULTATION PASS & TOKEN ISSUANCE */}
                {currentStep === 5 && generatedVisit && (
                  <div className="w-full flex flex-col items-center space-y-3">
                    {/* Success Badge */}
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <h2 className="text-lg sm:text-xl font-black">{t.tokenIssued}</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 text-center font-medium">
                      Your consultation token has been generated and dispatched to the Doctor Console.
                    </p>

                    {/* Physical Pass Presentation Card */}
                    <div className="w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                      <div className="bg-emerald-800 text-white p-3.5 sm:p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                            {t.hospitalName}
                          </h3>
                          <p className="text-[11px] text-emerald-200 mt-0.5">Central Clinical OPD Consultation Pass</p>
                        </div>
                        <div className="text-center rounded-xl bg-white text-emerald-900 border border-emerald-950/20 px-3 py-1 shadow-2xs">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Token</span>
                          <span className="text-xl sm:text-2xl font-black">{generatedVisit.token}</span>
                        </div>
                      </div>

                      {/* Priority Alert Banner if Red Flag */}
                      {generatedVisit.isRedFlag && (
                        <div className="bg-rose-600 text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2 animate-pulse">
                          <ShieldAlert className="h-4 w-4 shrink-0" />
                          <span>IMMEDIATE EMERGENCY PRIORITY — REPORT TO ROOM 104 IMMEDIATELY</span>
                        </div>
                      )}

                      {/* Pass Details Grid */}
                      <div className="p-3.5 sm:p-4 space-y-2.5">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{t.fullName}</span>
                            <strong className="text-slate-900 text-xs sm:text-sm">{generatedVisit.patientName}</strong>
                          </div>
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{t.age} / {t.gender}</span>
                            <strong className="text-slate-900 text-xs sm:text-sm">{generatedVisit.age}y / {generatedVisit.sex}</strong>
                          </div>
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{t.roomAssigned}</span>
                            <strong className="text-emerald-700 font-bold text-xs sm:text-sm">Room 104 • Central OPD</strong>
                          </div>
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Clinical Track</span>
                            <strong className="text-slate-900 text-xs sm:text-sm">{generatedVisit.track} Track</strong>
                          </div>
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">{t.estimatedWait}</span>
                            <strong className="text-slate-900 text-xs sm:text-sm">{generatedVisit.isRedFlag ? "0 min (Immediate)" : "Approx. 15 mins"}</strong>
                          </div>
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Patient UUID</span>
                            <strong className="font-mono text-slate-700 text-[11px] truncate block">{generatedVisit.patientUuid}</strong>
                          </div>
                        </div>

                        {/* Complaint Summary */}
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5 text-xs sm:text-sm text-slate-700">
                          <strong className="text-slate-900">Recorded Complaint:</strong> {generatedVisit.intakeSummary}
                        </div>

                        {/* Barcode & Routing Strip */}
                        <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200 text-slate-500 text-xs">
                          <div className="flex items-center gap-2">
                            <QrCode className="h-5 w-5 text-slate-700" />
                            <span className="font-mono text-[11px]">ABHA: {generatedVisit.abhaId}</span>
                          </div>
                          <span className="text-[11px]">Auto-saved to live doctor queue</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={handlePrintPassCard}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
                      >
                        <Printer className="h-4 w-4 text-slate-500" />
                        <span>{t.printPassBtn}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStartNewIntake}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>{t.newPatientBtn}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
