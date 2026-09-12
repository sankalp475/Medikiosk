import { clearUserSession } from "../../auth/auth";

export default function DoctorDashboard() {
  function signOut() {
    clearUserSession();
    window.location.assign("/login");
  }

  return (
    <main className="min-h-screen bg-emerald-50/40 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="navbar mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex-1">
            <p className="text-xl font-bold text-slate-950">Medi<span className="text-emerald-700">kiosk</span></p>
            <p className="text-xs text-slate-500">Doctor workspace</p>
          </div>
          <button className="btn btn-sm btn-ghost text-slate-600 hover:bg-emerald-50 hover:text-emerald-700" type="button" onClick={signOut}>Sign out</button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">Today&apos;s patient queue</h1>
        <p className="mt-2 text-slate-500">Your queue and patient summaries will appear here.</p>
      </div>
    </main>
  );
}
