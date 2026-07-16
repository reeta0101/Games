import React, { createContext, useContext, useState, useEffect } from 'react';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('arcade_muted');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('arcade_muted', isMuted);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioContext() {
  return useContext(AudioContext);
}
