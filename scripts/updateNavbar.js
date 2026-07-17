const fs = require('fs');
const path = require('path');

const navbarPath = path.join(__dirname, '../frontend/src/components/Navbar.jsx');
let content = fs.readFileSync(navbarPath, 'utf-8');

const rightSideAndDrawerStart = content.indexOf('{/* Right side — desktop */}');
const drawerEnd = content.indexOf('</header>');

if (rightSideAndDrawerStart === -1 || drawerEnd === -1) {
  console.error('Could not find boundaries');
  process.exit(1);
}

const replacement = `{/* Right side (Desktop & Mobile combined) */}
          <div className="flex items-center gap-2">
            {/* Desktop Login/Signup */}
            {!currentUser && (
              <div className="hidden sm:flex items-center gap-2">
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

            {currentUser ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-full sm:rounded-xl border border-emerald-400/20 sm:border-emerald-400/15 bg-emerald-400/10 sm:bg-emerald-400/8 p-1 sm:px-3.5 sm:py-2 text-sm text-slate-100 transition hover:bg-emerald-400/20 sm:hover:bg-emerald-400/15"
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                >
                  <span className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full sm:rounded-lg bg-emerald-400/20 sm:bg-emerald-400/15 text-sm sm:text-xs font-black text-emerald-200">
                    {initial}
                  </span>
                  <span className="hidden sm:inline max-w-32 truncate">{currentUser.name}</span>
                  <span className="hidden sm:inline text-[10px] text-emerald-400/50">
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
                      <Link
                        to="/friends"
                        onClick={() => setProfileOpen(false)}
                        className="px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Friends
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
            ) : (
              /* Hamburger (only shown on mobile when NOT logged in) */
              <button
                data-hamburger
                onClick={() => setMobileOpen((v) => !v)}
                className="touch-target flex h-11 w-11 sm:hidden items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-slate-300 transition hover:bg-white/8 hover:text-white"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="4" y1="4" x2="16" y2="16" />
                    <line x1="16" y1="4" x2="4" y2="16" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="17" y2="6" />
                    <line x1="3" y1="10" x2="17" y2="10" />
                    <line x1="3" y1="14" x2="17" y2="14" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile Menu Drawer (Only accessible when not logged in) ── */}
        {mobileOpen && !currentUser && (
          <div
            ref={mobileMenuRef}
            className="sm:hidden border-t border-white/8 bg-[#07101d]/95 backdrop-blur-2xl animate-fade-in-up"
          >
            <div className="mx-auto max-w-7xl px-4 py-4 space-y-2">
              <nav className="flex flex-col gap-1 pb-3 mb-3 border-b border-white/8" aria-label="Mobile navigation">
                {NAV_LINKS.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={\`flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition \${
                        active
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }\`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

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
            </div>
          </div>
        )}
      `;

const newContent = content.substring(0, rightSideAndDrawerStart) + replacement + content.substring(drawerEnd);
fs.writeFileSync(navbarPath, newContent);
console.log('Navbar updated successfully!');
