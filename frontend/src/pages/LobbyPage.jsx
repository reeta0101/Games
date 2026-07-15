import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GAME_MODES } from "../App";
import { DIFFICULTIES, DIFF_LABELS } from "../utils/leaderboard";
import { useGlobalSocket } from "../contexts/GlobalSocketContext";

export default function LobbyPage() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [roomId, setRoomId] = useState(searchParams.get("room") || "");
  const [inRoom, setInRoom] = useState(false);
  const [lobbyState, setLobbyState] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [joinError, setJoinError] = useState("");
  const { socket, onlineFriends } = useGlobalSocket();
  const [friendsList, setFriendsList] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states for Leader
  const initialGameId = searchParams.get("gameId") || GAME_MODES[0].id || GAME_MODES[0].key;
  const [gameId, setGameId] = useState(initialGameId);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [challengeMode, setChallengeMode] = useState("time_attack"); // time_attack or sudden_death
  const [timeLimit, setTimeLimit] = useState(60);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!socket) return;

    const onLobbyState = (state) => {
      setLobbyState(state);
      if (state.settings) {
        setGameId(state.settings.gameId);
        setDifficulty(state.settings.difficulty);
        setChallengeMode(state.settings.challengeMode);
        setTimeLimit(state.settings.timeLimit);
      }
    };

    const onGameStarted = (settings) => {
      const foundGame = GAME_MODES.find(g => g.id === settings.gameId || g.key === settings.gameId);
      if (foundGame) {
        navigate(foundGame.path, {
          state: {
            challenge: {
              challenger: "Live Challenge",
              roomId: roomId,
              score: 0,
              difficulty: settings.difficulty,
              timeLimit: settings.challengeMode === 'time_attack' ? settings.timeLimit : 0,
              wrongsAcceptable: settings.challengeMode === 'time_attack'
            }
          }
        });
      }
    };

    socket.on("lobby_state", onLobbyState);
    socket.on("game_started", onGameStarted);

    return () => {
      socket.off("lobby_state", onLobbyState);
      socket.off("game_started", onGameStarted);
    };
  }, [currentUser, navigate, socket, roomId]);

  useEffect(() => {
    if (!currentUser) return;
    setLoadingFriends(true);
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/friends/${currentUser.username}`)
      .then(res => res.json())
      .then(data => {
        if (data.friends) {
          setFriendsList(data.friends);
          if (socket) {
            socket.emit("check_online_status", { friendsList: data.friends.map(f => f.username) });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingFriends(false));
  }, [currentUser, socket]);

  useEffect(() => {
    // If leader, broadcast settings changes
    if (inRoom && lobbyState && isMeLeader()) {
      socket.emit("update_settings", {
        roomId,
        settings: { gameId, difficulty, challengeMode, timeLimit }
      });
    }
  }, [gameId, difficulty, challengeMode, timeLimit]);

  const joinOrCreateRoom = (e) => {
    e?.preventDefault();
    if (!roomId.trim()) return;
    
    setJoinError("");

    socket.emit("join_lobby", {
      roomId,
      user: {
        username: currentUser.username,
        name: currentUser.name
      }
    }, (response) => {
      if (response && response.error) {
        setJoinError(response.error);
        return;
      }
      
      // Set initial settings if we are creating
      socket.emit("update_settings", {
        roomId,
        settings: { gameId, difficulty, challengeMode, timeLimit }
      });
      
      setInRoom(true);
      // update URL without refresh
      window.history.pushState({}, '', `/lobby?room=${roomId}`);
    });
  };

  useEffect(() => {
    if (searchParams.get("room") && !inRoom && currentUser && socket) {
      joinOrCreateRoom();
    }
  }, [searchParams, currentUser, socket]);

  const createRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
    setTimeout(() => {
      document.getElementById("join-form-btn")?.click();
    }, 50);
  };

  const toggleReady = () => {
    if (!socket) return;
    const newState = !isReady;
    setIsReady(newState);
    socket.emit("toggle_ready", {
      roomId,
      username: currentUser.username,
      readyState: newState
    });
  };

  const startGame = () => {
    if (socket) socket.emit("start_game", { roomId });
  };

  const sendChallenge = (friend) => {
    if (!socket || !roomId) return;
    socket.emit("send_challenge", {
      targetUsername: friend.username,
      fromUsername: currentUser.username,
      fromName: currentUser.name,
      roomId
    }, (res) => {
      if (res.error) {
        alert(res.error);
      } else {
        alert(`Challenge sent to ${friend.name}!`);
      }
    });
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit("leave_lobby", { roomId, username: currentUser.username });
    }
    setInRoom(false);
    setLobbyState(null);
    setRoomId("");
    window.history.pushState({}, '', '/lobby');
  };

  const isMeLeader = () => {
    if (!lobbyState) return false;
    const me = lobbyState.players.find(p => p.username === currentUser.username);
    return me?.isLeader || false;
  };

  const allReady = () => {
    if (!lobbyState) return false;
    // The leader doesn't strictly need to be "ready" if they are the one clicking start,
    // but everyone else MUST be ready.
    const nonLeaders = lobbyState.players.filter(p => !p.isLeader);
    if (nonLeaders.length === 0) return false; // Need at least one opponent
    return nonLeaders.every(p => p.ready);
  };

  if (!inRoom) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
        <h1 className="text-4xl font-black text-white mb-4">Live Multiplayer</h1>
        <p className="text-slate-400 mb-10">Create a room or join a friend to play head-to-head in real time.</p>
        
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          {joinError && (
            <div className="mb-6 rounded-xl border border-[#f04060]/30 bg-[#f04060]/10 p-4 text-sm font-bold text-[#f04060]">
              {joinError}
            </div>
          )}
          <form onSubmit={joinOrCreateRoom} className="flex flex-col gap-4">
            <input
              type="text"
              value={roomId}
              onChange={e => setRoomId(e.target.value.toUpperCase())}
              placeholder="ENTER ROOM CODE"
              className="w-full rounded-2xl border border-white/15 bg-black/30 px-6 py-4 text-center text-2xl font-black uppercase tracking-widest text-white outline-none transition focus:border-[#40e0f0]/60"
            />
            <button
              id="join-form-btn"
              type="submit"
              disabled={!roomId.trim()}
              className="w-full rounded-2xl bg-gradient-to-r from-[#40e0f0] to-[#f04060] py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-[#40e0f0]/20 disabled:opacity-50 transition hover:scale-[1.02]"
            >
              Join Room
            </button>
          </form>

          <div className="my-6 flex items-center justify-center gap-4 text-slate-500">
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="text-xs font-bold uppercase tracking-widest">OR</span>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <button
            onClick={createRandomRoom}
            className="w-full rounded-2xl border border-[#f0e040]/40 bg-[#f0e040]/10 py-4 text-sm font-black uppercase tracking-[0.2em] text-[#f0e040] shadow-[0_0_15px_rgba(240,224,64,0.1)] transition hover:bg-[#f0e040]/20"
          >
            Create New Room
          </button>
        </div>
      </main>
    );
  }

  const leader = isMeLeader();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] max-w-5xl flex-col px-3 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
        <div>
          <h1 className="text-2xl font-black text-white">Lobby <span className="text-[#40e0f0]">#{roomId}</span></h1>
          <p className="text-sm text-slate-400 mt-1">Share this code with your friends!</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-widest transition whitespace-nowrap ${
              copiedCode 
                ? "border-[#40f080]/40 bg-[#40f080]/10 text-[#40f080]"
                : "border-[#f0e040]/40 bg-[#f0e040]/10 text-[#f0e040] hover:bg-[#f0e040]/20"
            }`}
          >
            {copiedCode ? "Copied!" : "Copy Code"}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/lobby?room=${roomId}`);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-widest transition whitespace-nowrap ${
              copiedLink 
                ? "border-[#40f080]/40 bg-[#40f080]/10 text-[#40f080]"
                : "border-[#40e0f0]/40 bg-[#40e0f0]/10 text-[#40e0f0] hover:bg-[#40e0f0]/20"
            }`}
          >
            {copiedLink ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={leaveRoom}
            className="rounded-xl border border-[#f04060]/40 bg-[#f04060]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#f04060] hover:bg-[#f04060]/20 transition whitespace-nowrap"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Game Settings */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
          <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Game Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Quiz Mode</label>
              <select 
                value={gameId} 
                onChange={(e) => setGameId(e.target.value)}
                disabled={!leader}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {GAME_MODES.map(game => (
                  <option key={game.key || game.id} value={game.key || game.id} className="bg-slate-900">
                    {game.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Difficulty Level</label>
              <div className="flex gap-2">
                {Object.entries(DIFFICULTIES).map(([key, diff]) => (
                  <button
                    key={key}
                    onClick={() => leader && setDifficulty(key)}
                    disabled={!leader}
                    className={`flex-1 rounded-xl border py-3 text-xs sm:text-sm font-black transition ${
                      difficulty === key 
                        ? 'bg-[#40e0f0]/20 text-[#40e0f0] border-[#40e0f0]/50 shadow-[0_0_10px_rgba(64,224,240,0.2)]' 
                        : 'bg-black/20 text-slate-500 border-white/10'
                    }`}
                  >
                    {diff.icon} {DIFF_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Challenge Format</label>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => leader && setChallengeMode('time_attack')}
                  disabled={!leader}
                  className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                    challengeMode === 'time_attack'
                      ? 'bg-[#f0e040]/10 border-[#f0e040]/50'
                      : 'bg-black/20 border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <h3 className={`text-lg font-black ${challengeMode === 'time_attack' ? 'text-[#f0e040]' : 'text-slate-300'}`}>Time Attack</h3>
                  <p className="text-xs text-slate-400 mt-1">Race against a global timer. Wrong answers don't end the game, but break your streak!</p>
                  
                  {challengeMode === 'time_attack' && (
                    <div className="mt-4 flex gap-2">
                      {[30, 60, 120].map(time => (
                        <div
                          key={time}
                          onClick={(e) => { e.stopPropagation(); leader && setTimeLimit(time); }}
                          className={`flex-1 cursor-pointer text-center rounded-xl border py-2 text-xs font-black transition ${
                            timeLimit === time 
                              ? 'bg-[#f0e040]/20 text-[#f0e040] border-[#f0e040]/50' 
                              : 'bg-black/40 text-slate-500 border-transparent hover:bg-black/60'
                          }`}
                        >
                          {time}s
                        </div>
                      ))}
                    </div>
                  )}
                </button>

                <button
                  onClick={() => leader && setChallengeMode('sudden_death')}
                  disabled={!leader}
                  className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                    challengeMode === 'sudden_death'
                      ? 'bg-[#f04060]/10 border-[#f04060]/50'
                      : 'bg-black/20 border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <h3 className={`text-lg font-black ${challengeMode === 'sudden_death' ? 'text-[#f04060]' : 'text-slate-300'}`}>Sudden Death</h3>
                  <p className="text-xs text-slate-400 mt-1">Unlimited time, but your FIRST wrong answer instantly ends the game!</p>
                </button>
              </div>
            </div>

            {!leader && (
              <p className="text-xs font-bold uppercase tracking-widest text-rose-400 text-center animate-pulse mt-4">
                Waiting for leader to configure settings...
              </p>
            )}
          </div>
        </section>

        {/* Right Column: Players & Actions */}
        <section className="flex flex-col gap-6">
          <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Players in Lobby</h2>
            
            <div className="space-y-3">
              {lobbyState?.players.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-2xl bg-black/30 p-4 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-black text-white ${
                      p.isLeader ? 'bg-gradient-to-br from-[#40e0f0] to-blue-500 shadow-[0_0_15px_rgba(64,224,240,0.3)]' : 'bg-slate-700'
                    }`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {p.name} {p.username === currentUser.username && "(You)"}
                      </p>
                      {p.isLeader && <span className="text-[10px] font-bold uppercase tracking-widest text-[#40e0f0]">Leader</span>}
                    </div>
                  </div>
                  
                  {!p.isLeader && (
                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                      p.ready 
                        ? 'bg-[#40f080]/20 text-[#40f080] border-[#40f080]/30' 
                        : 'bg-white/5 text-slate-500 border-white/10'
                    }`}>
                      {p.ready ? 'Ready!' : 'Waiting...'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            {leader ? (
              <button
                onClick={startGame}
                disabled={!allReady()}
                className="w-full rounded-2xl bg-gradient-to-r from-[#40e0f0] to-[#40f080] py-5 text-lg font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#40e0f0]/30 disabled:opacity-50 disabled:grayscale transition hover:scale-[1.02]"
              >
                {allReady() ? 'Start Match!' : 'Waiting for players...'}
              </button>
            ) : (
              <button
                onClick={toggleReady}
                className={`w-full rounded-2xl py-5 text-lg font-black uppercase tracking-[0.2em] shadow-lg transition hover:scale-[1.02] ${
                  isReady 
                    ? 'bg-transparent border-2 border-[#40f080]/50 text-[#40f080]' 
                    : 'bg-gradient-to-r from-[#f0e040] to-[#f04060] text-white shadow-[#f04060]/30'
                }`}
              >
                {isReady ? 'Ready! (Click to unready)' : 'Click to Ready Up!'}
              </button>
            )}
          </div>

          {leader && (
            <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
              <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Invite Friends</h2>
              
              {loadingFriends ? (
                <p className="text-sm text-slate-400">Loading friends...</p>
              ) : friendsList.length === 0 ? (
                <p className="text-sm text-slate-400">You have no friends yet. Add friends to challenge them directly!</p>
              ) : (
                <div className="space-y-3">
                  {friendsList.map(friend => {
                    const isOnline = onlineFriends[friend.username];
                    const inLobby = lobbyState?.players.some(p => p.username === friend.username);
                    return (
                      <div key={friend.username} className="flex items-center justify-between rounded-2xl bg-black/30 p-3 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-lg font-black text-white">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-[#40f080]' : 'bg-slate-500'}`} />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{friend.name}</p>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400">@{friend.username}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => sendChallenge(friend)}
                          disabled={inLobby}
                          className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                            inLobby 
                              ? 'bg-white/5 text-slate-500 border border-white/10 opacity-50' 
                              : isOnline
                                ? 'bg-[#f04060]/20 text-[#f04060] border border-[#f04060]/40 hover:bg-[#f04060]/30'
                                : 'bg-white/10 text-slate-300 border border-white/20 hover:bg-white/20'
                          }`}
                        >
                          {inLobby ? 'Joined' : 'Challenge'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
