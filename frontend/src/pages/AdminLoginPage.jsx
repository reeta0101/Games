import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "../features/auth/authSlice";


export default function AdminLoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAdmin = useSelector((state) => state.auth.isAdmin);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid admin credentials.");
      } else {
        // Redux expects an object with 'token' or we can just pass the data
        dispatch(adminLogin({ name: data.name, token: data.token }));
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#08111f] text-slate-100">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(234,88,12,0.14),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(3,7,18,0.98))]" />
      <div className="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="absolute bottom-[-6rem] right-[-6rem] h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1.08fr_0.92fr]">
        {/* Left — branding panel */}
        <section className="flex flex-col justify-between px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-amber-400/20 bg-amber-400/8 px-4 py-2 text-sm text-amber-200 backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.8)]" />
            Admin access only
          </div>

          <div className="max-w-xl py-14 lg:py-0">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amber-300/90">
              Control panel
            </p>
            <h1 className="max-w-lg text-5xl font-black leading-tight text-white sm:text-6xl">
              Admin
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                {" "}Dashboard
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              Sign in with your admin credentials to manage users, view statistics, and oversee the entire Study Arcade platform.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Manage", value: "All users" },
                { label: "Monitor", value: "Activity" },
                { label: "Control", value: "Full access" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4 backdrop-blur"
                >
                  <div className="text-sm text-slate-400">{item.label}</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden items-center gap-4 text-sm text-slate-400 lg:flex">
            <span className="h-px flex-1 bg-white/10" />
            <span>Study Arcade — Administration</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </section>

        {/* Right — login form */}
        <section className="flex items-center px-6 pb-10 sm:px-10 lg:px-12 lg:py-12">
          <div className="w-full rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Restricted
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white">
                  Admin Login
                </h2>
              </div>
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-right text-xs text-amber-100">
                🔒 Secure
                <div className="mt-1 font-semibold text-amber-300">
                  Admin only
                </div>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Admin Username
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/60 focus:bg-white/8"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/60 focus:bg-white/8"
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 px-4 py-3.5 text-base font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating…
                  </span>
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              Not an admin?{" "}
              <Link
                to="/"
                className="font-semibold text-amber-300 transition hover:text-amber-200"
              >
                Go back to Study Arcade →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
