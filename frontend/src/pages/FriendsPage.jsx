import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { GAME_MODES } from "../utils/gameConstants";

export default function FriendsPage() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("friends"); // friends, received, sent, all

  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  
  // Challenge Modal State
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState(null);
  
  // Friend Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTarget, setProfileTarget] = useState(null);
  
  const searchParams = new URLSearchParams(location.search);
  const initialGameId = searchParams.get('gameId') || GAME_MODES[0].key || GAME_MODES[0].id;
  const [challengeGame, setChallengeGame] = useState(initialGameId);
  const [challengeDiff, setChallengeDiff] = useState("intermediate");
  const [challengeTime, setChallengeTime] = useState(0); // 0 means Unlimited
  const [challengeWrongs, setChallengeWrongs] = useState(true); // true means acceptable
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchAllData();
  }, [currentUser, navigate]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      const [friendsRes, sentRequestsRes, allUsersRes] = await Promise.all([
        axios.get(`${apiUrl}/api/friends/${currentUser.username}`),
        axios.get(`${apiUrl}/api/friends/${currentUser.username}/sent-requests`),
        axios.get(`${apiUrl}/api/friends/search/users`, { params: { currentUsername: currentUser.username } })
      ]);

      setFriends(friendsRes.data.friends || []);
      setReceivedRequests(friendsRes.data.friendRequests || []);
      setSentRequests(sentRequestsRes.data || []);
      setAllUsers(allUsersRes.data || []);
    } catch (err) {
      console.error("Error fetching friends data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchMessage("");

    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/friends/search/users`, {
        params: { query: searchQuery, currentUsername: currentUser.username }
      });
      if (res.data.length === 0) {
        setSearchMessage("No users found.");
      } else {
        setAllUsers(res.data);
      }
    } catch (err) {
      setSearchMessage("Error searching users.");
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (targetUsername) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/friends/request`, {
        senderUsername: currentUser.username,
        targetUsername
      });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Error sending friend request.");
    }
  };

  const acceptRequest = async (requesterUsername) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/friends/accept`, {
        currentUsername: currentUser.username,
        requesterUsername
      });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Error accepting friend request.");
    }
  };

  const rejectRequest = async (requesterUsername) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/friends/reject`, {
        currentUsername: currentUser.username,
        requesterUsername
      });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || "Error rejecting friend request.");
    }
  };

  const openChallengeModal = (friend) => {
    setChallengeTarget(friend);
    setShowChallengeModal(true);
    setCopiedLink(false);
  };

  const openProfileModal = (friend) => {
    setProfileTarget(friend);
    setShowProfileModal(true);
  };

  const handleSendChallenge = () => {
    const url = `${window.location.origin}/challenge?gameId=${challengeGame}&difficulty=${challengeDiff}&timeLimit=${challengeTime}&wrongsAcceptable=${challengeWrongs}&score=0&challenger=${encodeURIComponent(currentUser.username)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => {
        setShowChallengeModal(false);
        setCopiedLink(false);
      }, 2000);
    });
  };

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center justify-center px-3 py-8">
        <p className="text-xl font-bold uppercase tracking-[0.2em] text-slate-500">Loading...</p>
      </main>
    );
  }

  const tabs = [
    { id: 'friends', label: 'My Friends', icon: '🤝', count: friends.length },
    { id: 'received', label: 'Received Requests', icon: '📥', count: receivedRequests.length },
    { id: 'sent', label: 'Sent Requests', icon: '📤', count: sentRequests.length },
    { id: 'all', label: 'All Users', icon: '🔍', count: null }
  ];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-4xl flex-col gap-8 px-3 py-8 sm:px-6 sm:py-10 relative">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white sm:text-5xl tracking-tight">Connections</h1>
        <p className="mt-2 text-slate-400">Manage your friends, pending requests, and discover new players.</p>
      </div>

      {/* Tab Bar — scrollable on mobile */}
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar">
        <div className="flex items-center gap-2 sm:gap-4 rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl min-w-max sm:min-w-0 sm:flex-wrap sm:justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#40e0f0]/20 text-[#40e0f0] border border-[#40e0f0]/40 shadow-[0_0_15px_rgba(64,224,240,0.2)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className={`ml-0.5 sm:ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] px-1 ${
                  activeTab === tab.id ? 'bg-[#40e0f0] text-black' : 'bg-white/10 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8 min-h-[400px]">
        
        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-white mb-6">My Friends</h2>
            {friends.length === 0 ? (
              <p className="text-slate-400 text-center py-10 bg-black/20 rounded-2xl border border-white/5">You haven't added any friends yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {friends.map((friend) => (
                  <div key={friend._id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-black/20 p-4 border border-white/5 hover:border-[#40e0f0]/30 transition gap-3 sm:gap-4">
                    <div 
                      className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
                      onClick={() => openProfileModal(friend)}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#40e0f0]/30 to-[#f04060]/30 text-xl font-black text-white transition-transform group-hover:scale-110">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-base sm:text-lg truncate group-hover:text-[#40e0f0] transition">{friend.name}</p>
                        <p className="text-xs text-slate-400">@{friend.username}</p>
                        {friend.instagram && (
                          <p className="text-xs text-[#E1306C] mt-0.5 truncate">📷 @{friend.instagram}</p>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => openChallengeModal(friend)}
                      className="rounded-full bg-[#f0e040]/10 text-[#f0e040] border border-[#f0e040]/30 px-5 py-2 text-xs font-black uppercase tracking-[0.1em] hover:bg-[#f0e040]/20 transition shadow-lg w-full sm:w-auto"
                    >
                      Challenge ⚔️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Received Requests Tab */}
        {activeTab === 'received' && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-white mb-6">Received Requests</h2>
            {receivedRequests.length === 0 ? (
              <p className="text-slate-400 text-center py-10 bg-black/20 rounded-2xl border border-white/5">No incoming friend requests.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {receivedRequests.map((req) => (
                  <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-black/20 p-4 border border-[#f04060]/20 shadow-[0_0_10px_rgba(240,64,96,0.1)]">
                    <div>
                      <p className="font-bold text-white text-lg">{req.name}</p>
                      <p className="text-xs text-slate-400">@{req.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptRequest(req.username)}
                        className="flex-1 sm:flex-none rounded-xl bg-[#40f080]/20 text-[#40f080] border border-[#40f080]/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#40f080]/30 transition"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => rejectRequest(req.username)}
                        className="flex-1 sm:flex-none rounded-xl bg-slate-500/20 text-slate-300 border border-slate-500/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] hover:bg-slate-500/40 transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sent Requests Tab */}
        {activeTab === 'sent' && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-white mb-6">Sent Requests</h2>
            {sentRequests.length === 0 ? (
              <p className="text-slate-400 text-center py-10 bg-black/20 rounded-2xl border border-white/5">You have no pending sent requests.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {sentRequests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between rounded-2xl bg-black/20 p-4 border border-white/5">
                    <div>
                      <p className="font-bold text-white text-lg">{req.name}</p>
                      <p className="text-xs text-slate-400">@{req.username}</p>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#f0e040] bg-[#f0e040]/10 px-3 py-1 rounded-full border border-[#f0e040]/20">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Users / Search Tab */}
        {activeTab === 'all' && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-black text-white">All Users</h2>
              <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search username..."
                  className="w-full sm:w-48 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#40e0f0]/60 focus:bg-white/[0.07]"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="rounded-xl border border-[#40e0f0]/60 bg-[#40e0f0]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#40e0f0] transition hover:bg-[#40e0f0]/20 disabled:opacity-50"
                >
                  {isSearching ? '...' : 'Search'}
                </button>
              </form>
            </div>
            
            {searchMessage && <p className="text-sm text-slate-400 mb-4">{searchMessage}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              {allUsers.map((user) => {
                const isFriend = friends.some(f => f.username === user.username);
                const isSent = sentRequests.some(r => r.username === user.username);
                const isReceived = receivedRequests.some(r => r.username === user.username);
                
                return (
                  <div key={user._id} className="flex items-center justify-between rounded-2xl bg-black/20 p-4 border border-white/5">
                    <div>
                      <p className="font-bold text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                    </div>
                    
                    {isFriend ? (
                      <span className="text-xs font-bold uppercase text-[#40e0f0] tracking-wider">Friend</span>
                    ) : isSent ? (
                      <span className="text-xs font-bold uppercase text-[#f0e040] tracking-wider">Request Sent</span>
                    ) : isReceived ? (
                      <span className="text-xs font-bold uppercase text-[#f04060] tracking-wider">Check Received</span>
                    ) : (
                      <button 
                        onClick={() => sendFriendRequest(user.username)}
                        className="rounded-full bg-white/10 text-white border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] hover:bg-white/20 transition"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </section>

      {/* Challenge Configuration Modal */}
      {showChallengeModal && challengeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0f172a] p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-black text-white text-center mb-2">Setup Challenge</h2>
            <p className="text-center text-[#40e0f0] font-bold uppercase tracking-widest text-xs mb-8">vs {challengeTarget.name}</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Game Mode</label>
                <select 
                  value={challengeGame} 
                  onChange={(e) => setChallengeGame(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#f0e040]/50"
                >
                  {GAME_MODES.map(game => (
                    <option key={game.key || game.id} value={game.key || game.id} className="bg-slate-900">
                      {game.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Difficulty</label>
                <select 
                  value={challengeDiff} 
                  onChange={(e) => setChallengeDiff(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#f0e040]/50"
                >
                  <option value="beginner" className="bg-slate-900">Beginner</option>
                  <option value="intermediate" className="bg-slate-900">Intermediate</option>
                  <option value="advanced" className="bg-slate-900">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Game Duration</label>
                <div className="flex gap-2">
                  {[0, 30, 60, 120].map(time => (
                    <button
                      key={time}
                      onClick={() => setChallengeTime(time)}
                      className={`flex-1 rounded-xl border py-3 text-xs sm:text-sm font-black transition ${
                        challengeTime === time 
                          ? 'bg-[#f0e040]/20 text-[#f0e040] border-[#f0e040]/50' 
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {time === 0 ? "Unlimited" : `${time}s`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Wrongs Acceptable?</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChallengeWrongs(true)}
                    className={`flex-1 rounded-xl border py-3 text-sm font-black transition ${
                      challengeWrongs === true 
                        ? 'bg-[#40f080]/20 text-[#40f080] border-[#40f080]/50' 
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Yes (Lose Streak)
                  </button>
                  <button
                    onClick={() => setChallengeWrongs(false)}
                    className={`flex-1 rounded-xl border py-3 text-sm font-black transition ${
                      challengeWrongs === false 
                        ? 'bg-[#f04060]/20 text-[#f04060] border-[#f04060]/50' 
                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    No (Instant Over)
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowChallengeModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendChallenge}
                className="flex-[2] rounded-xl border border-[#40e0f0]/50 bg-[#40e0f0]/20 py-3 text-xs font-black uppercase tracking-widest text-[#40e0f0] hover:bg-[#40e0f0]/30 transition"
              >
                {copiedLink ? "Link Copied! ✓" : "Generate Link"}
              </button>
            </div>
            {copiedLink && (
              <p className="mt-4 text-center text-xs text-[#40e0f0] animate-pulse">Paste the link to your friend to start the battle!</p>
            )}
          </div>
        </div>
      )}
      {/* Friend Profile Modal (Instagram-style) */}
      {showProfileModal && profileTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0f172a] p-6 sm:p-8 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition text-xl"
            >
              ✕
            </button>

            {/* Profile Card Content */}
            <div className="flex flex-col items-center text-center">
              {/* Large Avatar */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#40e0f0]/40 to-[#f04060]/40 border-4 border-[#40e0f0]/30 shadow-[0_0_30px_rgba(64,224,240,0.2)] text-4xl font-black text-white mb-4">
                {profileTarget.name.charAt(0).toUpperCase()}
              </div>

              {/* Name & Username */}
              <h3 className="text-2xl font-black text-white">{profileTarget.name}</h3>
              <p className="text-sm text-[#40e0f0] font-semibold mt-1">@{profileTarget.username}</p>

              {/* Instagram Link */}
              {profileTarget.instagram && (
                <a
                  href={`https://instagram.com/${profileTarget.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E1306C]/30 bg-[#E1306C]/10 px-4 py-2 text-sm font-semibold text-[#E1306C] transition hover:bg-[#E1306C]/20 hover:border-[#E1306C]/50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                  @{profileTarget.instagram}
                </a>
              )}

              {/* Divider */}
              <div className="w-full h-px bg-white/10 my-5"></div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    openChallengeModal(profileTarget);
                  }}
                  className="flex-1 rounded-xl border border-[#f0e040]/40 bg-[#f0e040]/10 py-3 text-xs font-black uppercase tracking-[0.1em] text-[#f0e040] hover:bg-[#f0e040]/20 transition"
                >
                  Challenge ⚔️
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-white/10 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
