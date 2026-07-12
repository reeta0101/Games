import { useEffect, useCallback } from 'react';

export const useKeyboard = (handlers = {}) => {
    const handleKeyDown = useCallback((event) => {
        // Don't trigger if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = event.key.toLowerCase();

        // Number keys 1-9 for options
        if (/^[1-9]$/.test(key) && handlers.onOptionSelect) {
            event.preventDefault();
            handlers.onOptionSelect(parseInt(key) - 1);
            return;
        }

        // Letter keys a-d for options
        if (/^[a-d]$/.test(key) && handlers.onOptionSelect) {
            event.preventDefault();
            const index = key.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
            handlers.onOptionSelect(index);
            return;
        }

        switch (key) {
            case 'enter':
            case ' ':
                if (handlers.onNext) {
                    event.preventDefault();
                    handlers.onNext();
                }
                break;
            case 'arrowright':
                if (handlers.onNext) {
                    event.preventDefault();
                    handlers.onNext();
                }
                break;
            case 'arrowleft':
                if (handlers.onPrevious) {
                    event.preventDefault();
                    handlers.onPrevious();
                }
                break;
            case 'm':
                if (handlers.onMark) {
                    event.preventDefault();
                    handlers.onMark();
                }
                break;
            case 'r':
                if (event.ctrlKey || event.metaKey) return; // Don't override browser refresh
                if (handlers.onRetry) {
                    event.preventDefault();
                    handlers.onRetry();
                }
                break;
            case 'escape':
                if (handlers.onEscape) {
                    event.preventDefault();
                    handlers.onEscape();
                }
                break;
            default:
                break;
        }
    }, [handlers]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

export default useKeyboard;
