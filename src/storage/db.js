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
