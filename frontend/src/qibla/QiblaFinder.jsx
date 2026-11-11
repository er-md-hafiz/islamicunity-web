import React, { useMemo, useRef, useEffect, useState } from "react";
import { Compass, LocateFixed, RotateCcw } from "lucide-react";
import { bearing, normalizeAngle, relativeQibla, unwrapAngle } from "../../../shared/qibla.mjs";
import { magneticCorrection, magneticToTrue } from "./magnetic-model.mjs";
import { useCompass } from "./useCompass";
import { qiblaCopy, locationErrors, sensorMessages } from "./qibla-copy";
import "./qibla.css";

function CompassDial({ angle, heading, live }) {
  const previous = useRef({ angle: null, heading: null, live });
  if (previous.current.live !== live) previous.current = { angle: null, heading: null, live };
  const arrow = angle === null ? null : unwrapAngle(previous.current.angle, angle);
  const north = unwrapAngle(previous.current.heading, -(heading ?? 0));
  previous.current = { angle: arrow, heading: north, live };
  return <svg className="qf-dial" viewBox="0 0 240 240" role="img" aria-label={angle === null ? "Compass awaiting location" : live ? "Live Qibla arrow relative to screen top" : "Manual Qibla bearing: align N with true north"} data-mode={live ? "live" : angle === null ? "initial" : "manual"}>
    <circle cx="120" cy="120" r="113" fill="none" className="qf-rim" />
    <circle cx="120" cy="120" r="82" fill="none" className="qf-inner" />
    <g className="qf-north-ring" style={{ transform: `rotate(${north}deg)` }} data-angle={north}>
      {Array.from({ length: 24 }, (_, n) => <line key={n} x1="120" y1="10" x2="120" y2={n % 6 === 0 ? "20" : "15"} transform={`rotate(${n * 15} 120 120)`} className="qf-tick" />)}
      <text x="120" y="40" className="qf-north">N</text><text x="205" y="125">E</text><text x="120" y="211">S</text><text x="35" y="125">W</text>
    </g>
    {arrow !== null && <g className="qf-needle" style={{ transform: `rotate(${arrow}deg)` }} data-angle={arrow}>
      <path d="M120 55 135 144 120 133 105 144Z" fill="#ebb53f" /><path d="M120 180 110 142 120 148 130 142Z" fill="#b7c8bf" />
      <rect x="111" y="31" width="18" height="18" rx="2" fill="#172e25" /><path d="M111 37h18" stroke="#ebb53f" strokeWidth="3" />
    </g>}
    <circle cx="120" cy="120" r="6" fill="#064635" stroke="#ebb53f" strokeWidth="2" />
  </svg>;
}

export default function QiblaFinder({ location, language = "en", expanded = false, onOpen }) {
  const copy = qiblaCopy(language), sensor = useCompass();
  const [reference, setReference] = useState("auto");
  const [time, setTime] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setTime(Date.now()), 10000); return () => clearInterval(timer); }, []);
  const position = location.position;
  const date = new Date(time).toISOString().slice(0, 10);
  const correction = useMemo(() => position ? magneticCorrection(position, new Date(date + "T12:00:00Z")) : null, [position, date]);
  const qibla = position ? bearing(position.lat, position.lon) : null;
  const staleLocation = position && time - position.timestamp > 300000;
  const northReference = reference === "auto" ? sensor.reading?.reference : reference;
  const raw = sensor.reading?.heading;
  const trueHeading = sensor.status !== "ready" || !position || staleLocation ? null
    : northReference === "true" ? normalizeAngle(raw)
    : northReference === "magnetic" && correction?.available ? magneticToTrue(raw, correction.declination) : null;
  const live = Number.isFinite(trueHeading) && Number.isFinite(qibla);
  const angle = qibla === null ? null : live ? relativeQibla(qibla, trueHeading) : qibla;
  const Title = expanded ? "h1" : "h2";
  return <section className={`qf card qibla-card ${expanded ? "expanded" : ""}`} aria-labelledby={expanded ? "qf-title" : "qf-preview-title"}>
    <header className="qf-heading"><div><Title id={expanded ? "qf-title" : "qf-preview-title"}><Compass size={20} />{copy.title}</Title><p>{copy.subtitle}</p></div><span className="qf-makkah">MAKKAH</span></header>
    <div className="qf-main"><CompassDial angle={angle} heading={live ? trueHeading : null} live={live} />
      <div className="qf-bearing"><strong className="bearing">{qibla === null ? "—" : qibla.toFixed(1)}<span>°</span></strong><p>{copy.north}</p>{qibla !== null && <span className={`qf-mode ${live ? "is-live" : ""}`}>{live ? copy.live : copy.manual}</span>}
        <button className="qf-button" onClick={expanded ? location.request : onOpen} disabled={location.status === "loading"}><LocateFixed size={17} />{location.status === "loading" ? copy.locating : expanded ? position ? copy.refresh : location.error ? copy.retry : copy.find : copy.find}</button>
      </div>
    </div>
    {location.status === "initial" && <p className="qf-note">{copy.initial}</p>}
    {location.status === "loading" && <p className="qf-note" role="status">{copy.locating}</p>}
    {location.error && <p className="qf-warning" role="alert">{locationErrors[location.error]}</p>}
    {position && <p className="helper qf-location">{copy.location}: {position.lat.toFixed(4)}°, {position.lon.toFixed(4)}° · {position.accuracy === null ? "Location accuracy not reported" : `Location uncertainty ±${Math.round(position.accuracy)} m`}
      <br />Captured {new Date(position.timestamp).toLocaleTimeString(language)}. Refresh if you have moved.</p>}
    {position && position.accuracy > 100 && <p className="qf-warning">Location uncertainty is high. Retry in an open area before relying on this bearing.</p>}
    {staleLocation && <p className="qf-warning">This location is over five minutes old. Live direction is paused; refresh your location.</p>}
    {position && qibla === null && <p className="qf-warning">No unique Qibla bearing exists at these coordinates (at the Kaaba or its antipode).</p>}
    {expanded && <div className="qf-controls">
      <p className="qf-note">{live ? "The gold arrow points toward Qibla relative to the top of this screen. Live assistance is not a guarantee of sensor accuracy." : "Manual mode: align N with independently established TRUE north, then follow the gold arrow. A calculated bearing is not a live compass."}</p>
      <button className="qf-button qf-secondary" onClick={sensor.enable} disabled={!position || location.status === "loading"}><Compass size={17} />{copy.enable}</button>
      <p className="qf-sensor-status" role="status">{sensorMessages[sensor.status] || (live ? "Live compass reading received." : "Heading received; confirm the north reference below before enabling live direction.")}</p>
      {sensor.reading && <>
        <label className="qf-reference">{copy.reference}<select value={reference} onChange={e => setReference(e.target.value)} aria-label={copy.reference}>
          <option value="auto">{sensor.reading.reference === "magnetic" ? "WebKit magnetic north" : copy.unknown}</option><option value="magnetic">{copy.magnetic}</option><option value="true">{copy.true}</option>
        </select></label>
        <p className="qf-note">Standard orientation events do not identify their north reference. Confirm against your device/browser documentation; do not guess. Already corrected true headings must not receive a second magnetic correction.</p>
        <p className="qf-note">Sensor-reported heading uncertainty: {sensor.reading.accuracy === null ? "not available" : `±${sensor.reading.accuracy.toFixed(0)}°`}.</p>
      </>}
      {position && <p className={correction?.available ? "qf-note" : "qf-warning"}>{correction?.available
        ? `Offline ${correction.model}: ${Math.abs(correction.declination).toFixed(2)}° ${correction.declination >= 0 ? "east" : "west"} declination · ${correction.date}.${correction.seaLevel ? " Altitude not reported; sea-level estimate used." : ""}`
        : "Magnetic correction unavailable (model date, altitude or weak-field limits). Magnetic live direction is disabled; use manual true-north alignment."}</p>}
      <details className="qf-calibration"><summary>Calibration & device guidance</summary><p>Keep the phone flat, screen facing up. Move away from magnets, metal, cars and speakers. Make a figure-eight motion if readings are unstable, then restart readings. This restarts the web sensor; it cannot calibrate the hardware itself.</p><p>Android WebView needs native location/runtime permissions, geolocation enabled and a host geolocation callback. Orientation support depends on the device and WebView. On iOS, allow motion/orientation permission after tapping Enable. Browser permission alone does not guarantee sensor access.</p></details>
      <button className="qf-button qf-secondary" onClick={sensor.enable} disabled={!position}><RotateCcw size={16} />{copy.recalibrate}</button>
    </div>}
  </section>;
}
