import { useCallback, useRef, useEffect } from 'react';
import { useAudioContext } from '../contexts/AudioContext';

// Singleton AudioContext to avoid creating many contexts (which browsers block)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function useAudio() {
  const { isMuted } = useAudioContext();
  const ctxRef = useRef(null);

  useEffect(() => {
    ctxRef.current = getAudioContext();
  }, []);

  const playTone = useCallback((frequency, type, duration, vol = 0.1) => {
    if (isMuted || !ctxRef.current) return;
    
    // Resume context if suspended (browsers require user interaction to resume)
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }

    const t = ctxRef.current.currentTime;
    
    const osc = ctxRef.current.createOscillator();
    const gain = ctxRef.current.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, t);
    
    // Envelope
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(ctxRef.current.destination);

    osc.start(t);
    osc.stop(t + duration);
  }, [isMuted]);

  const playCorrect = useCallback(() => {
    if (isMuted) return;
    playTone(600, 'sine', 0.1, 0.1);
    setTimeout(() => playTone(800, 'sine', 0.15, 0.1), 100);
  }, [isMuted, playTone]);

  const playWrong = useCallback(() => {
    if (isMuted) return;
    playTone(200, 'sawtooth', 0.1, 0.1);
    setTimeout(() => playTone(150, 'sawtooth', 0.3, 0.1), 100);
  }, [isMuted, playTone]);

  const playStreak = useCallback((streakLength) => {
    if (isMuted) return;
    // Ascending arpeggio based on streak length
    const baseFreq = 400 + (streakLength * 50);
    playTone(baseFreq, 'square', 0.1, 0.05);
    setTimeout(() => playTone(baseFreq * 1.25, 'square', 0.1, 0.05), 100);
    setTimeout(() => playTone(baseFreq * 1.5, 'square', 0.2, 0.05), 200);
  }, [isMuted, playTone]);

  const playGameOver = useCallback(() => {
    if (isMuted) return;
    playTone(400, 'square', 0.2, 0.1);
    setTimeout(() => playTone(300, 'square', 0.2, 0.1), 200);
    setTimeout(() => playTone(250, 'square', 0.4, 0.1), 400);
  }, [isMuted, playTone]);

  return { playCorrect, playWrong, playStreak, playGameOver };
}
