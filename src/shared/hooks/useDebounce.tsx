import { useRef, useEffect, useCallback } from 'react';

export function useDebounce(callback: (...args: any[]) => void, delay: number) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const debouncedCallback = useCallback(
        (...args: any[]) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    );

    return debouncedCallback;
}
