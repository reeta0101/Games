import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Timer hook that uses wall-clock time (Date.now()) instead of counting
 * setInterval ticks. This ensures the timer correctly accounts for laptop
 * sleep/suspend — when the device wakes up, the next tick sees the real
 * elapsed time and fires onTimeUp if the deadline has passed.
 */
export const useTimer = (initialTime = 30, onTimeUp = null) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Wall-clock deadline (ms since epoch) when the timer should expire
    const deadlineRef = useRef(null);
    // How many seconds were remaining when the timer was paused
    const pausedRemainingRef = useRef(null);
    const intervalRef = useRef(null);
    const onTimeUpRef = useRef(onTimeUp);
    const firedRef = useRef(false); // prevent double-fire of onTimeUp

    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    const start = useCallback(() => {
        // Set the deadline based on the current timeLeft value
        deadlineRef.current = Date.now() + timeLeft * 1000;
        pausedRemainingRef.current = null;
        firedRef.current = false;
        setIsRunning(true);
        setIsPaused(false);
    }, [timeLeft]);

    const pause = useCallback(() => {
        // Capture how many seconds remain so we can resume later
        if (deadlineRef.current) {
            const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
            pausedRemainingRef.current = remaining;
        }
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        // Re-create the deadline from the paused remaining time
        if (pausedRemainingRef.current != null) {
            deadlineRef.current = Date.now() + pausedRemainingRef.current * 1000;
            pausedRemainingRef.current = null;
        }
        setIsPaused(false);
    }, []);

    const reset = useCallback((newTime = initialTime) => {
        deadlineRef.current = null;
        pausedRemainingRef.current = null;
        firedRef.current = false;
        setTimeLeft(newTime);
        setIsRunning(false);
        setIsPaused(false);
    }, [initialTime]);

    const stop = useCallback(() => {
        deadlineRef.current = null;
        pausedRemainingRef.current = null;
        setIsRunning(false);
        setIsPaused(false);
    }, []);

    // Main tick effect — checks wall-clock time every 500ms
    useEffect(() => {
        if (isRunning && !isPaused) {
            const tick = () => {
                if (!deadlineRef.current) return;

                const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
                setTimeLeft(remaining);

                if (remaining <= 0 && !firedRef.current) {
                    firedRef.current = true;
                    setIsRunning(false);
                    if (onTimeUpRef.current) {
                        onTimeUpRef.current();
                    }
                }
            };

            // Run immediately so we catch sleep gaps right away
            tick();

            // Check every 500ms for smoother updates & faster sleep detection
            intervalRef.current = setInterval(tick, 500);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, isPaused]);

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return {
        timeLeft,
        formattedTime: formatTime(timeLeft),
        isRunning,
        isPaused,
        start,
        pause,
        resume,
        reset,
        stop,
        isWarning: timeLeft <= 10 && timeLeft > 5,
        isDanger: timeLeft <= 5,
    };
};

export default useTimer;
