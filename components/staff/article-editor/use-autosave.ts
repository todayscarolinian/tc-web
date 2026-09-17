import { useEffect, useRef, useState } from "react";

export const AUTOSAVE_INTERVAL_MS = 5000;

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Owns the article editor's autosave state machine: tracks whether the draft
 * is dirty, fires a save on a fixed interval and whenever the tab is hidden,
 * and warns before an unload that would lose unsaved changes.
 *
 * The hook doesn't perform the save itself — the caller's save function
 * closes over form state the hook has no access to (title, body, author,
 * etc.), so it can't live here. Instead the caller must call
 * `setRunAutosave` with its latest save closure on every render; the
 * interval/visibility effects below call through that ref so they can
 * mount once yet still always invoke the current closure.
 *
 * @param dirtyWatch - Values that mark the draft dirty when any of them
 * change (title, section, tags, ...). Passed straight through as a
 * `useEffect` dependency list.
 * @param initialLastSavedAt - Seed for `lastSavedAt`, e.g. an existing
 * article's `updatedAt`.
 *
 * @returns `isDirty`/`markDirty`/`markClean` to read and update dirty state
 * (wire `markDirty` to the editor's onUpdate); `autosaveStatus`/`lastSavedAt`
 * plus their setters, for the caller to report save outcomes; and
 * `setRunAutosave`, which the caller must call every render as described
 * above.
 */
export function useAutosave(params: {
  dirtyWatch: readonly unknown[];
  initialLastSavedAt: Date | null;
}) {
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    params.initialLastSavedAt,
  );

  const isDirtyRef = useRef(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, params.dirtyWatch);

  const markDirty = () => {
    isDirtyRef.current = true;
  };
  const markClean = () => {
    isDirtyRef.current = false;
  };
  const isDirty = () => isDirtyRef.current;

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
    autosaveStatus,
    setAutosaveStatus,
    lastSavedAt,
    setLastSavedAt,
    setRunAutosave,
  };
}
