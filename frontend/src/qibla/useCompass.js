import { useCallback, useEffect, useRef, useState } from "react";
import { angleDelta, orientationHeading, unwrapAngle } from "../../../shared/qibla.mjs";
export function useCompass() {
  const [state, setState] = useState({ status: "initial", reading: null });
  const cleanup = useRef(() => {}), sequence = useRef(0);
  const stop = useCallback(() => { sequence.current++; cleanup.current(); cleanup.current = () => {}; }, []);
  useEffect(() => () => stop(), [stop]);
  const enable = useCallback(async () => {
    stop(); const id = sequence.current;
    setState({ status: "waiting", reading: null });
    if (!window.isSecureContext || typeof window.DeviceOrientationEvent === "undefined") { setState({ status: "unsupported", reading: null }); return; }
    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function"
        && await DeviceOrientationEvent.requestPermission(true) !== "granted") {
        if (sequence.current === id) setState({ status: "denied", reading: null }); return;
      }
    } catch { if (sequence.current === id) setState({ status: "denied", reading: null }); return; }
    if (sequence.current !== id) return;
    let timer, last = null, lastTime = 0, lastSource = null;
    const arm = (delay, status) => { clearTimeout(timer); timer = setTimeout(() => { last = null; setState({ status, reading: null }); }, delay); };
    const listener = event => {
      if (sequence.current !== id) return;
      const reading = orientationHeading(event, window.screen.orientation?.angle ?? window.orientation ?? 0);
      if (reading.error === "relative") return;
      if (reading.error) { last = null; setState({ status: reading.error, reading: null }); arm(4000, "stale"); return; }
      const now = performance.now();
      if (last !== null && now - lastTime < 75) return;
      if (lastSource !== reading.reference) last = null;
      if (last !== null && Math.abs(angleDelta(last, reading.heading)) > 80 && now - lastTime < 120) {
        last = null; setState({ status: "unreliable", reading: null }); return;
      }
      const target = unwrapAngle(last, reading.heading);
      last = last === null ? target : last + (target - last) * Math.min(1, (now - lastTime) / 160);
      lastTime = now; lastSource = reading.reference;
      setState({ status: "ready", reading: { ...reading, heading: last } }); arm(3500, "stale");
    };
    const rotation = () => { last = null; setState({ status: "waiting", reading: null }); arm(4000, "stale"); };
    const visibility = () => { if (document.hidden) { stop(); setState({ status: "paused", reading: null }); } };
    const calibrate = () => { last = null; setState({ status: "unreliable", reading: null }); };
    window.addEventListener("deviceorientationabsolute", listener);
    window.addEventListener("deviceorientation", listener);
    window.addEventListener("orientationchange", rotation);
    window.addEventListener("compassneedscalibration", calibrate);
    window.screen.orientation?.addEventListener?.("change", rotation);
    document.addEventListener("visibilitychange", visibility);
    arm(5000, "unsupported");
    cleanup.current = () => {
      clearTimeout(timer);
      window.removeEventListener("deviceorientationabsolute", listener);
      window.removeEventListener("deviceorientation", listener);
      window.removeEventListener("orientationchange", rotation);
      window.removeEventListener("compassneedscalibration", calibrate);
      window.screen.orientation?.removeEventListener?.("change", rotation);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [stop]);
  return { ...state, enable };
}
