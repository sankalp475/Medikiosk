import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getDashboardPath, saveUserSession } from "../../auth/auth";

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

    // Replace this demo session with the backend JWT response.
    saveUserSession({
      access: "demo-access-token",
      refresh: "demo-refresh-token",
      role,
      email: email.trim(),
    });

    const destination = location.state?.from || getDashboardPath(role);
    navigate(destination, { replace: true });
  }

  return (
    <main className="min-h-screen bg-base-200 px-4 py-12">
      <section className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-2xl font-extrabold tracking-tight text-primary">MediKiosk</p>
          <p className="mt-2 text-sm text-base-content/60">Secure staff access</p>
        </div>

        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <form className="card-body gap-5" onSubmit={handleSubmit}>
            <div>
              <h1 className="text-2xl font-bold">Sign in</h1>
              <p className="mt-1 text-sm text-base-content/60">Use your Admin or Doctor account.</p>
            </div>

            <label className="form-control">
              <span className="label-text mb-2 font-medium">Role</span>
              <select className="select select-bordered" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label className="form-control">
              <span className="label-text mb-2 font-medium">Email</span>
              <input className="input input-bordered" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" required />
            </label>

            <label className="form-control">
              <span className="label-text mb-2 font-medium">Password</span>
              <input className="input input-bordered" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            </label>

            {error && <p className="text-sm text-error" role="alert">{error}</p>}

            <button className="btn btn-primary mt-2" type="submit">Sign in</button>
          </form>
        </div>
      </section>
    </main>
  );
}
