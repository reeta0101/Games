import { useCallback, useRef } from 'react';

const fireworkAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/fireworks.mp3') : null;
if (fireworkAudio) {
    fireworkAudio.volume = 0.6;
}

export const useSound = (enabled = true) => {
    const audioContextRef = useRef(null);

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    }, []);

    // Play a simple tone
    const playTone = useCallback((frequency, duration, type = 'sine', startTime = 0, volume = 0.1) => {
        if (!enabled) return;
        try {
            const ctx = getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            const now = ctx.currentTime + startTime;
            gainNode.gain.setValueAtTime(volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch {
            // ignore
        }
    }, [enabled, getAudioContext]);

    const playSound = useCallback((soundName) => {
        if (!enabled) return;

        switch (soundName) {
            case 'correct':
                // Triumphant chord
                playTone(523, 0.15, 'sine', 0, 0.1);
                playTone(659, 0.15, 'sine', 0.08, 0.1);
                playTone(784, 0.15, 'sine', 0.16, 0.1);
                playTone(1047, 0.25, 'sine', 0.24, 0.12);
                break;

            case 'wrong':
                playTone(330, 0.2, 'square', 0, 0.06);
                playTone(262, 0.3, 'square', 0.15, 0.06);
                break;

            case 'click':
                playTone(800, 0.05, 'sine', 0, 0.05);
                break;

            case 'complete':
                // Victory fanfare
                playTone(523, 0.12, 'sine', 0, 0.1);
                playTone(659, 0.12, 'sine', 0.12, 0.1);
                playTone(784, 0.12, 'sine', 0.24, 0.1);
                playTone(1047, 0.3, 'sine', 0.36, 0.12);
                playTone(784, 0.12, 'sine', 0.66, 0.1);
                playTone(1047, 0.4, 'sine', 0.78, 0.15);
                break;

            case 'firework':
                try {
                    if (fireworkAudio) {
                        fireworkAudio.currentTime = 0;
                        fireworkAudio.play().catch(e => console.log('Audio play failed:', e));
                    }
                } catch (e) {
                    console.error('Error playing firework sound:', e);
                }
                break;

            default:
                break;
        }
    }, [enabled, playTone]);

    return { playSound };
};

export default useSound;
