import { useEffect, useState } from "react";

export interface UseTransitionProps {
  duration: number;
}

export interface UseTransitionReturn {
  transitioning: boolean;
  startTransition: (newCallback?: () => void) => void;
}

export function useTransition({ duration }: UseTransitionProps) {
  const [transitioning, setTransitioning] = useState(false);
  const [callback, setCallback] = useState<{ cb?: () => void }>({
    cb: undefined,
  });
  useEffect(() => {
    if (transitioning) {
      const timeout = setTimeout(() => {
        setTransitioning(false);
        callback.cb && callback.cb();
      }, duration);
      return () => window.clearTimeout(timeout);
    }
  }, [transitioning, callback]);
  return {
    transitioning,
    startTransition: (newCallback?: () => void) => {
      setTransitioning(true);
      setCallback({ cb: newCallback });
    },
  };
}
