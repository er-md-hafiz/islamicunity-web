import { useCallback, useEffect, useRef, useState } from "react";
import { validateCoordinates } from "../../../shared/qibla.mjs";
export function useAccurateLocation(onSuccess) {
  const [state, setState] = useState({ position: null, status: "initial", error: null });
  const sequence = useRef(0), timer = useRef(), callback = useRef(onSuccess);
  callback.current = onSuccess;
  useEffect(() => () => { sequence.current++; clearTimeout(timer.current); }, []);
  const request = useCallback(() => {
    const id = ++sequence.current;
    clearTimeout(timer.current);
    if (!window.isSecureContext || !navigator.geolocation) {
      setState({ position: null, status: "error", error: "unsupported" }); return;
    }
    setState({ position: null, status: "loading", error: null });
    const fail = error => {
      if (sequence.current !== id) return;
      clearTimeout(timer.current); sequence.current++;
      setState({ position: null, status: "error", error });
    };
    timer.current = setTimeout(() => fail("timeout"), 16000);
    try {
      navigator.geolocation.getCurrentPosition(p => {
        if (sequence.current !== id) return;
        try { validateCoordinates(p.coords.latitude, p.coords.longitude); }
        catch { fail("invalid"); return; }
        clearTimeout(timer.current); sequence.current++;
        const position = { lat: p.coords.latitude, lon: p.coords.longitude,
          accuracy: Number.isFinite(p.coords.accuracy) && p.coords.accuracy >= 0 ? p.coords.accuracy : null,
          altitude: Number.isFinite(p.coords.altitude) ? p.coords.altitude : null,
          timestamp: Number.isFinite(p.timestamp) ? p.timestamp : Date.now() };
        setState({ position, status: "ready", error: null }); callback.current?.(position);
      }, error => fail(({ 1: "denied", 2: "unavailable", 3: "timeout" })[error.code] || "unavailable"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    } catch { fail("unavailable"); }
  }, []);
  return { ...state, request };
}
