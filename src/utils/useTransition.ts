import { useEffect, useState } from "react";

export interface UseTransitionProps {
  duration: number;
}

export interface UseTransitionReturn {
  transitioning: boolean;
  startTransition: (waitForUser: boolean, newCallback: () => void) => void;
  endTransition: () => void;
}

/**
 * Help a component that has a transition state that is either timed or waits for a user's input.
 *
 * To start a timed transition, call startTransition with `waitForUser=false`.
 * To start a transition that waits until the user interacts use
 * `waitForUser=true` and then call `endTransition` when the transition should
 * be released.
 */
export function useTransition({
  duration,
}: UseTransitionProps): UseTransitionReturn {
  const [transitioning, setTransitioning] = useState(false);
  const [callback, setCallback] = useState<{ cb?: () => void }>({
    cb: undefined,
  });
  const [waitForUser, setWaitForUser] = useState(false);
  useEffect(() => {
    if (transitioning) {
      if (!waitForUser) {
        const timeout = setTimeout(() => {
          setTransitioning(false);
          callback.cb && callback.cb();
        }, duration);
        return () => window.clearTimeout(timeout);
      }
    } else {
    }
  }, [transitioning, waitForUser, callback]);
  return {
    transitioning,
    startTransition(waitForUser, newCallback) {
      setTransitioning(true);
      setWaitForUser(waitForUser);
      setCallback({ cb: newCallback });
    },
    endTransition() {
      // call cb if we have one
      callback.cb?.();
      setTransitioning(false);
    },
  };
}
