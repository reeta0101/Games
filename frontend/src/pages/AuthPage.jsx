import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";

const USERS_KEY = "games-auth-users";

const loadUsers = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedUsers = window.localStorage.getItem(USERS_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export default function AuthPage({ mode = "login" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const users = loadUsers();
      const email = formData.email.trim().toLowerCase();
      const password = formData.password.trim();

      if (!email || !password) {
        setError("Email and password are required.");
        return;
      }

      if (isSignup) {
        const name = formData.name.trim();

        if (!name) {
          setError("Please enter your name.");
          return;
        }

        if (password.length < 6) {
          setError("Use at least 6 characters for your password.");
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        if (users.some((user) => user.email === email)) {
          setError("An account with this email already exists.");
          return;
        }

        const newUser = {
          name,
          email,
          password,
        };

        const nextUsers = [...users, newUser];
        saveUsers(nextUsers);
        dispatch(loginSuccess({ name, email }));
        navigate("/");
        return;
      }

      const matchedUser = users.find(
        (user) => user.email === email && user.password === password,
      );

      if (!matchedUser) {
        setError("Incorrect email or password.");
        return;
      }

      dispatch(
        loginSuccess({ name: matchedUser.name, email: matchedUser.email }),
      );
      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#08111f] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.24),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.22),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(3,7,18,0.98))]" />
      <div className="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-[-6rem] right-[-6rem] h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1.08fr_0.92fr]">
        <section className="flex flex-col justify-between px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.8)]" />
            Secure account setup
          </div>

          <div className="max-w-xl py-14 lg:py-0">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300/90">
              Games portal
            </p>
            <h1 className="max-w-lg text-5xl font-black leading-tight text-white sm:text-6xl">
              {isSignup
                ? "Create your player account."
                : "Welcome back to the arena."}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
              {isSignup
                ? "Set up a profile, keep your progress local, and jump into the app in a few seconds."
                : "Sign in with the account you created here and continue straight to the home dashboard."}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Fast setup", value: "30 sec" },
                { label: "Saved locally", value: "Yes" },
                { label: "Works offline", value: "Demo mode" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur"
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
            <span>Built for the Games workspace</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </section>

        <section className="flex items-center px-6 pb-10 sm:px-10 lg:px-12 lg:py-12">
          <div className="w-full rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  {isSignup ? "Get started" : "Sign in"}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white">
                  {isSignup ? "Create account" : "Login to continue"}
                </h2>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-right text-xs text-cyan-100">
                Demo auth
                <div className="mt-1 font-semibold text-cyan-300">
                  Local storage
                </div>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Full name
                  </span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/8"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/8"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/8"
                />
              </label>

              {isSignup && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/8"
                  />
                </label>
              )}

              {!isSignup && (
                <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-transparent text-cyan-500 focus:ring-cyan-400"
                    />
                    Remember me
                  </label>
                  <span className="cursor-not-allowed text-slate-500">
                    Forgot password?
                  </span>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 px-4 py-3.5 text-base font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isSignup
                    ? "Create my account"
                    : "Login now"}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              {isSignup ? "Already have an account?" : "Need a new account?"}{" "}
              <Link
                to={isSignup ? "/login" : "/signup"}
                className="font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                {isSignup ? "Login here" : "Create one now"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
