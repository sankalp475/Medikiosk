import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { HeartPulse, Stethoscope, ShieldCheck, User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { getDashboardPath, saveUserSession } from "../../auth/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter both email and password to continue.");
      return;
    }

    saveUserSession({
      access: "demo-access-token",
      refresh: "demo-refresh-token",
      role,
      email: email.trim(),
    });
    navigate(location.state?.from || getDashboardPath(role), { replace: true });
  }

  function handleDemoFill(demoRole, demoEmail, demoPass) {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-8 text-slate-900 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-950/40 grid lg:grid-cols-[1fr_1.1fr]">
        {/* Left Branding Showcase */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[28px] border-emerald-600/20" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[32px] border-emerald-600/20" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-white/20">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight text-white">
                  Medi<span className="text-emerald-300">Kiosk</span>
                </p>
                <p className="text-xs font-medium text-emerald-200">Aayush Integrated Super-Specialty Hospital</p>
              </div>
            </div>

            <div className="mt-12">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-700/50 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                Next-Gen Hospital Intake
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Smart Healthcare Dispatch &amp; Intake.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-emerald-100/90">
                Seamless digital triage and consultations for Patients, Doctors, and Hospital Administrators under one unified platform.
              </p>
            </div>
          </div>

          <div className="relative space-y-3 pt-8 border-t border-emerald-700/50">
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-700/60 text-emerald-300 font-bold">✓</div>
              <span>Live digital queue ticket and patient waiting tracking</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-700/60 text-emerald-300 font-bold">✓</div>
              <span>Multi-department central triage &amp; clinical dispatch</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-700/60 text-emerald-300 font-bold">✓</div>
              <span>Secure role-restricted access with 256-bit encryption</span>
            </div>
          </div>
        </section>

        {/* Right Form Section */}
        <section className="p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Sign in</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {role === "patient" ? "Patient Portal" : role === "doctor" ? "Doctor Workspace" : "Admin Control"}
                </h2>
              </div>
              <div className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <HeartPulse className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              {role === "patient"
                ? "Enter your patient email ID and password to access your queue tickets."
                : role === "doctor"
                ? "Sign in with your staff credentials to manage consultation queues."
                : "Sign in with your administrative account for central triage dispatch."}
            </p>

            {/* Role Switcher Tabs */}
            <div className="mt-6 grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => setRole("patient")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                  role === "patient"
                    ? "bg-white text-emerald-800 shadow-sm shadow-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("doctor")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                  role === "doctor"
                    ? "bg-white text-emerald-800 shadow-sm shadow-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
                  role === "admin"
                    ? "bg-white text-emerald-800 shadow-sm shadow-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Form */}
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {role === "patient" ? "Patient Email ID" : role === "doctor" ? "Doctor Work Email" : "Admin Email ID"}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === "patient"
                        ? "patient@example.com"
                        : role === "doctor"
                        ? "dr.rao@hospital.org"
                        : "admin@hospital.org"
                    }
                    className="input input-bordered w-full pl-9 pr-3 text-sm bg-white border-slate-300 focus:border-emerald-600 focus:outline-emerald-600"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-medium text-emerald-700 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input input-bordered w-full pl-9 pr-10 text-sm bg-white border-slate-300 focus:border-emerald-600 focus:outline-emerald-600"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-700/20"
              >
                <span>Sign in as {role === "patient" ? "Patient" : role === "doctor" ? "Doctor" : "Admin"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Quick Demo Fill Pills */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 text-center mb-2.5">
              Quick One-Click Demo Logins
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleDemoFill("patient", "patient@medikiosk.in", "patient123")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <User className="h-3 w-3 text-emerald-600" /> Patient Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("doctor", "dr.ananya@hospital.org", "doctor123")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Stethoscope className="h-3 w-3 text-emerald-600" /> Doctor Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("admin", "admin@hospital.org", "admin123")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> Admin Demo
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
