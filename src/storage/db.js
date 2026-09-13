// Local storage based persistence for MediKiosk

const DOCTORS_STORAGE_KEY = "medikiosk_doctors";
const QUEUES_STORAGE_KEY = "medikiosk_queues";
const ACCOUNTS_STORAGE_KEY = "medikiosk_accounts";

export const defaultDoctors = [
  { id: 1, name: "Dr. Ananya Rao", department: "General Medicine", email: "dr.ananya@hospital.org", status: "Available" },
  { id: 2, name: "Dr. Vikram Shah", department: "Cardiology", email: "dr.vikram@hospital.org", status: "In consultation" },
  { id: 3, name: "Dr. Meera Nair", department: "Pediatrics", email: "dr.meera@hospital.org", status: "Available" },
  { id: 4, name: "Dr. Rajesh Kulkarni", department: "Orthopedics", email: "dr.rajesh@hospital.org", status: "Available" },
  { id: 5, name: "Dr. Sanjay Verma", department: "Neurology", email: "dr.sanjay@hospital.org", status: "Available" },
  { id: 6, name: "Dr. Priya Sundaram", department: "Dermatology", email: "dr.priya@hospital.org", status: "Available" },
  { id: 7, name: "Dr. Arvind Menon", department: "Oncology", email: "dr.arvind@hospital.org", status: "In consultation" },
  { id: 8, name: "Dr. Kavita Deshmukh", department: "ENT", email: "dr.kavita@hospital.org", status: "Available" },
  { id: 9, name: "Dr. Rohan Joshi", department: "Ophthalmology", email: "dr.rohan@hospital.org", status: "Available" },
  { id: 10, name: "Dr. Sunita Patil", department: "Gynecology", email: "dr.sunita@hospital.org", status: "Available" },
  { id: 11, name: "Dr. Farhan Akhtar", department: "Pulmonology", email: "dr.farhan@hospital.org", status: "In consultation" },
  { id: 12, name: "Dr. Deepa Iyer", department: "Gastroenterology", email: "dr.deepa@hospital.org", status: "Available" },
  { id: 13, name: "Dr. Amit Trivedi", department: "Nephrology", email: "dr.amit@hospital.org", status: "Available" },
  { id: 14, name: "Dr. Shalini Sen", department: "Endocrinology", email: "dr.shalini@hospital.org", status: "Available" },
  { id: 15, name: "Dr. Kabir Singhania", department: "Emergency & Trauma", email: "dr.kabir@hospital.org", status: "Available" },
];

export const defaultQueues = [
  { department: "General Medicine", patients: 18, next: "P-1042", wait: "12 min", color: "bg-emerald-600" },
  { department: "Cardiology", patients: 7, next: "P-1028", wait: "24 min", color: "bg-sky-600" },
  { department: "Pediatrics", patients: 11, next: "P-1037", wait: "18 min", color: "bg-amber-500" },
  { department: "Orthopedics", patients: 5, next: "P-1019", wait: "9 min", color: "bg-violet-600" },
  { department: "Neurology", patients: 9, next: "P-1055", wait: "30 min", color: "bg-purple-600" },
  { department: "Dermatology", patients: 14, next: "P-1061", wait: "15 min", color: "bg-pink-600" },
  { department: "Oncology", patients: 6, next: "P-1070", wait: "35 min", color: "bg-rose-600" },
  { department: "ENT", patients: 12, next: "P-1082", wait: "14 min", color: "bg-teal-600" },
  { department: "Ophthalmology", patients: 8, next: "P-1093", wait: "20 min", color: "bg-cyan-600" },
  { department: "Gynecology", patients: 15, next: "P-1104", wait: "22 min", color: "bg-fuchsia-600" },
  { department: "Pulmonology", patients: 10, next: "P-1115", wait: "16 min", color: "bg-indigo-600" },
  { department: "Gastroenterology", patients: 8, next: "P-1126", wait: "25 min", color: "bg-orange-500" },
  { department: "Nephrology", patients: 4, next: "P-1137", wait: "28 min", color: "bg-blue-600" },
  { department: "Endocrinology", patients: 9, next: "P-1148", wait: "19 min", color: "bg-yellow-600" },
  { department: "Emergency & Trauma", patients: 22, next: "P-1159", wait: "5 min", color: "bg-red-600" },
];

export const defaultAccounts = [
  { email: "admin@hospital.org", password: "admin123", role: "admin", name: "Hospital Admin" },
  { email: "dr.ananya@hospital.org", password: "doctor123", role: "doctor", name: "Dr. Ananya Rao", department: "General Medicine" },
  { email: "dr.vikram@hospital.org", password: "doctor123", role: "doctor", name: "Dr. Vikram Shah", department: "Cardiology" },
  { email: "dr.meera@hospital.org", password: "doctor123", role: "doctor", name: "Dr. Meera Nair", department: "Pediatrics" },
  { email: "dr.rajesh@hospital.org", password: "doctor123", role: "doctor", name: "Dr. Rajesh Kulkarni", department: "Orthopedics" },
  { email: "patient@medikiosk.in", password: "patient123", role: "patient", name: "Rahul Sharma" },
];

export function getStoredDoctors() {
  try {
    const raw = localStorage.getItem(DOCTORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(defaultDoctors));
      return defaultDoctors;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length < defaultDoctors.length) {
      const existingNames = new Set(parsed.map((d) => d.name));
      const missing = defaultDoctors.filter((d) => !existingNames.has(d.name));
      const merged = [...parsed, ...missing];
      localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultDoctors;
  } catch {
    return defaultDoctors;
  }
}

export function saveStoredDoctors(doctors) {
  try {
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
  } catch (err) {
    console.error("Failed to save doctors to localStorage", err);
  }
}

export function getStoredQueues() {
  try {
    const raw = localStorage.getItem(QUEUES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(QUEUES_STORAGE_KEY, JSON.stringify(defaultQueues));
      return defaultQueues;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length < defaultQueues.length) {
      const existingDepts = new Set(parsed.map((q) => q.department));
      const missing = defaultQueues.filter((q) => !existingDepts.has(q.department));
      const merged = [...parsed, ...missing];
      localStorage.setItem(QUEUES_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultQueues;
  } catch {
    return defaultQueues;
  }
}

export function saveStoredQueues(queues) {
  try {
    localStorage.setItem(QUEUES_STORAGE_KEY, JSON.stringify(queues));
  } catch (err) {
    console.error("Failed to save queues to localStorage", err);
  }
}

export function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(defaultAccounts));
      return defaultAccounts;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultAccounts;
  } catch {
    return defaultAccounts;
  }
}

export function saveStoredAccount(newAccount) {
  try {
    const accounts = getStoredAccounts();
    const existingIndex = accounts.findIndex(
      (acc) => acc.email.toLowerCase() === newAccount.email.toLowerCase()
    );
    let updated;
    if (existingIndex >= 0) {
      updated = [...accounts];
      updated[existingIndex] = { ...updated[existingIndex], ...newAccount };
    } else {
      updated = [...accounts, newAccount];
    }
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save account to localStorage", err);
  }
}

export function authenticateAccount(email, password, role) {
  const accounts = getStoredAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  const found = accounts.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  if (found) {
    if (found.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }
    if (found.role && found.role !== role) {
      return {
        success: false,
        error: `This account is registered as a ${found.role}. Please switch to the ${found.role} tab.`,
      };
    }
    return { success: true, user: found };
  }

  // If user doesn't exist yet, register automatically as a new patient or user
  const newAccount = {
    email: normalizedEmail,
    password,
    role,
    name: email.split("@")[0],
  };
  saveStoredAccount(newAccount);
  return { success: true, user: newAccount, isNew: true };
}

// Visits & Clinical Intake Consultation Persistence
const VISITS_STORAGE_KEY = "medikiosk_visits";

export const defaultVisits = [
  {
    id: "V-901",
    token: "P-1042",
    patientName: "Ramesh Patel",
    age: 58,
    sex: "Male",
    phone: "+91 98231 44510",
    abhaId: "91-4231-8890-1244",
    patientUuid: "MED-IN-88921",
    department: "General Medicine",
    track: "Allopathy",
    status: "Waiting", // "Waiting" | "In Consultation" | "Completed"
    waitTime: "8 min ago",
    arrivalTime: "09:15 AM",
    isRedFlag: true,
    redFlagReason: "Acute onset substernal heaviness with exertional dyspnea & SpO2 at 92%. Immediate triage priority.",
    intakeSummary: "58-year-old male presenting with acute 2-hour onset retrosternal chest heaviness radiating to left shoulder, accompanied by diaphoresis and mild shortness of breath upon exertion. Known history of hypertension (6 years, irregular medication). Denies loss of consciousness or fever.",
    vitals: {
      bp: "158/94 mmHg",
      pulse: "98 bpm",
      spo2: "92%",
      temp: "98.6 °F",
      weight: "74 kg",
    },
    symptoms: [
      { name: "Chest heaviness / tightness", severity: "Severe", duration: "2 hours", notes: "Aggravated by movement, constant pressure" },
      { name: "Exertional dyspnea", severity: "Moderate", duration: "2 hours", notes: "Shortness of breath on walking" },
      { name: "Diaphoresis (cold clammy palms)", severity: "Moderate", duration: "1.5 hours", notes: "Profuse perspiration" },
    ],
    allergies: ["Penicillin (mild cutaneous rash)"],
    medications: ["Amlodipine 5mg OD (irregular compliance)", "Aspirin 75mg (self-administered 1 hour ago)"],
    doctorNotes: "",
    provisionalDiagnosis: "",
    prescription: [],
    pathyaAdvice: "",
  },
  {
    id: "V-902",
    token: "P-1037",
    patientName: "Ananya Sharma",
    age: 29,
    sex: "Female",
    phone: "+91 94120 77612",
    abhaId: "24-1189-9022-7711",
    patientUuid: "MED-IN-44219",
    department: "General Medicine",
    track: "Ayurveda",
    status: "In Consultation",
    waitTime: "14 min ago",
    arrivalTime: "09:22 AM",
    isRedFlag: false,
    redFlagReason: "",
    intakeSummary: "29-year-old female presenting with chronic unilateral throbbing headache (Suryavarta / Ardhavabhedaka pattern) recurring 2-3 times per week, aggravated by sun exposure and irregular sleep. Reports Mandagni (sluggish digestion), burning sensation in epigastrium (Amlapitta), and disturbed sleep cycle.",
    vitals: {
      bp: "118/76 mmHg",
      pulse: "72 bpm",
      spo2: "99%",
      temp: "98.4 °F",
      weight: "56 kg",
    },
    ayurvedicProfile: {
      prakriti: "Pitta-Vata",
      vikriti: "Pitta-dominant (Ushna, Tikshna)",
      agni: "Mandagni / Vishamagni",
      koshtha: "Madhyama with Vibandha tendency",
      sleep: "Anidra (irregular, 5 hours)",
    },
    symptoms: [
      { name: "Hemicranial throbbing headache", severity: "Moderate", duration: "3 weeks recurrent", notes: "Visual aura, photophobia, right temple" },
      { name: "Acid reflux & heartburn (Amlapitta)", severity: "Mild", duration: "2 months", notes: "Post-prandial sour belching" },
      { name: "Digestive sluggishness (Ajeerna)", severity: "Mild", duration: "1 month", notes: "Heaviness in abdomen post lunch" },
    ],
    allergies: ["None known"],
    medications: ["Paracetamol 650mg SOS", "Antacid suspension occasionally"],
    doctorNotes: "Pitta-shamak protocol advised. Gentle Shirodhara or Nasya indicated if symptoms persist.",
    provisionalDiagnosis: "Ardhavabhedaka (Migrainous headache) with Amlapitta",
    prescription: [
      { drug: "Shirashooladi Vajra Rasa", dosage: "1 tab (250mg)", frequency: "Twice daily", duration: "15 days", instructions: "With warm milk or honey post meals" },
      { drug: "Avipattikar Churna", dosage: "3 grams", frequency: "At bedtime", duration: "15 days", instructions: "With lukewarm water" },
    ],
    pathyaAdvice: "Pathya: Shadanga Paniya, warm water, Godhuma (wheat), Mudga yusha. Apathya: Ati-katu/amla (excess spicy/sour), dadhi (curd at night), late night awakening.",
  },
  {
    id: "V-903",
    token: "P-1019",
    patientName: "Sunil Kumar",
    age: 44,
    sex: "Male",
    phone: "+91 97188 33201",
    abhaId: "12-8821-4451-9920",
    patientUuid: "MED-IN-19208",
    department: "General Medicine",
    track: "Allopathy",
    status: "Waiting",
    waitTime: "22 min ago",
    arrivalTime: "09:30 AM",
    isRedFlag: false,
    redFlagReason: "",
    intakeSummary: "44-year-old male presenting with acute right knee pain and localized swelling following a twist during badminton yesterday evening. Weight bearing is painful but intact. No skin lacerations or mechanical locking.",
    vitals: {
      bp: "126/82 mmHg",
      pulse: "78 bpm",
      spo2: "98%",
      temp: "98.5 °F",
      weight: "80 kg",
    },
    symptoms: [
      { name: "Right knee pain (anterolateral)", severity: "Moderate", duration: "18 hours", notes: "Pain on flexion > 90 degrees" },
      { name: "Mild suprapatellar effusion", severity: "Mild", duration: "14 hours", notes: "Mild warmth without redness" },
    ],
    allergies: ["None known"],
    medications: ["Ibuprofen 400mg single dose last night"],
    doctorNotes: "",
    provisionalDiagnosis: "",
    prescription: [],
    pathyaAdvice: "",
  },
  {
    id: "V-904",
    token: "P-1055",
    patientName: "Pooja Nair",
    age: 34,
    sex: "Female",
    phone: "+91 99450 11982",
    abhaId: "77-3310-9281-6644",
    patientUuid: "MED-IN-66310",
    department: "General Medicine",
    track: "Allopathy",
    status: "Waiting",
    waitTime: "28 min ago",
    arrivalTime: "09:36 AM",
    isRedFlag: false,
    redFlagReason: "",
    intakeSummary: "34-year-old female presenting with non-productive dry cough and mild nocturnal throat tickle for 5 days. No fever, hemoptysis, or history of asthma. Clear breath sounds reported on self-report questionnaire.",
    vitals: {
      bp: "114/72 mmHg",
      pulse: "74 bpm",
      spo2: "99%",
      temp: "98.6 °F",
      weight: "61 kg",
    },
    symptoms: [
      { name: "Dry hacking cough", severity: "Mild", duration: "5 days", notes: "Worse at night and in air-conditioned room" },
      { name: "Pharyngeal scratchiness", severity: "Mild", duration: "5 days", notes: "No dysphagia" },
    ],
    allergies: ["Sulfa drugs (itching)"],
    medications: ["Warm saline gargles only"],
    doctorNotes: "",
    provisionalDiagnosis: "",
    prescription: [],
    pathyaAdvice: "",
  },
  {
    id: "V-905",
    token: "P-1061",
    patientName: "Vikram Sengupta",
    age: 62,
    sex: "Male",
    phone: "+91 98301 55420",
    abhaId: "55-1200-8841-3329",
    patientUuid: "MED-IN-55102",
    department: "General Medicine",
    track: "Allopathy",
    status: "Completed",
    waitTime: "Completed at 09:40 AM",
    arrivalTime: "09:00 AM",
    isRedFlag: false,
    redFlagReason: "",
    intakeSummary: "62-year-old male routine diabetic follow-up. Fasting blood sugar logs reviewed (average 128 mg/dL). No peripheral neuropathy or visual blurs reported.",
    vitals: {
      bp: "128/80 mmHg",
      pulse: "70 bpm",
      spo2: "98%",
      temp: "98.4 °F",
      weight: "72 kg",
    },
    symptoms: [
      { name: "Routine follow-up / Medication refill", severity: "Mild", duration: "3 months", notes: "Asymptomatic, compliance good" },
    ],
    allergies: ["None known"],
    medications: ["Metformin 500mg BD", "Telmisartan 40mg OD"],
    doctorNotes: "Glycemic control stable. HbA1c scheduled for next quarter. Advised 30 min daily brisk walking.",
    provisionalDiagnosis: "Type 2 Diabetes Mellitus - well controlled on oral hypoglycemics",
    prescription: [
      { drug: "Tab. Metformin 500mg", dosage: "1 tab", frequency: "Twice daily", duration: "90 days", instructions: "With meals" },
      { drug: "Tab. Telmisartan 40mg", dosage: "1 tab", frequency: "Once daily morning", duration: "90 days", instructions: "Before breakfast" },
    ],
    pathyaAdvice: "Maintain low glycemic index diet, avoid refined carbohydrates, continue routine foot inspection.",
  },
];

export function getStoredVisits() {
  try {
    const raw = localStorage.getItem(VISITS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(defaultVisits));
      return defaultVisits;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultVisits;
  } catch {
    return defaultVisits;
  }
}

export function saveStoredVisits(visits) {
  try {
    localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(visits));
  } catch (err) {
    console.error("Failed to save visits to localStorage", err);
  }
}

export function updateVisitStatus(visitId, newStatus) {
  const visits = getStoredVisits();
  const updated = visits.map((v) => (v.id === visitId ? { ...v, status: newStatus } : v));
  saveStoredVisits(updated);
  return updated;
}

export function saveVisitConsultation(visitId, { doctorNotes, provisionalDiagnosis, prescription, pathyaAdvice, status }) {
  const visits = getStoredVisits();
  const updated = visits.map((v) => {
    if (v.id === visitId) {
      return {
        ...v,
        doctorNotes: doctorNotes !== undefined ? doctorNotes : v.doctorNotes,
        provisionalDiagnosis: provisionalDiagnosis !== undefined ? provisionalDiagnosis : v.provisionalDiagnosis,
        prescription: prescription !== undefined ? prescription : v.prescription,
        pathyaAdvice: pathyaAdvice !== undefined ? pathyaAdvice : v.pathyaAdvice,
        status: status || v.status,
      };
    }
    return v;
  });
  saveStoredVisits(updated);
  return updated;
}

export const mockAbhaRecords = [
  {
    abhaId: "14-1234-5678-9012",
    patientName: "Arjun Verma",
    dob: "1984-05-14",
    age: 42,
    sex: "Male",
    phone: "+91 98765 43210",
    patientUuid: "MED-IN-88219",
  },
  {
    abhaId: "91-8765-4321-0987",
    patientName: "Sunita Deshmukh",
    dob: "1988-08-22",
    age: 38,
    sex: "Female",
    phone: "+91 98220 12345",
    patientUuid: "MED-IN-77401",
  },
  {
    abhaId: "23-5566-7788-9900",
    patientName: "Mohammed Farooq",
    dob: "1975-01-10",
    age: 51,
    sex: "Male",
    phone: "+91 97112 34567",
    patientUuid: "MED-IN-55190",
  },
  {
    abhaId: "88-9911-2233-4455",
    patientName: "Deepika Pillai",
    dob: "1999-11-03",
    age: 27,
    sex: "Female",
    phone: "+91 94471 23456",
    patientUuid: "MED-IN-33290",
  },
];

export function lookupAbhaRecord(abhaInput) {
  if (!abhaInput) return null;
  const clean = abhaInput.replace(/[^0-9]/g, "");
  const trimmed = abhaInput.trim().toLowerCase();
  return (
    mockAbhaRecords.find(
      (r) =>
        (clean.length >= 10 && r.abhaId.replace(/[^0-9]/g, "").includes(clean)) ||
        r.patientUuid.toLowerCase() === trimmed ||
        r.patientName.toLowerCase().includes(trimmed)
    ) || null
  );
}

export function registerNewPatientVisit(newVisit) {
  const visits = getStoredVisits();

  // Compute next sequential token
  const tokens = visits
    .map((v) => parseInt(v.token?.replace(/[^0-9]/g, "") || "1000", 10))
    .filter((n) => !isNaN(n));
  const maxToken = tokens.length > 0 ? Math.max(...tokens) : 1042;
  const nextTokenNum = maxToken + 1;
  const nextToken = `P-${nextTokenNum}`;

  const visitId = `V-${Date.now().toString().slice(-4)}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const fullVisit = {
    id: visitId,
    token: nextToken,
    patientName: newVisit.patientName || "Walk-In Patient",
    age: Number(newVisit.age) || 30,
    sex: newVisit.sex || "Other",
    phone: newVisit.phone || "+91 99999 99999",
    abhaId: newVisit.abhaId || "Not Registered",
    patientUuid: newVisit.patientUuid || `MED-IN-${Math.floor(10000 + Math.random() * 90000)}`,
    department: newVisit.track === "Ayurveda" ? "Ayurveda OPD" : "General Medicine",
    track: newVisit.track || "Allopathy",
    status: "Waiting",
    waitTime: "Just arrived",
    arrivalTime: timeStr,
    isRedFlag: Boolean(newVisit.isRedFlag),
    redFlagReason: newVisit.redFlagReason || "",
    intakeSummary: newVisit.intakeSummary || "Patient registered via MediKiosk self-service portal.",
    vitals: newVisit.vitals || {
      bp: "120/80 mmHg",
      pulse: "76 bpm",
      spo2: "98%",
      temp: "98.6 °F",
      weight: "65 kg",
    },
    symptoms: newVisit.symptoms || [],
    ayurvedicProfile: newVisit.ayurvedicProfile || null,
    allergies: newVisit.allergies?.length > 0 ? newVisit.allergies : ["None known"],
    medications: newVisit.medications?.length > 0 ? newVisit.medications : ["None reported"],
    doctorNotes: "",
    provisionalDiagnosis: "",
    prescription: [],
    pathyaAdvice: "",
  };

  const updated = [fullVisit, ...visits];
  saveStoredVisits(updated);
  return fullVisit;
}


