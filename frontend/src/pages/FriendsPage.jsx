import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GAME_MODES } from "../App";

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

  // Challenge Modal State
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState(null);
  const [challengeGame, setChallengeGame] = useState(GAME_MODES[0].key || GAME_MODES[0].id);
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

      {/* Tab Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
              activeTab === tab.id 
                ? 'bg-[#40e0f0]/20 text-[#40e0f0] border border-[#40e0f0]/40 shadow-[0_0_15px_rgba(64,224,240,0.2)]' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            {tab.count !== null && (
              <span className={`ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px] px-1 ${
                activeTab === tab.id ? 'bg-[#40e0f0] text-black' : 'bg-white/10 text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
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
                  <div key={friend._id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-black/20 p-4 border border-white/5 hover:border-[#40e0f0]/30 transition gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#40e0f0]/30 to-[#f04060]/30 text-xl font-black text-white">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{friend.name}</p>
                        <p className="text-xs text-slate-400">@{friend.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => openChallengeModal(friend)}
                      className="rounded-full bg-[#f0e040]/10 text-[#f0e040] border border-[#f0e040]/30 px-5 py-2 text-xs font-black uppercase tracking-[0.1em] hover:bg-[#f0e040]/20 transition shadow-lg"
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
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0f172a] p-8 shadow-2xl">
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
    </main>
  );
}
