import React, { ReactNode, useMemo } from "react";

export interface AudioCacheContext {
  getCachedAudio: (key: string) => HTMLAudioElement | undefined;
}

export const audioCacheContext = React.createContext<AudioCacheContext>({
  getCachedAudio() {
    return undefined;
  },
});

export function AudioCacheProvider({
  audioUrls,
  children,
}: {
  audioUrls: string[];
  children: ReactNode;
}) {
  const cache = useMemo(
    () => Object.fromEntries(audioUrls.map((url) => [url, new Audio(url)])),
    [audioUrls]
  );

  return (
    <audioCacheContext.Provider
      value={{
        getCachedAudio(url) {
          const hit = cache[url];
          console.log(
            "Audio looked up",
            url,
            "found in cache?",
            hit !== undefined
          );
          return hit;
        },
      }}
    >
      {children}
    </audioCacheContext.Provider>
  );
}
