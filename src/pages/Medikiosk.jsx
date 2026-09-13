import { useEffect, useState } from "react";
import {
  HeartPulse,
  Languages,
  Globe,
  BookOpen,
  ShieldAlert,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  ShieldCheck,
  History,
  Lock,
  Printer,
  Home,
  HeartPulse as HeartPulseIcon,
  Baby,
  Bone,
  Smile,
  UserRound,
  Brain,
  Sparkles as SparklesIcon,
  Radiation,
  Ear,
  Eye,
  Venus,
  Droplets,
  Wind,
  Utensils,
  BrainCircuit,
  FlaskConical,
  Loader2,
} from "lucide-react";
import { patientApi, ApiError } from "../api/client";
import { UI_TEXT, DEMO_ABHA_RECORDS } from "../data/patientUiText";
import QuestionnaireStep from "./patient/QuestionnaireStep";
import BusyLabel from "../components/BusyLabel";

const LANGUAGE_OPTIONS = [
  { id: "en", label: "English", icon: Globe },
  { id: "hi", label: "हिन्दी", icon: Languages },
  { id: "ml", label: "മലയാളം", icon: BookOpen },
];

const DEPARTMENT_ICONS = {
  general: Stethoscope,
  heart: HeartPulseIcon,
  pediatrics: Baby,
  bone: Bone,
  dental: Smile,
  anthro: UserRound,
  brain: Brain,
  skin: SparklesIcon,
  oncology: Radiation,
  ent: Ear,
  eyes: Eye,
  gynecology: Venus,
  kidney: Droplets,
  lungs: Wind,
  digestion: Utensils,
  psychiatry: BrainCircuit,
  urology: FlaskConical,
};
const DEFAULT_DEPARTMENT_ICON = Stethoscope;

// The backend only stores an English patient-facing label per department
// (Department.patient_label) - there's no per-language column and no
// translation call in the Bhashini pipeline (asr/tts only). So department
// names shown on the kiosk are translated here, keyed by icon_key, with a
// fallback to whatever the API returned for anything not yet mapped.
const DEPARTMENT_LABELS = {
  general: { en: "General Medicine", hi: "सामान्य चिकित्सा", ml: "ജനറൽ മെഡിസിൻ" },
  ayurveda: { en: "Ayurveda", hi: "आयुर्वेद", ml: "ആയുർവേദം" },
  heart: { en: "Heart", hi: "हृदय", ml: "ഹൃദയം" },
  pediatrics: { en: "Children", hi: "बच्चे", ml: "കുട്ടികൾ" },
  bone: { en: "Bones & Joints", hi: "हड्डी एवं जोड़", ml: "എല്ലുകളും സന്ധികളും" },
  dental: { en: "Teeth & Gums", hi: "दांत एवं मसूड़े", ml: "പല്ലും മോണയും" },
  brain: { en: "Brain & Nerves", hi: "मस्तिष्क एवं तंत्रिका", ml: "മസ്തിഷ്കവും നാഡികളും" },
  skin: { en: "Skin", hi: "त्वचा", ml: "ചർമ്മം" },
  oncology: { en: "Cancer Care", hi: "कैंसर देखभाल", ml: "കാൻസർ പരിചരണം" },
  ent: { en: "Ear, Nose & Throat", hi: "कान, नाक एवं गला", ml: "ചെവി, മൂക്ക്, തൊണ്ട" },
  eyes: { en: "Eyes", hi: "आंखें", ml: "കണ്ണുകൾ" },
  gynecology: { en: "Women's Health", hi: "महिला स्वास्थ्य", ml: "സ്ത്രീ ആരോഗ്യം" },
  kidney: { en: "Kidneys", hi: "गुर्दे", ml: "വൃക്കകൾ" },
  lungs: { en: "Lungs", hi: "फेफड़े", ml: "ശ്വാസകോശം" },
  digestion: { en: "Digestion", hi: "पाचन", ml: "ദഹനം" },
  psychiatry: { en: "Mental Health", hi: "मानसिक स्वास्थ्य", ml: "മാനസികാരോഗ്യം" },
  urology: { en: "Urinary System", hi: "मूत्र तंत्र", ml: "മൂത്രവ്യവസ്ഥ" },
};

function departmentLabel(dept, lang) {
  return DEPARTMENT_LABELS[dept.icon_key]?.[lang] || dept.name;
}

function AyurvedaIcon({ className }) {
  return (
    <svg viewBox="0 0 512 512" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M22 118c-8 8-8 20 0 28l6 6c8 8 20 8 28 0l84-84c8-8 8-20 0-28l-6-6c-8-8-20-8-28 0z" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M64 76 178 190" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      <path d="M112 142 226 256" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      <path d="M258 222 328 292" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      <path d="M228 20c60-20 130 10 150 70 20 60-10 130-70 150" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M228 20c-20 60 10 130 70 150 20 6 42 8 60 4" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M280 62 328 292" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      <rect x="18" y="218" width="476" height="52" rx="26" stroke="currentColor" strokeWidth="20" />
      <path d="M42 270c0 90 74 168 172 168h84c98 0 172-78 172-168" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      <path d="M436 356c-14 16-32 28-52 36" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
      <path d="M188 330c8-10 22-10 30 0" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <path d="M296 330c8-10 22-10 30 0" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <path d="M232 350c4 10 12 16 24 16s20-6 24-16" stroke="currentColor" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M182 438v14c0 20 16 36 36 36h76c20 0 36-16 36-36v-14" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const AUTO_REDIRECT_SECONDS = 20;

export default function Medikiosk() {
  const [lang, setLang] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  // Step 1: Identification
  const [idMethod, setIdMethod] = useState("abha");
  const [abhaId, setAbhaId] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [isAbhaVerified, setIsAbhaVerified] = useState(false);
  const [patient, setPatient] = useState(null);
  const [pastVisits, setPastVisits] = useState([]);
  const [showPastVisits, setShowPastVisits] = useState(false);

  // Step 2: Department + track
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState(null);
  const [medicineType, setMedicineType] = useState("modern");
  const [consentGiven, setConsentGiven] = useState(false);
  const [visit, setVisit] = useState(null);

  // Step 3: Dynamic questionnaire
  const [nodeId, setNodeId] = useState("RED_FLAG");
  const [resolvedModule, setResolvedModule] = useState(null);
  const [appendFields, setAppendFields] = useState([]);
  const [concernFlag, setConcernFlag] = useState(false);

  // Step 4: Documents
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Step 5: Summary + pass
  const [summary, setSummary] = useState(null);
  const [finalized, setFinalized] = useState(null);
  const [autoRedirectIn, setAutoRedirectIn] = useState(AUTO_REDIRECT_SECONDS);

  const t = UI_TEXT[lang || "en"];

  // Warn before an accidental refresh/close wipes in-progress registration.
  useEffect(() => {
    if (!isStarted || currentStep >= 6) return undefined;
    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isStarted, currentStep]);

  // Kiosk idle timeout: once the pass is issued, auto-return to the language
  // screen after a countdown so the next patient isn't blocked by someone
  // walking away from the terminal.
  useEffect(() => {
    if (currentStep !== 6 || !finalized) return undefined;
    const interval = setInterval(() => {
      setAutoRedirectIn((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resetAll();
          return AUTO_REDIRECT_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep, finalized]);

  function resetAll() {
    setLang(null);
    setIsStarted(false);
    setCurrentStep(1);
    setError("");
    setIdMethod("abha");
    setAbhaId("");
    setName("");
    setDob("");
    setPhone("");
    setGender("male");
    setIsAbhaVerified(false);
    setPatient(null);
    setPastVisits([]);
    setShowPastVisits(false);
    setDepartmentId(null);
    setMedicineType("modern");
    setConsentGiven(false);
    setVisit(null);
    setNodeId("RED_FLAG");
    setResolvedModule(null);
    setAppendFields([]);
    setConcernFlag(false);
    setUploadedDocs([]);
    setSummary(null);
    setFinalized(null);
  }

  async function handleSelectLanguage(selectedLang) {
    setLang(selectedLang);
    setIsStarted(true);
    try {
      const depts = await patientApi.departments();
      setDepartments(depts);
    } catch {
      // Department list is only needed at step 2 - a transient failure here isn't fatal yet.
    }
  }

  // Ayurveda patients skip manual department selection - they always go to
  // the AYUSH queue, since the body-part departments (Cardiology, ENT, etc.)
  // don't apply to an Ayurveda consultation.
  const ayurvedaDept = departments.find((d) => d.name.trim().toLowerCase() === "ayurveda") || null;

  function handleSelectTrack(type) {
    setMedicineType(type);
    if (type === "ayush") {
      setDepartmentId(ayurvedaDept ? ayurvedaDept.id : null);
    } else if (departmentId && ayurvedaDept && departmentId === ayurvedaDept.id) {
      setDepartmentId(null);
    }
  }

  // ---- Step 1: ABHA demo-fetch simulation ----
  function applyAbhaRecord(record) {
    setAbhaId(record.abhaId);
    setName(record.name);
    setDob(record.dob);
    setGender(record.gender);
    setPhone(record.phone);
    setIsAbhaVerified(true);
    setError("");
  }

  function handleAbhaIdChange(value) {
    setAbhaId(value);
    // Typing a fresh id invalidates whatever was previously fetched.
    if (isAbhaVerified) {
      setIsAbhaVerified(false);
      setName("");
      setDob("");
      setPhone("");
    }
  }

  function handleVerifyAbha() {
    const match = DEMO_ABHA_RECORDS.find((r) => r.abhaId === abhaId.trim());
    if (match) {
      applyAbhaRecord(match);
      return;
    }
    setError(
      "Live ABHA lookup isn't available in this build - please use one of the demo records below, or switch to Guest Walk-in."
    );
  }

  // ---- Step 1: Identify ----
  async function handleIdentify() {
    setError("");
    if (idMethod === "guest" && (!name.trim() || !dob || !phone.trim())) {
      setError("Please fill in name, date of birth, and phone number.");
      return;
    }
    if (idMethod === "abha" && !abhaId.trim()) {
      setError("Please enter your ABHA ID.");
      return;
    }
    if (idMethod === "abha" && !isAbhaVerified && (!name.trim() || !dob || !phone.trim())) {
      setError("Please fill in name, date of birth, and phone number.");
      return;
    }

    setIsBusy(true);
    try {
      const payload =
        idMethod === "abha"
          ? { abha_id: abhaId.trim(), name, dob: dob || undefined, phone, gender }
          : { name: name.trim(), dob, phone: phone.trim(), gender };
      const result = await patientApi.identify(payload);
      setPatient(result.patient);
      setPastVisits(result.past_visits || []);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  // ---- Step 2: Department + track -> create visit ----
  async function handleCreateVisit() {
    setError("");
    if (!departmentId) {
      setError(
        medicineType === "ayush"
          ? "Ayurveda queue is unavailable right now. Please try again shortly."
          : "Please select a department."
      );
      return;
    }
    if (!consentGiven) {
      setError("Please provide consent to proceed with the clinical intake.");
      return;
    }

    setIsBusy(true);
    try {
      const newVisit = await patientApi.createVisit({
        patient: patient.id,
        department: departmentId,
        medicine_type: medicineType,
        language: lang,
        consent_given: true,
      });
      setVisit(newVisit);
      const state = await patientApi.getIntakeState(newVisit.id);
      setNodeId(state.current_node);
      setResolvedModule(state.resolved_module);
      setAppendFields(state.append_fields || []);
      setConcernFlag(state.concern_flag);
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start your visit. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  // ---- Step 3: Answer submission loop ----
  async function handleAnswerSubmit(answers) {
    setError("");
    setIsBusy(true);
    try {
      const result = await patientApi.submitAnswer(visit.id, nodeId, answers);
      setConcernFlag(result.concern_flag);
      if (result.is_complete) {
        setCurrentStep(4);
      } else {
        setNodeId(result.next_node);
        setResolvedModule(result.resolved_module);
        setAppendFields(result.append_fields || []);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your answer. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleTranscribe(blob, language) {
    const formData = new FormData();
    formData.append("audio", blob, "clip.webm");
    formData.append("language", language || "en");
    const result = await patientApi.transcribeAudio(visit.id, formData);
    return result.text || "";
  }

  // ---- Step 4: Documents ----
  async function handleDocumentUpload(file, documentType) {
    if (!file) return;
    setIsUploadingDoc(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", documentType);
      await patientApi.uploadDocument(visit.id, formData);
      setUploadedDocs((prev) => [...prev, file.name]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Document upload failed. You can skip this step.");
    } finally {
      setIsUploadingDoc(false);
    }
  }

  async function handleProceedToSummary() {
    setIsBusy(true);
    setError("");
    try {
      const result = await patientApi.generateSummary(visit.id);
      setSummary(result.generated_summary);
      setCurrentStep(5);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not generate your summary. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleFinalize() {
    setIsBusy(true);
    setError("");
    try {
      const result = await patientApi.finalizeVisit(visit.id);
      setFinalized(result);
      setAutoRedirectIn(AUTO_REDIRECT_SECONDS);
      setCurrentStep(6);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not finalize your visit. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  function handlePrintPass() {
    if (!finalized) return;
    const departmentDept = departments.find((d) => d.id === departmentId);
    const departmentName = departmentDept ? departmentLabel(departmentDept, lang) : "";
    const trackLabel = medicineType === "modern" ? t.allopathyTrack : t.ayurvedaTrack;
    const dateStr = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const html = `<!DOCTYPE html>
<html lang="${lang || "en"}">
<head>
  <meta charset="UTF-8" />
  <title>OPD_Pass_P-${finalized.token_number}</title>
  <style>
    @page { size: A5 portrait; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
    body { background: #fff; color: #0f172a; padding: 16px; }
    .action-bar { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #cbd5e1; }
    .action-btn { background: #047857; color: white; border: none; padding: 7px 16px; font-size: 12px; font-weight: 700; border-radius: 6px; cursor: pointer; }
    .close-btn { background: white; color: #475569; border: 1px solid #cbd5e1; padding: 7px 14px; font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer; }
    @media print { .action-bar { display: none !important; } body { padding: 0; } }
    .pass-card { border: 2px solid #047857; border-radius: 10px; overflow: hidden; text-align: center; }
    .hospital-header { background: #047857; color: white; padding: 16px 18px; }
    .hospital-name { font-size: 16px; font-weight: 800; letter-spacing: 0.5px; }
    .hospital-sub { font-size: 10.5px; opacity: 0.9; margin-top: 2px; }
    .card-body { padding: 20px 18px; }
    .token-box { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; border: 2px solid #065f46; border-radius: 10px; padding: 12px 32px; margin: 8px 0 16px; }
    .token-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #047857; }
    .token-num { font-size: 30px; font-weight: 900; color: #065f46; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: left; margin-top: 8px; }
    .info-cell { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 6px 10px; }
    .cell-lbl { font-size: 9px; color: #64748b; font-weight: 700; text-transform: uppercase; }
    .cell-val { font-size: 12px; color: #0f172a; font-weight: 700; margin-top: 1px; }
    .footer-note { margin-top: 16px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 10.5px; color: #64748b; }
  </style>
</head>
<body>
  <div class="action-bar">
    <button class="close-btn" onclick="window.close()">Close</button>
    <div style="font-size: 12px; font-weight: 600; color: #334155;">OPD Consultation Pass</div>
    <button class="action-btn" onclick="window.print()">Print</button>
  </div>
  <div class="pass-card">
    <div class="hospital-header">
      <div class="hospital-name">${t.hospitalName}</div>
      <div class="hospital-sub">${t.passIssuedHeader}</div>
    </div>
    <div class="card-body">
      <div class="token-box">
        <span class="token-lbl">${t.tokenLabel}</span>
        <span class="token-num">P-${finalized.token_number}</span>
      </div>
      <div class="info-grid">
        <div class="info-cell"><div class="cell-lbl">${t.fullName}</div><div class="cell-val">${name || patient?.name || "-"}</div></div>
        <div class="info-cell"><div class="cell-lbl">${t.departmentLabel}</div><div class="cell-val">${departmentName}</div></div>
        <div class="info-cell"><div class="cell-lbl">Track</div><div class="cell-val">${trackLabel}</div></div>
        <div class="info-cell"><div class="cell-lbl">Date</div><div class="cell-val">${dateStr}</div></div>
      </div>
      <p class="footer-note">${t.waitMsg}</p>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 350); };</script>
</body>
</html>`;
    const printWindow = window.open("", "_blank", "width=500,height=650");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    }
  }

  return (
    <main className="relative h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/30 to-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Decorative background: soft grid texture + faint emerald rings, purely visual */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: "radial-gradient(circle, #10b98133 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full border-[26px] border-emerald-500/10" />
        <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full border-[32px] border-teal-500/10" />
        <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full border-[22px] border-emerald-500/10" />
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute top-10 left-1/3 h-48 w-48 rounded-full bg-teal-200/20 blur-3xl" />
      </div>

      <header className="relative z-10 shrink-0 border-b border-slate-200 bg-white shadow-2xs">
        <div className="navbar w-full px-4 py-2.5 sm:px-8 sm:py-3 min-h-[68px] sm:min-h-[76px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300/80 shadow-xs">
              <HeartPulse className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-2">
                <p className="text-lg sm:text-xl lg:text-2xl font-black leading-none tracking-[-0.03em] text-slate-950">
                  Medi<span className="text-emerald-700">Kiosk</span>
                </p>
                <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Allopathy &amp; Ayurveda
                </span>
              </div>
              <p className="hidden sm:block mt-1 text-xs font-semibold text-slate-500">{t.kioskSubtitle}</p>
            </div>
          </div>

          {/* Far right: date, plus patient name once identified (language is chosen only on the landing screen) */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Today, {todayLabel}</span>
            <div className="flex items-center gap-2">
              {patient && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" /> {patient.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={`relative z-10 mx-auto flex-1 w-full min-h-0 px-3 py-1.5 sm:px-6 sm:py-2 flex flex-col overflow-hidden ${isStarted ? "max-w-5xl" : "max-w-3xl"}`}>
        {!isStarted ? (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-2 sm:py-4 overflow-y-auto">
            <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-emerald-900/5 text-center flex flex-col items-center justify-center gap-4 sm:gap-5">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full border-[20px] border-emerald-500/10" />
              <div className="pointer-events-none absolute -bottom-20 -left-14 h-48 w-48 rounded-full border-[24px] border-emerald-500/10" />
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-xs">
                <HeartPulse className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                  Patient OPD Registration
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Select your language to begin</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-1">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectLanguage(opt.id)}
                      className="group flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 hover:bg-emerald-700 hover:border-emerald-700 px-4 py-3.5 text-slate-800 hover:text-white transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 group-hover:bg-white/20 group-hover:text-white transition-colors shadow-2xs">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-base font-bold">{opt.label}</span>
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
          <div className="flex-1 min-h-0 flex flex-col items-center w-full">
            <div className="w-full max-h-full min-h-0 flex flex-col gap-2">
              {/* Stepper */}
              <div className="shrink-0 flex items-start justify-center py-0.5">
                {[
                  { step: 1, label: t.step1 },
                  { step: 2, label: t.step2 },
                  { step: 3, label: t.step3 },
                  { step: 4, label: t.step4 },
                  { step: 5, label: t.step5 },
                ].map((s, idx, arr) => {
                  const cleanLabel = s.label.replace(/^\d+\.\s*/, "");
                  const isActive = currentStep === s.step || (s.step === 5 && currentStep === 6);
                  const isCompleted = currentStep > s.step;
                  return (
                    <div key={s.step} className="flex items-start">
                      <div className="flex flex-col items-center gap-1.5 w-16 sm:w-24">
                        <div
                          className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-black border-2 transition-colors ${
                            isActive
                              ? "bg-emerald-700 border-emerald-700 text-white shadow-sm"
                              : isCompleted
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "bg-white border-slate-300 text-slate-400"
                          }`}
                        >
                          {isCompleted ? "✓" : s.step}
                        </div>
                        <span
                          className={`text-center text-[10px] sm:text-xs font-semibold leading-tight ${
                            isActive ? "text-emerald-800" : isCompleted ? "text-emerald-700" : "text-slate-400"
                          }`}
                        >
                          {cleanLabel}
                        </span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div className={`mt-4 sm:mt-[18px] h-0.5 w-4 sm:w-8 rounded-full ${isCompleted ? "bg-emerald-400" : "bg-slate-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {concernFlag && (
                <div className="shrink-0 rounded-xl border border-rose-400 bg-rose-600 p-3 text-white shadow-xs">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> {t.redFlagBannerTitle}
                  </p>
                  <p className="text-xs mt-0.5 opacity-95">{t.redFlagBannerBody}</p>
                </div>
              )}

              <div className="min-h-0 max-h-full overflow-y-auto rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 shadow-lg shadow-slate-900/5 border border-slate-100 flex flex-col relative before:absolute before:inset-x-0 before:top-0 before:h-1.5 before:rounded-t-2xl sm:before:rounded-t-3xl before:bg-gradient-to-r before:from-emerald-500 before:to-teal-500">
                {error && (
                  <div className="mb-3 rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs sm:text-sm font-bold text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* STEP 1: IDENTIFICATION */}
                {currentStep === 1 && (
                  <div className="w-full space-y-2.5">
                    <div className="text-center">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.identHeader}</h2>
                    </div>

                    <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setIdMethod("abha")}
                        className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
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
                          setName("");
                          setDob("");
                          setPhone("");
                        }}
                        className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                          idMethod === "guest" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {t.guestTab}
                      </button>
                    </div>

                    {idMethod === "abha" ? (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.abhaLabel}</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={abhaId}
                              onChange={(e) => handleAbhaIdChange(e.target.value)}
                              placeholder={t.abhaPlaceholder}
                              className="input h-10 sm:h-11 flex-1 bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyAbha}
                              className="shrink-0 rounded-xl bg-emerald-700 px-4 text-xs sm:text-sm font-bold text-white hover:bg-emerald-800 transition-colors"
                            >
                              {t.fetchAbhaBtn}
                            </button>
                          </div>
                        </div>

                        <div className="min-h-[26px] flex items-center">
                          {isAbhaVerified ? (
                            <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5" /> {t.abhaVerified}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400">{t.abhaFirstVisit}</p>
                          )}
                        </div>

                        {!isAbhaVerified && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-400">{t.abhaDemoLabel}</span>
                            {DEMO_ABHA_RECORDS.map((r) => (
                              <button
                                key={r.abhaId}
                                type="button"
                                onClick={() => applyAbhaRecord(r)}
                                className="rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors"
                              >
                                {r.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                        <p className="text-xs text-amber-900 font-medium">{t.guestWarning}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.fullName} *</label>
                        <input
                          type="text"
                          value={name}
                          disabled={idMethod === "abha" && isAbhaVerified}
                          onChange={(e) => setName(e.target.value)}
                          className="input h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.dob} *</label>
                        <input
                          type="date"
                          value={dob}
                          disabled={idMethod === "abha" && isAbhaVerified}
                          max={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setDob(e.target.value)}
                          className="input h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.gender} *</label>
                        <select
                          value={gender}
                          disabled={idMethod === "abha" && isAbhaVerified}
                          onChange={(e) => setGender(e.target.value)}
                          className="select h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          <option value="male">{t.genderMale}</option>
                          <option value="female">{t.genderFemale}</option>
                          <option value="other">{t.genderOther}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">{t.phone} *</label>
                        <input
                          type="text"
                          value={phone}
                          disabled={idMethod === "abha" && isAbhaVerified}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="input h-10 sm:h-11 w-full bg-slate-50 border-slate-300 text-xs sm:text-sm rounded-xl px-3.5 focus:bg-white focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                      {idMethod === "abha" && isAbhaVerified && (
                        <p className="sm:col-span-2 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Lock className="h-3 w-3" /> {t.abhaLockedNote}
                        </p>
                      )}
                    </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsStarted(false)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4" /> {t.backBtn}
                      </button>
                      <button
                        type="button"
                        onClick={handleIdentify}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors disabled:opacity-60"
                      >
                        <span>
                          <BusyLabel busy={isBusy} messages={t.busyIdentify} idleLabel={t.continueBtn} />
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: DEPARTMENT + TRACK */}
                {currentStep === 2 && (
                  <div className="w-full space-y-4">
                    <div className="text-center pb-0.5">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.step2Header}</h2>
                    </div>

                    <div className="space-y-4">
                    {pastVisits.length > 0 && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                        <button
                          type="button"
                          onClick={() => setShowPastVisits((v) => !v)}
                          className="w-full flex items-center justify-between text-xs font-bold text-emerald-800"
                        >
                          <span className="flex items-center gap-1.5">
                            <History className="h-3.5 w-3.5" /> {t.pastVisitsHeader} ({pastVisits.length})
                          </span>
                          <span className="text-[11px] font-semibold underline">
                            {showPastVisits ? t.hidePastVisitsBtn : t.viewPastVisitsBtn}
                          </span>
                        </button>
                        {showPastVisits && (
                          <ul className="mt-2 space-y-1 border-t border-emerald-200 pt-2">
                            {pastVisits.map((v) => (
                              <li key={v.id} className="text-xs text-slate-700 flex items-center justify-between gap-2">
                                <span>{v.visit_date}</span>
                                <span className="text-slate-500 capitalize">{v.status.replace(/_/g, " ")}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div
                        onClick={() => handleSelectTrack("modern")}
                        className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex items-start gap-3.5 shadow-xs ${
                          medicineType === "modern"
                            ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className={`p-3 rounded-xl shrink-0 ${medicineType === "modern" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>
                          <Stethoscope className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{t.allopathyTrack}</h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">{t.allopathyDesc}</p>
                        </div>
                      </div>
                      <div
                        onClick={() => handleSelectTrack("ayush")}
                        className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex items-start gap-3.5 shadow-xs ${
                          medicineType === "ayush"
                            ? "border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className={`p-3 rounded-xl shrink-0 ${medicineType === "ayush" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                          <AyurvedaIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{t.ayurvedaTrack}</h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1">{t.ayurvedaDesc}</p>
                        </div>
                      </div>
                    </div>

                    {medicineType === "modern" ? (
                      <div>
                        <label className="text-xs sm:text-sm font-bold text-slate-800 block mb-1.5">{t.departmentLabel}</label>
                        <div className="flex flex-wrap gap-2">
                          {departments
                            .filter((d) => !ayurvedaDept || d.id !== ayurvedaDept.id)
                            .map((d) => {
                              const DeptIcon = DEPARTMENT_ICONS[d.icon_key] || DEFAULT_DEPARTMENT_ICON;
                              return (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => setDepartmentId(d.id)}
                                  className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                                    departmentId === d.id
                                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
                                  }`}
                                >
                                  <DeptIcon className="h-4 w-4 shrink-0" />
                                  {departmentLabel(d, lang)}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs sm:text-sm font-semibold text-amber-800">
                        {t.ayurvedaRoutedNote}
                      </div>
                    )}

                    <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="checkbox checkbox-sm mt-0.5"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">{t.consentLabel}</span>
                    </label>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4" /> {t.backBtn}
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateVisit}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-60"
                      >
                        <span>
                          <BusyLabel busy={isBusy} messages={t.busyCreateVisit} idleLabel={t.beginIntakeBtn} />
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DYNAMIC QUESTIONNAIRE */}
                {currentStep === 3 && (
                  <QuestionnaireStep
                    key={nodeId}
                    nodeId={nodeId}
                    resolvedModule={resolvedModule}
                    appendFields={appendFields}
                    lang={lang}
                    onSubmit={handleAnswerSubmit}
                    onTranscribe={handleTranscribe}
                    isSubmitting={isBusy}
                  />
                )}

                {/* STEP 4: DOCUMENT UPLOAD */}
                {currentStep === 4 && (
                  <div className="w-full space-y-4">
                    <div className="text-center pb-0.5">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.docsHeader}</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.docsSub}</p>
                    </div>

                    <label
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 transition-colors ${
                        isUploadingDoc
                          ? "border-emerald-400 bg-emerald-50/40 cursor-wait"
                          : "border-slate-300 bg-slate-50/70 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40"
                      }`}
                    >
                      {isUploadingDoc ? (
                        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                      ) : (
                        <Upload className="h-8 w-8 text-slate-400" />
                      )}
                      <span className="text-xs sm:text-sm font-semibold text-slate-600">
                        {isUploadingDoc ? t.docsReadingDoc : t.docsUploadPrompt}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingDoc}
                        onChange={(e) => handleDocumentUpload(e.target.files?.[0], "prescription")}
                      />
                    </label>

                    {uploadedDocs.length > 0 && (
                      <ul className="space-y-1.5">
                        {uploadedDocs.map((docName, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                            <FileText className="h-3.5 w-3.5" /> {docName}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span />
                      <button
                        type="button"
                        onClick={handleProceedToSummary}
                        disabled={isBusy || isUploadingDoc}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-60"
                      >
                        <span>
                          <BusyLabel busy={isBusy} messages={t.busySummary} idleLabel={t.docsCompleteBtn} />
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW SUMMARY */}
                {currentStep === 5 && summary && (
                  <div className="w-full space-y-4">
                    <div className="text-center pb-0.5">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.reviewHeader}</h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.reviewSub}</p>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(summary).map(([key, text]) => (
                        <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                            {key.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-800 mt-1 leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={handleFinalize}
                        disabled={isBusy}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          <BusyLabel busy={isBusy} messages={t.busyFinalize} idleLabel={t.confirmPassBtn} />
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 6: PASS ISSUED */}
                {currentStep === 6 && finalized && (
                  <div className="w-full text-center space-y-4 py-4">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                    <h2 className="text-2xl font-black text-slate-900">{t.passIssuedHeader}</h2>
                    <div className="inline-flex flex-col items-center gap-1 rounded-2xl border-2 border-emerald-600 bg-emerald-50 px-8 py-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{t.tokenLabel}</span>
                      <span className="text-3xl font-black text-emerald-800">P-{finalized.token_number}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500">{t.waitMsg}</p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={resetAll}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Home className="h-4 w-4" />
                        {t.newPatientBtn}
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintPass}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-2.5 text-xs sm:text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        <Printer className="h-4 w-4" />
                        {t.printPassBtn}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {t.autoRedirectMsg.replace("{seconds}", autoRedirectIn)}
                    </p>
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
