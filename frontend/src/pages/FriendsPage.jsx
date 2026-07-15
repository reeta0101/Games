import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FriendsPage() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchFriendsData();
    fetchAllUsers();
  }, [currentUser, navigate]);

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/friends/search/users`, {
        params: { currentUsername: currentUser.username }
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error("Error fetching all users", err);
    }
  };

  const fetchFriendsData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/friends/${currentUser.username}`);
      setFriends(res.data.friends || []);
      setFriendRequests(res.data.friendRequests || []);
    } catch (err) {
      console.error("Error fetching friends", err);
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
        setSearchResults(res.data);
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
      alert(`Friend request sent to ${targetUsername}!`);
      // Update local search results to hide the add button or something similar if we wanted to
      setSearchResults(searchResults.filter(u => u.username !== targetUsername));
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
      fetchFriendsData(); // Refresh lists
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
      fetchFriendsData(); // Refresh lists
    } catch (err) {
      alert(err.response?.data?.error || "Error rejecting friend request.");
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl items-center justify-center px-3 py-8">
        <p className="text-xl font-bold uppercase tracking-[0.2em] text-slate-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl flex-col gap-8 px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white sm:text-5xl tracking-tight">Friends</h1>
        <p className="mt-2 text-slate-400">Manage your connections and challenge friends to games.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Requests & Friends */}
        <div className="space-y-8">
          
          {/* Pending Requests */}
          <section className="surface rounded-3xl p-6 sm:p-8 animate-soft-pop border border-white/10">
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
              <span className="text-[#f04060]">👥</span> Pending Requests
            </h2>
            {friendRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No pending friend requests.</p>
            ) : (
              <div className="space-y-3">
                {friendRequests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between rounded-2xl bg-black/20 p-4 border border-white/5">
                    <div>
                      <p className="font-bold text-white">{req.name}</p>
                      <p className="text-xs text-slate-500">@{req.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acceptRequest(req.username)}
                        className="rounded-full bg-[#40f080]/20 text-[#40f080] border border-[#40f080]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#40f080]/30 transition"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => rejectRequest(req.username)}
                        className="rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] hover:bg-slate-500/40 transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My Friends */}
          <section className="surface rounded-3xl p-6 sm:p-8 animate-soft-pop border border-white/10" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
              <span className="text-[#40e0f0]">🤝</span> My Friends
            </h2>
            {friends.length === 0 ? (
              <p className="text-sm text-slate-500">You haven't added any friends yet.</p>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div key={friend._id} className="flex items-center justify-between rounded-2xl bg-black/20 p-4 border border-white/5 hover:border-white/10 transition">
                    <div>
                      <p className="font-bold text-white text-lg">{friend.name}</p>
                      <p className="text-xs text-slate-400">@{friend.username}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 border border-white/10">
                       <span className="text-sm">✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Search */}
        <div className="space-y-8">
          <section className="surface rounded-3xl p-6 sm:p-8 animate-soft-pop border border-white/10" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
              <span className="text-[#f0e040]">🔍</span> Find Friends
            </h2>
            
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className="flex-1 rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#f0e040]/60 focus:bg-white/[0.07]"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="rounded-2xl border border-[#f0e040]/60 bg-[#f0e040]/12 px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-[#f0e040] transition hover:bg-[#f0e040]/22 disabled:opacity-50"
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </form>

            {searchMessage && <p className="text-sm text-slate-400 mb-4">{searchMessage}</p>}

            <div className="space-y-3">
              {searchResults.map((user) => {
                const isFriend = friends.some(f => f.username === user.username);
                // Note: We don't have perfect info if a request is already sent unless we check the user's friendRequests, 
                // but we handle duplicate requests on the backend.
                
                return (
                  <div key={user._id} className="flex items-center justify-between rounded-2xl bg-black/20 p-4 border border-white/5">
                    <div>
                      <p className="font-bold text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                    </div>
                    {isFriend ? (
                      <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Already Friends</span>
                    ) : (
                      <button 
                        onClick={() => sendFriendRequest(user.username)}
                        className="rounded-full bg-[#f0e040]/10 text-[#f0e040] border border-[#f0e040]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#f0e040]/20 transition"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

      </div>
    </main>
  );
}
