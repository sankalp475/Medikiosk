import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { HeartPulse, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { getDashboardPath, saveUserSession } from "../../auth/auth";
import { authApi, ApiError } from "../../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter both email and password to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authApi.login(email.trim(), password);

      saveUserSession({
        token: result.token,
        role: result.role,
        email: result.email,
        name: result.role === "doctor" ? result.doctor_name : result.hospital_name,
        doctorId: result.doctor_id,
        hospitalId: result.hospital_id,
      });
      navigate(location.state?.from || getDashboardPath(result.role), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-8 text-slate-900 sm:px-6 flex items-center justify-center">
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
                Multi-Department Staff Portal
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                One Portal for the Whole Hospital.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-emerald-100/90">
                A single, unified workspace for every clinical and administrative team across Aayush Integrated
                Super-Specialty Hospital.
              </p>
            </div>
          </div>

          <div className="relative space-y-3 pt-8 border-t border-emerald-700/50">
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-700/60 text-emerald-300 font-bold">✓</div>
              <span>Central triage queue dispatch (Admin)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-700/60 text-emerald-300 font-bold">✓</div>
              <span>Live consultation queue management (Doctor)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-700/60 text-emerald-300 font-bold">✓</div>
              <span>Role-restricted security with token-based sessions</span>
            </div>
          </div>
        </section>

        {/* Right Form Section */}
        <section className="p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Clinical Staff Sign in
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Staff Portal
                </h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Sign in with your Admin or Doctor credentials - you'll be taken to the right console automatically.
            </p>

            {/* Form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.org"
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
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-700/20 disabled:opacity-60"
              >
                <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
