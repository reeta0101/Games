import { useCallback, useRef } from 'react';

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
        } catch (e) { }
    }, [enabled, getAudioContext]);

    // Play noise burst (for firework crackle/explosion)
    const playNoise = useCallback((duration, startTime = 0, volume = 0.15) => {
        if (!enabled) return;
        try {
            const ctx = getAudioContext();
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            // Generate noise with decay
            for (let i = 0; i < bufferSize; i++) {
                const decay = 1 - (i / bufferSize);
                data[i] = (Math.random() * 2 - 1) * decay * decay;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            // Bandpass filter for crackle sound
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 3000;
            filter.Q.value = 0.5;

            const gainNode = ctx.createGain();
            const now = ctx.currentTime + startTime;
            gainNode.gain.setValueAtTime(volume, now);

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            noise.start(now);
        } catch (e) { }
    }, [enabled, getAudioContext]);

    // Firework launch whoosh sound
    const playWhoosh = useCallback((startTime = 0) => {
        if (!enabled) return;
        try {
            const ctx = getAudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            oscillator.type = 'sawtooth';
            filter.type = 'lowpass';

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            const now = ctx.currentTime + startTime;

            // Rising pitch for launch
            oscillator.frequency.setValueAtTime(100, now);
            oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);

            filter.frequency.setValueAtTime(500, now);
            filter.frequency.exponentialRampToValueAtTime(2000, now + 0.15);

            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            oscillator.start(now);
            oscillator.stop(now + 0.2);
        } catch (e) { }
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
                    const audio = new Audio('/sounds/fireworks.wav');
                    audio.volume = 0.6;
                    audio.play().catch(e => console.log('Audio play failed:', e));
                } catch (e) {
                    console.error('Error playing firework sound:', e);
                }
                break;

            default:
                break;
        }
    }, [enabled, playTone, playNoise, playWhoosh]);

    return { playSound };
};

export default useSound;
