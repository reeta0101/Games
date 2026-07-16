import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { MODE_LABELS } from "../utils/leaderboard";

export default function ProfilePage() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const navigate = useNavigate();

  const [highScores, setHighScores] = useState({});
  const [friendsCount, setFriendsCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    // Fetch personal scores and friends data concurrently
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        
        const [scoresRes, friendsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/score/personal/${encodeURIComponent(currentUser.name)}`),
          axios.get(`${apiUrl}/api/friends/${currentUser.username}`)
        ]);

        setHighScores(scoresRes.data.highScores || {});
        setFriendsCount(friendsRes.data.friends?.length || 0);
        setRequestsCount(friendsRes.data.friendRequests?.length || 0);

      } catch (err) {
        console.error("Error fetching profile data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center justify-center px-3 py-8">
        <p className="text-xl font-bold uppercase tracking-[0.2em] text-slate-500">Loading Profile...</p>
      </main>
    );
  }

  const initial = currentUser?.name?.trim()?.charAt(0)?.toUpperCase() || "G";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-4xl flex-col gap-10 px-3 py-8 sm:px-6 sm:py-12">
      
      {/* Header Profile Section */}
      <section className="flex flex-col sm:flex-row items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#40e0f0]/30 to-[#f04060]/30 border-4 border-[#40e0f0]/50 shadow-[0_0_20px_rgba(64,224,240,0.3)]">
          <span className="text-4xl font-black text-white">{initial}</span>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-black text-white tracking-tight">{currentUser.name}</h1>
          <p className="text-lg text-[#40e0f0] font-semibold mt-1">@{currentUser.username}</p>
          <p className="text-sm text-slate-400 mt-2">{currentUser.email}</p>
          {currentUser.instagram && (
            <a
              href={`https://instagram.com/${currentUser.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#E1306C] transition hover:text-[#F56040]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              @{currentUser.instagram}
            </a>
          )}
        </div>
        <div className="flex flex-col gap-3 w-full sm:w-auto mt-4 sm:mt-0">
           <Link
             to="/friends"
             className="flex items-center justify-center gap-2 rounded-2xl border border-[#40e0f0]/40 bg-[#40e0f0]/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-[#40e0f0] transition hover:bg-[#40e0f0]/20"
           >
             Friends ({friendsCount})
             {requestsCount > 0 && (
               <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f04060] text-[10px] text-white">
                 {requestsCount}
               </span>
             )}
           </Link>
           <button
             onClick={() => document.getElementById('navbar-change-password-btn')?.click()}
             className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-slate-300 transition hover:bg-white/10"
           >
             Settings
           </button>
        </div>
      </section>

      {/* Statistics Section */}
      <section>
        <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-6">
          <span className="text-[#f0e040]">🏆</span> Personal Records
        </h2>
        
        {Object.keys(highScores).length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-black/20 p-8 text-center">
            <p className="text-slate-400 text-lg">You haven't set any high scores yet!</p>
            <Link to="/quizzes" className="inline-block mt-4 text-[#40e0f0] hover:underline font-bold">Play a quiz now →</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(highScores).map(([key, score]) => {
              const [mode, difficulty] = key.split('__');
              const modeLabel = Object.values(MODE_LABELS).find(m => m.id === mode)?.label || mode;
              
              return (
                <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-md hover:border-[#40e0f0]/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-black/30 px-3 py-1 rounded-full">
                      {difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-2">{modeLabel}</h3>
                  <div className="text-3xl font-black text-[#40e0f0] drop-shadow-[0_0_12px_rgba(64,224,240,0.4)]">
                    {score}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </main>
  );
}
