const USER_STORAGE_KEY = "medikiosk_user";

export function getStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
    return user?.access && user?.role ? user : null;
  } catch {
    return null;
  }
}

export function saveUserSession(session) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session));
}

export function clearUserSession() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function getDashboardPath(role) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "doctor") return "/dashboard/doctor";
  return "/";
}
