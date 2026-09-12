import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getDashboardPath, saveUserSession } from "../../auth/auth";

function HeartMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    saveUserSession({ access: "demo-access-token", refresh: "demo-refresh-token", role, email: email.trim() });
    navigate(location.state?.from || getDashboardPath(role), { replace: true });
  }

  return (
    <main className="min-h-screen bg-emerald-950 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl shadow-emerald-950/30 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden overflow-hidden bg-emerald-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[32px] border-emerald-700/60" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border-[36px] border-emerald-700/50" />
            <div className="relative flex items-center gap-3">
              <HeartMark />
              <div>
                <p className="text-xl font-extrabold tracking-tight">MediKiosk</p>
                <p className="text-sm text-emerald-100">Clinic operations, made clear</p>
              </div>
            </div>
            <div className="relative max-w-md">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Staff workspace</p>
              <h1 className="text-4xl font-bold leading-tight">Keep every patient moving toward care.</h1>
              <p className="mt-5 text-base leading-7 text-emerald-100">Manage queues, teams, and clinical handoffs from one calm workspace.</p>
            </div>
            <p className="relative text-xs text-emerald-200">Secure access for authorized staff only</p>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mb-8 lg:hidden"><HeartMark /></div>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Welcome back</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Sign in to continue</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Use your staff account to open the right workspace.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Workspace</span>
                <select className="select select-bordered w-full border-slate-300 bg-white focus:border-emerald-600 focus:outline-emerald-600" value={role} onChange={(event) => setRole(event.target.value)}>
                  <option value="doctor">Doctor workspace</option>
                  <option value="admin">Admin workspace</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Work email</span>
                <input className="input input-bordered w-full border-slate-300 bg-white focus:border-emerald-600 focus:outline-emerald-600" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="you@clinic.org" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                <input className="input input-bordered w-full border-slate-300 bg-white focus:border-emerald-600 focus:outline-emerald-600" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" required />
              </label>
              {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}
              <button className="btn h-12 w-full border-0 bg-emerald-700 text-white hover:bg-emerald-800" type="submit">Sign in securely</button>
            </form>
            <p className="mt-8 text-center text-xs leading-5 text-slate-400">Your session is protected and role-restricted.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
