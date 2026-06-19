import { useCallback, useEffect, useRef, useState } from "react";

type WakeLockSentinelLike = {
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const [status, setStatus] = useState<"active" | "unsupported" | "released" | "blocked">("released");

  const requestWakeLock = useCallback(async () => {
    const nav = navigator as NavigatorWithWakeLock;
    if (!nav.wakeLock) {
      setStatus("unsupported");
      return;
    }

    try {
      sentinelRef.current = await nav.wakeLock.request("screen");
      sentinelRef.current.addEventListener("release", () => setStatus("released"));
      setStatus("active");
    } catch {
      setStatus("blocked");
    }
  }, []);

  useEffect(() => {
    requestWakeLock();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && status !== "active") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      sentinelRef.current?.release().catch(() => undefined);
    };
  }, [requestWakeLock, status]);

  return status;
}
