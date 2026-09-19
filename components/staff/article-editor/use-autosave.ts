import { useEffect, useRef, useState } from "react";

export const AUTOSAVE_INTERVAL_MS = 5000;

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave(params: {
  dirtyWatch: readonly unknown[];
  initialLastSavedAt: Date | null;
}) {
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    params.initialLastSavedAt,
  );

  const isDirtyRef = useRef(false);
  const blockedRef = useRef(false);
  const isFirstDirtyEffectRun = useRef(true);

  const runAutosaveRef = useRef<() => Promise<void>>(async () => {});
  const setRunAutosave = (fn: () => Promise<void>) => {
    runAutosaveRef.current = fn;
  };

  useEffect(() => {
    if (isFirstDirtyEffectRun.current) {
      isFirstDirtyEffectRun.current = false;
      return;
    }
    isDirtyRef.current = true;
    blockedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, params.dirtyWatch);

  const markDirty = () => {
    isDirtyRef.current = true;
    blockedRef.current = false;
  };
  const markClean = () => {
    isDirtyRef.current = false;
  };
  const isDirty = () => isDirtyRef.current;

  const markBlocked = () => {
    blockedRef.current = true;
  };
  const isBlocked = () => blockedRef.current;

  useEffect(() => {
    const timer = setInterval(() => {
      void runAutosaveRef.current();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const flush = () => {
      if (document.hidden) void runAutosaveRef.current();
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return {
    isDirty,
    markDirty,
    markClean,
    isBlocked,
    markBlocked,
    autosaveStatus,
    setAutosaveStatus,
    lastSavedAt,
    setLastSavedAt,
    setRunAutosave,
  };
}
