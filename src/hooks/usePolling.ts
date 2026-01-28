import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  interval: number;
  enabled: boolean;
  onPoll: () => void;
}

export function usePolling({ interval, enabled, onPoll }: UsePollingOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPollRef = useRef(onPoll);

  // Keep the callback ref updated
  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    const poll = () => {
      onPollRef.current();
      timeoutRef.current = setTimeout(poll, interval);
    };

    // Start polling after the first interval
    timeoutRef.current = setTimeout(poll, interval);

    return () => {
      stop();
    };
  }, [enabled, interval, stop]);

  return { stop };
}
