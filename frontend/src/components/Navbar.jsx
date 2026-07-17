import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ChangePasswordModal from "./ChangePasswordModal";
import { useAudioContext } from "../contexts/AudioContext";

const NAV_LINKS = [
  { to: "/quizzes", label: "Quizzes" },
  { to: "/test-page", label: "Exams" },
  { to: "/games", label: "Games" },
  { to: "/lobby", label: "Challenges" },
  { to: "/leaderboard", label: "Rank" },
];

export default function Navbar({
  currentUser,
  location,
  onToggleTheme,
  onLogout,
}) {
  const isActive = (path) => location.pathname === path;
  const initial = currentUser?.name?.trim()?.charAt(0)?.toUpperCase() || "G";
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { isMuted, toggleMute } = useAudioContext();

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  // Desktop profile dropdown state (click-based for mobile compatibility)
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest("[data-hamburger]")
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#020617]/70 backdrop-blur-xl shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/"
            className="group inline-flex min-h-11 items-center gap-3 rounded-xl pr-2"
            aria-label="Study Arcade home"
          >
            <span className="flex h-10 items-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 px-3 text-xs font-black tracking-[0.32em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300 group-hover:border-cyan-400/60 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              STUDY
            </span>
            <span className="text-sm font-bold tracking-[0.14em] text-slate-300 transition group-hover:text-white drop-shadow-md">
              arcade
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav
            className="hidden sm:flex items-center gap-1 rounded-2xl border border-white/5 bg-slate-900/50 p-1 backdrop-blur-md shadow-inner"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`touch-target inline-flex items-center justify-center rounded-xl px-5 py-2 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg border border-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side — desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {!currentUser && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="touch-target inline-flex items-center rounded-xl px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/7 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="touch-target inline-flex items-center rounded-xl border border-[#40e0f0]/35 bg-[#40e0f0]/10 px-3.5 py-2 text-sm font-semibold text-[#40e0f0] transition hover:bg-[#40e0f0]/18"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              onClick={onToggleTheme}
              className="touch-target rounded-xl border border-white/8 bg-white/[0.03] px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
              type="button"
              aria-label="Toggle color theme"
              title="Toggle color theme"
            >
              Theme
            </button>
            <button
              onClick={toggleMute}
              className="touch-target flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-slate-300 transition hover:bg-white/8 hover:text-white"
              type="button"
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
              title={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            {currentUser && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-xl border border-emerald-400/15 bg-emerald-400/8 px-3.5 py-2 text-sm text-slate-100 transition hover:bg-emerald-400/15"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/15 text-xs font-black text-emerald-200">
                    {initial}
                  </span>
                  <span className="max-w-32 truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-emerald-400/50">
                    {profileOpen ? "▲" : "▼"}
                  </span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50">
                    <div className="flex w-48 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#07101d] shadow-xl backdrop-blur-2xl animate-fade-in-up">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        My Profile
                      </Link>
                      <button
                        id="navbar-change-password-btn"
                        onClick={() => {
                          setShowPasswordModal(true);
                          setProfileOpen(false);
                        }}
                        className="px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                        }}
                        className="px-4 py-3 text-left text-sm text-rose-400 transition hover:bg-rose-500/10"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="touch-target rounded-xl border border-white/8 bg-white/[0.03] px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
              type="button"
              aria-label="Toggle color theme"
            >
              Theme
            </button>
            <button
              onClick={toggleMute}
              className="touch-target flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-slate-300 transition hover:bg-white/8 hover:text-white"
              type="button"
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            {/* Hamburger */}
            <button
              data-hamburger
              onClick={() => setMobileOpen((v) => !v)}
              className="touch-target flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-slate-300 transition hover:bg-white/8 hover:text-white"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                /* X icon */
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu Drawer ── */}
        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            className="sm:hidden border-t border-white/8 bg-[#07101d]/95 backdrop-blur-2xl animate-fade-in-up"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-2">
              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-1 pb-3 mb-3 border-b border-white/8" aria-label="Mobile navigation">
                {NAV_LINKS.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {currentUser ? (
                <>
                  {/* Profile card */}
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/8 px-4 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/15 text-base font-black text-emerald-200">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {currentUser.name}
                      </p>
                      {currentUser.username && (
                        <p className="truncate text-xs text-slate-400">
                          @{currentUser.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Profile Link */}
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Profile
                  </Link>

                  {/* Change Password */}
                  <button
                    id="navbar-mobile-change-password-btn"
                    onClick={() => {
                      setShowPasswordModal(true);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Change Password
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-rose-400 transition hover:bg-rose-500/10"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl border border-[#40e0f0]/35 bg-[#40e0f0]/10 px-4 py-3 text-sm font-semibold text-[#40e0f0] transition hover:bg-[#40e0f0]/18"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && currentUser && (
        <ChangePasswordModal
          user={currentUser}
          onClose={() => setShowPasswordModal(false)}
          onLogout={onLogout}
        />
      )}
    </>
  );
}
