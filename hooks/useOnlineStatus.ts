"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect online/offline status
 * 
 * Returns the current online status and updates when connectivity changes.
 * Useful for showing offline indicators or disabling features when offline.
 * 
 * @returns Object with `isOnline` boolean indicating current connectivity status
 * 
 * @example
 * ```tsx
 * const { isOnline } = useOnlineStatus();
 * 
 * return (
 *   <div>
 *     {!isOnline && <div>You're offline</div>}
 *   </div>
 * );
 * ```
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}

