import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../features/auth/authSlice";


const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

function getLeaderboardStats() {
  try {
    const lb = JSON.parse(localStorage.getItem("arcade_leaderboard") || "[]");
    const today = new Date().toDateString();
    const todayCount = lb.filter(
      (e) => new Date(e.timestamp).toDateString() === today
    ).length;
    return { totalGames: lb.length, todayGames: todayCount };
  } catch {
    return { totalGames: 0, todayGames: 0 };
  }
}

/* ── Stat Card ── */
function StatCard({ icon, label, value, accent, delay = "0s" }) {
  return (
    <div
      className="animate-fade-in-up rounded-2xl border border-white/10 p-5"
      style={{
        animationDelay: delay,
        background: `linear-gradient(135deg, ${accent}08, ${accent}03)`,
        borderColor: `${accent}25`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border text-lg"
          style={{
            borderColor: `${accent}35`,
            background: `${accent}12`,
          }}
        >
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
            {label}
          </p>
          <p
            className="mt-0.5 text-2xl font-black tabular-nums"
            style={{ color: accent }}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Confirm Delete Modal ── */
function DeleteModal({ user, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="animate-soft-pop mx-4 w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-1 text-center text-4xl">⚠️</div>
        <h3 className="text-center text-xl font-black text-white">
          Delete User
        </h3>
        <p className="mt-3 text-center text-sm leading-6 text-slate-400">
          Are you sure you want to delete{" "}
          <span className="font-bold text-white">{user.name}</span> (
          <span className="text-amber-300">@{user.username}</span>)? This action
          cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  const adminUser = useSelector((state) => state.auth.adminUser);

  const [users, setUsers] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [questionVotes, setQuestionVotes] = useState([]);
  const [votesFilter, setVotesFilter] = useState('all'); // 'all' | 'issues' | 'liked'
  const [votesSearch, setVotesSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ totalUsers: 0, todaySignups: 0, guestPlayers: 0 });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Guard — redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${adminUser?.token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
           dispatch(adminLogout());
           return;
        }
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users from database.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, adminUser]);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/feedback`, {
        headers: {
          'Authorization': `Bearer ${adminUser?.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data.feedback || []);
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    }
  }, [adminUser]);

  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/votes`, {
        headers: { 'Authorization': `Bearer ${adminUser?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestionVotes(data.votes || []);
      }
    } catch (err) {
      console.error('Failed to fetch votes:', err);
    }
  }, [adminUser]);

  const deleteFeedback = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/feedback/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${adminUser?.token}` }
      });
      if (res.ok) {
        setFeedbackList(prev => prev.filter(f => f._id !== id));
        showToast("Feedback deleted");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${adminUser?.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [adminUser]);

  useEffect(() => {
    if (isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUsers();
      fetchFeedback();
      fetchStats();
      fetchVotes();
      
      // Auto-refresh stats every 30 seconds
      const statsInterval = setInterval(() => {
        fetchStats();
      }, 30000);
      
      return () => clearInterval(statsInterval);
    }
  }, [isAdmin, fetchUsers, fetchFeedback, fetchStats, fetchVotes]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setIsChangingPassword(true);

    try {
      const res = await fetch(`${API_BASE}/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser?.token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setPasswordError(data.error || "Failed to change password");
      } else {
        setToast("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Failed to connect to server");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const lbStats = useMemo(() => getLeaderboardStats(), []);

  const todaySignups = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return users.filter((u) => {
      if (!u.createdAt) return false;
      return new Date(u.createdAt) >= todayStart;
    }).length;
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  const handleDelete = (user) => {
    setDeleteTarget(user);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${deleteTarget._id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${adminUser?.token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      showToast(`Deleted user "${deleteTarget.name}"`);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete user. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/login");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Guard rendering
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08111f] text-slate-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.06),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(234,88,12,0.05),_transparent_50%),linear-gradient(180deg,_#080812,_#0a0a0f)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.015)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-amber-400/10 bg-[#07101d]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="group inline-flex min-h-11 items-center gap-2.5 rounded-xl pr-2"
            >
              <span className="flex h-10 items-center rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 text-xs font-black tracking-[0.32em] text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.12)] transition-all duration-300 group-hover:border-amber-400/55 group-hover:shadow-[0_0_28px_rgba(245,158,11,0.22)]">
                ADMIN
              </span>
              <span className="text-sm font-bold tracking-[0.14em] text-white/75 transition group-hover:text-white">
                dashboard
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2.5 rounded-xl border border-amber-400/15 bg-amber-400/8 px-3.5 py-2 text-sm text-slate-100 sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/15 text-xs font-black text-amber-200">
                A
              </span>
              <span className="max-w-32 truncate">
                {adminUser?.name || "Admin"}
              </span>
            </div>

            <Link
              to="/"
              className="touch-target rounded-xl border border-white/8 bg-white/[0.03] px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
            >
              Home
            </Link>

            <button
              onClick={handleLogout}
              className="touch-target rounded-xl border border-rose-300/15 bg-rose-500/8 px-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/14"
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-7xl px-3 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
        {/* Page title */}
        <div className="mb-6 animate-fade-in-up">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400/80">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            User Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            View, search, and manage all registered users. Data is loaded from
            MongoDB.
          </p>
        </div>

        {/* Stats row */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon="👥"
            label="Total Users"
            value={users.length}
            accent="#f59e0b"
            delay="0s"
          />
          <StatCard
            icon="📅"
            label="Today's Signups"
            value={todaySignups}
            accent="#22d3ee"
            delay="0.05s"
          />
          <StatCard
            icon="🎮"
            label="Total Games"
            value={lbStats.totalGames}
            accent="#a78bfa"
            delay="0.1s"
          />
          <StatCard
            icon="👤"
            label="Guest Players"
            value={stats.guestPlayers || 0}
            accent="#10b981"
            delay="0.15s"
          />
          <StatCard
            icon="🔥"
            label="Active Users"
            value={stats.activeUsers || 0}
            accent="#ef4444"
            delay="0.2s"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 animate-fade-in rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            ⚠️ {error}
            <button
              onClick={fetchUsers}
              className="ml-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold transition hover:bg-rose-500/20"
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search + users section */}
        <section
          className="animate-fade-in-up rounded-3xl border border-white/10 p-4 sm:p-5"
          style={{
            animationDelay: "0.08s",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(8,13,24,0.72)",
            boxShadow: "0 24px 80px rgba(2,6,23,0.35)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/80">
                Database users
              </p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                All Users
                <span className="ml-3 inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-sm font-bold text-amber-300">
                  {filteredUsers.length}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:w-auto">
              <label className="block flex-1 sm:w-72">
                <span className="sr-only">Search users</span>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    🔍
                  </span>
                  <input
                    id="admin-search-users"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, username, or email..."
                    className="touch-target w-full rounded-2xl border border-white/10 bg-black/24 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/60 focus:bg-black/30"
                  />
                </div>
              </label>
              <button
                onClick={fetchUsers}
                className="touch-target shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                type="button"
                title="Refresh users"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Users list */}
          <div className="mt-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <svg className="h-8 w-8 animate-spin text-amber-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-3 text-sm text-slate-500">Loading users from database...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="animate-fade-in rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
                <div className="mb-3 text-5xl">
                  {users.length === 0 ? "📭" : "🔎"}
                </div>
                <p className="mb-1 text-lg font-bold text-white">
                  {users.length === 0
                    ? "No users registered yet"
                    : "No users match your search"}
                </p>
                <p className="text-sm text-slate-400">
                  {users.length === 0
                    ? "When users sign up, they'll appear here."
                    : "Try a different search term."}
                </p>
                {users.length === 0 && (
                  <Link
                    to="/signup"
                    className="mt-4 inline-flex items-center rounded-2xl border border-amber-400/25 bg-amber-400/10 px-5 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/18"
                  >
                    Create first user →
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table header */}
                <div className="hidden rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 md:grid md:grid-cols-[2.5rem_1.5fr_1fr_1.5fr_5.5rem_5rem] md:items-center md:gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    #
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Name
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Username
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Email
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Joined
                  </span>
                  <span className="text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Action
                  </span>
                </div>

                {/* User rows */}
                <div className="mt-2 space-y-2">
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user._id || `${user.username}-${index}`}
                      className="animate-fade-in-up rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 transition hover:border-amber-400/20 hover:bg-white/[0.055]"
                      style={{
                        animationDelay: `${Math.min(index * 30, 300)}ms`,
                      }}
                    >
                      {/* Desktop row */}
                      <div className="hidden md:grid md:grid-cols-[2.5rem_1.5fr_1fr_1.5fr_5.5rem_5rem] md:items-center md:gap-4">
                        <span className="text-sm font-bold text-slate-500">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-sm font-black text-amber-300">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="truncate text-sm font-bold text-white">
                            {user.name || "—"}
                          </span>
                        </div>
                        <span className="truncate text-sm text-amber-300/80">
                          @{user.username || "—"}
                        </span>
                        <span className="truncate text-sm text-slate-400">
                          {user.email || "—"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(user.createdAt)}
                        </span>
                        <div className="text-right">
                          <button
                            onClick={() => handleDelete(user)}
                            className="rounded-xl border border-rose-400/20 bg-rose-500/8 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/18"
                            type="button"
                            title={`Delete ${user.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Mobile card */}
                      <div className="md:hidden">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-sm font-black text-amber-300">
                              {user.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">
                                {user.name || "—"}
                              </p>
                              <p className="mt-0.5 text-xs text-amber-300/80">
                                @{user.username || "—"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(user)}
                            className="shrink-0 rounded-xl border border-rose-400/20 bg-rose-500/8 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/18"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2 pl-[52px]">
                          <p className="truncate text-xs text-slate-400">
                            {user.email || "—"}
                          </p>
                          <span className="text-slate-600">·</span>
                          <p className="shrink-0 text-xs text-slate-500">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Feedback Section */}
        <section
          className="mt-6 animate-fade-in-up rounded-3xl border border-white/10 p-4 sm:p-5"
          style={{
            animationDelay: "0.1s",
            background:
              "linear-gradient(135deg, rgba(64,224,240,0.075), rgba(167,139,250,0.025)), rgba(8,13,24,0.72)",
            boxShadow: "0 24px 80px rgba(2,6,23,0.35)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#40e0f0]/80">
                User Insights
              </p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Recent Feedback
                <span className="ml-3 inline-flex items-center rounded-full border border-[#40e0f0]/25 bg-[#40e0f0]/10 px-3 py-1 text-sm font-bold text-[#40e0f0]">
                  {feedbackList.length}
                </span>
              </h2>
            </div>
            <button
              onClick={fetchFeedback}
              className="touch-target shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              type="button"
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="mt-5 space-y-3">
            {feedbackList.length === 0 ? (
               <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">
                 No feedback received yet.
               </div>
            ) : (
               feedbackList.map(item => (
                 <div key={item._id} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between transition hover:border-[#40e0f0]/20 hover:bg-white/[0.055]">
                   <div className="min-w-0">
                     <div className="flex items-center gap-2">
                       <span className="font-bold text-white">{item.name}</span>
                       <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                     </div>
                     <p className="mt-1 text-sm text-slate-300 break-words whitespace-pre-wrap">{item.message}</p>
                   </div>
                   <button
                     onClick={() => deleteFeedback(item._id)}
                     className="shrink-0 self-start sm:self-center rounded-xl border border-rose-400/20 bg-rose-500/8 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/18"
                   >
                     Delete
                   </button>
                 </div>
               ))
            )}
          </div>
        </section>

        {/* ── Question Votes Section ── */}
        <section
          className="mt-6 animate-fade-in-up rounded-3xl border border-white/10 p-4 sm:p-5"
          style={{
            animationDelay: "0.13s",
            background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(245,158,11,0.04)), rgba(8,13,24,0.72)",
            boxShadow: "0 24px 80px rgba(2,6,23,0.35)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400/80">User Feedback</p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Question Votes
                <span className="ml-3 inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-300">
                  {questionVotes.length}
                </span>
              </h2>
              <p className="mt-1 text-xs text-slate-500">Questions users thumbs-up (👍 helpful) or thumbs-down (👎 reported issue)</p>
            </div>
            <button
              onClick={fetchVotes}
              className="touch-target shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              type="button"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Filter + Search bar */}
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { key: 'all', label: '📊 All', count: questionVotes.length },
              { key: 'issues', label: '👎 Issues', count: questionVotes.filter(v => v.downVotes > 0).length },
              { key: 'liked', label: '👍 Liked', count: questionVotes.filter(v => v.upVotes > 0).length },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setVotesFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  votesFilter === f.key
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/8'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
            <input
              type="text"
              placeholder="Search questions..."
              value={votesSearch}
              onChange={e => setVotesSearch(e.target.value)}
              className="flex-1 min-w-[180px] rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-amber-400/50"
            />
          </div>

          {/* Summary stat cards */}
          {questionVotes.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                {
                  label: 'Total Votes',
                  value: questionVotes.reduce((s, v) => s + v.totalVotes, 0),
                  color: '#a78bfa',
                  icon: '🗳️',
                },
                {
                  label: 'Thumbs Up',
                  value: questionVotes.reduce((s, v) => s + v.upVotes, 0),
                  color: '#10b981',
                  icon: '👍',
                },
                {
                  label: 'Issues Reported',
                  value: questionVotes.reduce((s, v) => s + v.downVotes, 0),
                  color: '#ef4444',
                  icon: '👎',
                },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Questions list */}
          <div className="space-y-3">
            {questionVotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
                <div className="text-4xl mb-3">🗳️</div>
                <p className="text-white font-bold mb-1">No votes yet</p>
                <p className="text-slate-500 text-sm">When users vote on questions, they'll appear here.</p>
              </div>
            ) : (() => {
              // Filter and search
              let filtered = questionVotes;
              if (votesFilter === 'issues') filtered = filtered.filter(v => v.downVotes > 0);
              if (votesFilter === 'liked') filtered = filtered.filter(v => v.upVotes > 0);
              if (votesSearch.trim()) {
                const q = votesSearch.trim().toLowerCase();
                filtered = filtered.filter(v =>
                  (v.questionText || '').toLowerCase().includes(q) ||
                  (v.subject || '').toLowerCase().includes(q)
                );
              }

              if (filtered.length === 0) {
                return (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-slate-400 text-sm">
                    No questions match the current filter.
                  </div>
                );
              }

              return filtered.map(item => {
                const scoreRatio = item.totalVotes > 0 ? item.upVotes / item.totalVotes : 0;
                const scoreColor = scoreRatio >= 0.7 ? '#10b981' : scoreRatio >= 0.4 ? '#f59e0b' : '#ef4444';
                const diffColors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444', unknown: '#6b7280' };
                const diffColor = diffColors[item.difficulty] || '#6b7280';

                return (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 transition hover:border-emerald-400/20 hover:bg-white/[0.055]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Left: question info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {/* Subject badge */}
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/25">
                            {item.subject || 'unknown'}
                          </span>
                          {/* Difficulty badge */}
                          <span
                            className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border"
                            style={{ color: diffColor, background: `${diffColor}15`, borderColor: `${diffColor}30` }}
                          >
                            {item.difficulty === 'easy' ? '🟢' : item.difficulty === 'medium' ? '🟡' : '🔴'} {item.difficulty}
                          </span>
                          {/* Score ratio */}
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: scoreColor, background: `${scoreColor}15`, border: `1px solid ${scoreColor}30` }}
                          >
                            {Math.round(scoreRatio * 100)}% positive
                          </span>
                        </div>
                        <p className="text-sm text-white font-semibold leading-snug line-clamp-2">
                          {item.questionText || item._id}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Last voted: {item.lastVoted ? new Date(item.lastVoted).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </p>
                      </div>

                      {/* Right: vote counts */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                          <span className="text-base">👍</span>
                          <span className="text-lg font-black text-green-400 tabular-nums">{item.upVotes}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                          <span className="text-base">👎</span>
                          <span className="text-lg font-black text-red-400 tabular-nums">{item.downVotes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vote bar */}
                    {item.totalVotes > 0 && (
                      <div className="mt-3 rounded-full overflow-hidden h-1.5 bg-white/5">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.round(scoreRatio * 100)}%`,
                            background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}bb)`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </section>

        {/* Quick info */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div
            className="animate-fade-in-up rounded-3xl border border-white/10 p-5"
            style={{
              animationDelay: "0.12s",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(8,13,24,0.72)",
              boxShadow: "0 24px 80px rgba(2,6,23,0.35)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/80">
              Admin info
            </p>
            <h3 className="mt-2 text-lg font-bold text-white">Quick Actions</h3>
            <ul className="mt-4 space-y-3">
              {[
                {
                  icon: "🏠",
                  label: "Go to homepage",
                  desc: "Visit the main Study Arcade site",
                  to: "/",
                },
                {
                  icon: "🏆",
                  label: "View leaderboard",
                  desc: "See all quiz leaderboards",
                  to: "/leaderboard",
                },
                {
                  icon: "➕",
                  label: "Create test user",
                  desc: "Open signup page to add a user",
                  to: "/signup",
                },
              ].map((action) => (
                <li key={action.label}>
                  <Link
                    to={action.to}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3 transition hover:border-amber-400/20 hover:bg-white/[0.06]"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {action.label}
                      </p>
                      <p className="text-xs text-slate-500">{action.desc}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="animate-fade-in-up rounded-3xl border border-white/10 p-5"
            style={{
              animationDelay: "0.16s",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(8,13,24,0.72)",
              boxShadow: "0 24px 80px rgba(2,6,23,0.35)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/80">
              Platform overview
            </p>
            <h3 className="mt-2 text-lg font-bold text-white">
              System Status
            </h3>
            <div className="mt-4 space-y-3">
              {[
                {
                  label: "Auth system",
                  value: "MongoDB + bcrypt",
                  status: "🟢",
                },
                { label: "Database", value: "MongoDB", status: "🟢" },
                {
                  label: "Total quizzes",
                  value: "20 modes",
                  status: "🟢",
                },
                {
                  label: "Leaderboard entries",
                  value: lbStats.totalGames,
                  status: lbStats.totalGames > 0 ? "🟢" : "🟡",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
                >
                  <div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-bold text-white">
                      {item.value}
                    </p>
                  </div>
                  <span className="text-sm">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="animate-fade-in-up rounded-3xl border border-white/10 p-5 md:col-span-2"
            style={{
              animationDelay: "0.2s",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025)), rgba(8,13,24,0.72)",
              boxShadow: "0 24px 80px rgba(2,6,23,0.35)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/80">
              Security
            </p>
            <h3 className="mt-2 text-lg font-bold text-white">Change Admin Password</h3>
            <form className="mt-5 grid gap-4 sm:grid-cols-3" onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/24 px-4 py-2 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-black/40"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/24 px-4 py-2 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-black/40"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/24 px-4 py-2 text-sm text-white outline-none transition focus:border-amber-400/60 focus:bg-black/40"
              />
              {passwordError && (
                <div className="sm:col-span-3 text-sm text-rose-400 font-medium">
                  {passwordError}
                </div>
              )}
              <div className="sm:col-span-3 text-right">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2.5 text-sm font-bold transition disabled:opacity-50"
                >
                  {isChangingPassword ? "Saving..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-slate-600">
        Study Arcade — Admin Dashboard
      </footer>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-200 shadow-xl backdrop-blur-xl">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
