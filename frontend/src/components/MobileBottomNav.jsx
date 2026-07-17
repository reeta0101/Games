import { Link, useLocation } from "react-router-dom";

export default function MobileBottomNav() {
  const location = useLocation();
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      to: "/quizzes",
      label: "Quizzes",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    },
    {
      to: "/exams",
      label: "Exams",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    },
    {
      to: "/games",
      label: "Games",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M6 12h4" />
          <path d="M8 10v4" />
          <circle cx="15" cy="13" r="1" fill="currentColor" />
          <circle cx="18" cy="11" r="1" fill="currentColor" />
        </svg>
      )
    },
    {
      to: "/lobby",
      label: "Battle",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 9.5 9.5 14.5" />
          <path d="M17 4.5c2 2 2 5.2 0 7.2l-8.5 8.5a2.12 2.12 0 1 1-3-3l8.5-8.5c2-2 5.2-2 7.2 0Z" />
        </svg>
      )
    },
    {
      to: "/leaderboard",
      label: "Rank",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 sm:hidden bg-[#07101d]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto font-medium px-1">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 group ${
                active ? "text-[#40e0f0]" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className={`mb-0.5 transition-transform duration-200 ${active ? "scale-110 drop-shadow-[0_0_8px_rgba(64,224,240,0.5)]" : "group-hover:scale-110"}`}>
                {item.icon}
              </div>
              <span className="block w-full text-center text-[9px] tracking-tight font-bold uppercase leading-tight truncate px-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
