// Thin fetch wrapper around the MediKiosk Django REST API.
// Base URL is configurable via VITE_API_BASE_URL (see .env), defaulting to
// the local dev server.

import { getStoredUser, clearUserSession } from "../auth/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = "GET", body, isFormData = false, auth = false } = {}) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";

  if (auth) {
    const user = getStoredUser();
    if (user?.token) headers["Authorization"] = `Token ${user.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth) {
    // Token invalid/expired - clear the stale session so ProtectedRoute redirects to login.
    clearUserSession();
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = (data && (data.detail || JSON.stringify(data))) || `Request failed: ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data;
}

// ---- Auth ----
export const authApi = {
  login: (email, password) => request("/auth/login/", { method: "POST", body: { email, password } }),
  logout: () => request("/auth/logout/", { method: "POST", auth: true }),
};

// ---- Patient / kiosk flow ----
export const patientApi = {
  departments: () => request("/patient/departments/"),
  identify: (payload) => request("/patient/identify/", { method: "POST", body: payload }),
  createVisit: (payload) => request("/patient/visits/", { method: "POST", body: payload }),
  getIntakeState: (visitId) => request(`/patient/visits/${visitId}/state/`),
  submitAnswer: (visitId, nodeId, answers) =>
    request(`/patient/visits/${visitId}/answer/`, { method: "POST", body: { node_id: nodeId, answers } }),
  transcribeAudio: (visitId, formData) =>
    request(`/patient/visits/${visitId}/transcribe/`, { method: "POST", body: formData, isFormData: true }),
  synthesizePrompt: (text, language) =>
    request("/patient/prompts/speak/", { method: "POST", body: { text, language } }),
  uploadDocument: (visitId, formData) =>
    request(`/patient/visits/${visitId}/documents/`, { method: "POST", body: formData, isFormData: true }),
  generateSummary: (visitId) => request(`/patient/visits/${visitId}/generate-summary/`, { method: "POST" }),
  getVisitSummary: (visitId) => request(`/patient/visits/${visitId}/summary/`),
  finalizeVisit: (visitId) => request(`/patient/visits/${visitId}/finalize/`, { method: "POST" }),
};

// ---- Doctor console ----
export const doctorApi = {
  me: () => request("/doctor/me/", { auth: true }),
  queue: () => request("/doctor/queue/", { auth: true }),
  visitDetail: (visitId) => request(`/doctor/visits/${visitId}/`, { auth: true }),
  updateVisit: (visitId, payload) =>
    request(`/doctor/visits/${visitId}/`, { method: "PATCH", body: payload, auth: true }),
  callPatient: (visitId) => request(`/doctor/visits/${visitId}/call/`, { method: "POST", auth: true }),
  markConsulted: (visitId, payload) =>
    request(`/doctor/visits/${visitId}/consult/`, { method: "POST", body: payload, auth: true }),
};

// ---- Admin console ----
export const adminApi = {
  dashboard: (departmentId) =>
    request(`/admin-api/dashboard/${departmentId ? `?department_id=${departmentId}` : ""}`, { auth: true }),
  stats: () => request("/admin-api/stats/", { auth: true }),
  departments: () => request("/admin-api/departments/", { auth: true }),
  createDepartment: (payload) =>
    request("/admin-api/departments/", { method: "POST", body: payload, auth: true }),
  updateDepartment: (id, payload) =>
    request(`/admin-api/departments/${id}/`, { method: "PATCH", body: payload, auth: true }),
  deleteDepartment: (id) => request(`/admin-api/departments/${id}/`, { method: "DELETE", auth: true }),
  doctors: () => request("/admin-api/doctors/", { auth: true }),
  createDoctor: (payload) => request("/admin-api/doctors/", { method: "POST", body: payload, auth: true }),
  updateDoctor: (id, payload) =>
    request(`/admin-api/doctors/${id}/`, { method: "PATCH", body: payload, auth: true }),
  deleteDoctor: (id) => request(`/admin-api/doctors/${id}/`, { method: "DELETE", auth: true }),
};
