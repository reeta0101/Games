import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const GlobalSocketContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalSocket = () => useContext(GlobalSocketContext);

export const GlobalSocketProvider = ({ children }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [socket, setSocket] = useState(null);
  const [incomingChallenge, setIncomingChallenge] = useState(null);
  const [onlineFriends, setOnlineFriends] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      if (socket) {
        socket.disconnect();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(null);
      }
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const newSocket = io(apiUrl);

    newSocket.on('connect', () => {
      newSocket.emit('user_online', { username: currentUser.username });
    });

    newSocket.on('receive_challenge', (data) => {
      // data = { fromUsername: 'user1', fromName: 'User 1', roomId: 'XYZ' }
      setIncomingChallenge(data);
    });

    newSocket.on('online_status_update', (statusMap) => {
      setOnlineFriends(statusMap);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleAcceptChallenge = () => {
    if (incomingChallenge && socket) {
      navigate(`/lobby?room=${incomingChallenge.roomId}`);
      setIncomingChallenge(null);
    }
  };

  const handleDeclineChallenge = () => {
    setIncomingChallenge(null);
  };

  return (
    <GlobalSocketContext.Provider value={{ socket, onlineFriends }}>
      {children}
      
      {/* Global Challenge Toast */}
      {incomingChallenge && (
        <div className="fixed bottom-6 right-6 z-[9999] w-80 animate-soft-pop overflow-hidden rounded-2xl border border-[#40e0f0]/40 bg-slate-900/95 p-5 shadow-[0_10px_40px_rgba(64,224,240,0.15)] backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3 text-[#40e0f0]">
            <span className="text-xl">⚔️</span>
            <h3 className="text-sm font-black uppercase tracking-widest">Match Challenge!</h3>
          </div>
          <p className="mb-4 text-sm text-slate-300">
            <strong className="text-white">{incomingChallenge.fromName}</strong> has challenged you to a live match!
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDeclineChallenge}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              Decline
            </button>
            <button
              onClick={handleAcceptChallenge}
              className="flex-1 rounded-xl bg-[#40e0f0] py-2 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-[#40e0f0]/30 transition hover:scale-105"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </GlobalSocketContext.Provider>
  );
};
