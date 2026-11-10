import { getSurahAudioUrl } from "./audio-source.mjs";

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];
export class QuranAudioController {
  constructor({
    audioFactory = () => new Audio(),
    timeout = 20000,
    isOnline = () =>
      typeof navigator === "undefined" || navigator.onLine !== false,
  } = {}) {
    this.audioFactory = audioFactory;
    this.timeout = timeout;
    this.isOnline = isOnline;
    this.listeners = new Set();
    this.audio = null;
    this.handlers = [];
    this.sequence = 0;
    this.playRequest = 0;
    this.timer = null;
    this.disposed = false;
    this.lastVolume = 1;
    this.state = {
      number: 1,
      status: "idle",
      playing: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: false,
      rate: 1,
      autoNext: false,
      error: null,
    };
    this.subscribe = (callback) => {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    };
    this.getSnapshot = () => this.state;
  }
  emit(patch) {
    if (
      this.disposed ||
      !Object.keys(patch).some((key) => this.state[key] !== patch[key])
    )
      return;
    this.state = { ...this.state, ...patch };
    for (const callback of this.listeners) callback();
  }
  clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
  startTimer() {
    // Repeated waiting/stalled events must not extend one load indefinitely.
    if (this.timer) return;
    const sequence = this.sequence;
    this.timer = setTimeout(() => {
      if (sequence === this.sequence) this.fail("timeout");
    }, this.timeout);
  }
  release() {
    this.clearTimer();
    this.sequence++;
    this.playRequest++;
    if (!this.audio) return;
    for (const [event, handler] of this.handlers)
      this.audio.removeEventListener(event, handler);
    this.handlers = [];
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.audio = null;
  }
  createMedia() {
    const audio = this.audioFactory(),
      sequence = ++this.sequence;
    audio.preload = "none";
    audio.volume = this.state.volume;
    audio.muted = this.state.muted;
    audio.playbackRate = this.state.rate;
    this.audio = audio;
    const on = (name, handler) => {
      const guarded = () => {
        if (
          this.audio === audio &&
          sequence === this.sequence &&
          !this.disposed
        )
          handler();
      };
      audio.addEventListener(name, guarded);
      this.handlers.push([name, guarded]);
    };
    on("loadedmetadata", () =>
      this.emit({
        duration:
          Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : 0,
        currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      }),
    );
    on("durationchange", () =>
      this.emit({
        duration:
          Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : 0,
      }),
    );
    on("canplay", () => {
      this.clearTimer();
      if (this.state.status === "loading" && !this.state.playing)
        this.startTimer();
      else if (!this.state.playing) this.emit({ status: "paused" });
    });
    on("play", () =>
      this.emit({
        playing: true,
        status: audio.readyState >= 3 ? "playing" : "loading",
        error: null,
      }),
    );
    on("playing", () => {
      this.clearTimer();
      this.emit({ playing: true, status: "playing", error: null });
    });
    on("pause", () => {
      this.clearTimer();
      if (this.state.status !== "error" && this.state.status !== "ended")
        this.emit({ playing: false, status: "paused" });
    });
    on("timeupdate", () =>
      this.emit({
        currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      }),
    );
    on("waiting", () => {
      if (!this.state.playing && this.state.status !== 'loading') return;
      this.emit({ status: "loading" });
      this.startTimer();
    });
    on("stalled", () => {
      if (this.state.playing || this.state.status === "loading")
        this.startTimer();
    });
    on("seeking", () => {
      if (this.state.playing) {
        this.emit({ status: "loading" });
        this.startTimer();
      }
    });
    on("seeked", () => {
      this.clearTimer();
      this.emit({
        currentTime: audio.currentTime,
        status: audio.paused ? "paused" : "playing",
      });
    });
    on("volumechange", () =>
      this.emit({ volume: audio.volume, muted: audio.muted }),
    );
    on("ratechange", () => this.emit({ rate: audio.playbackRate }));
    on("ended", () => {
      this.clearTimer();
      this.emit({
        playing: false,
        status: "ended",
        currentTime: this.state.duration,
      });
      if (this.state.autoNext && this.state.number < 114) {
        this.select(this.state.number + 1);
        void this.play();
      }
    });
    on("error", () =>
      this.fail(
        !this.isOnline()
          ? "offline"
          : audio.error?.code === 4
            ? "unsupported"
            : "network",
      ),
    );
    return audio;
  }
  select(number) {
    getSurahAudioUrl(number);
    if (this.disposed) return;
    this.release();
    this.emit({
      number,
      status: "idle",
      playing: false,
      currentTime: 0,
      duration: 0,
      error: null,
    });
  }
  async play() {
    if (this.disposed) return;
    if (!this.isOnline()) {
      this.fail("offline");
      return;
    }
    let audio = this.audio;
    if (!audio) {
      try {
        audio = this.createMedia();
        audio.src = getSurahAudioUrl(this.state.number);
        audio.load();
        // Some WebViews reset the rate on load.
        audio.playbackRate = this.state.rate;
      } catch {
        this.fail("unsupported");
        return;
      }
    }
    if (this.state.status === "ended") audio.currentTime = 0;
    const sequence = this.sequence,
      request = ++this.playRequest;
    this.emit({ status: "loading", error: null });
    this.startTimer();
    try {
      const promise = audio.play();
      if (promise?.then) await promise;
    } catch (error) {
      if (
        this.disposed ||
        sequence !== this.sequence ||
        request !== this.playRequest
      )
        return;
      this.fail(
        error.name === "NotAllowedError"
          ? "blocked"
          : error.name === "NotSupportedError"
            ? "unsupported"
            : !this.isOnline()
              ? "offline"
              : "interrupted",
      );
    }
  }
  pause() {
    this.playRequest++;
    this.clearTimer();
    this.audio?.pause();
    this.emit({
      playing: false,
      status: this.state.status === "error" ? "error" : "paused",
    });
  }
  retry() {
    this.release();
    this.emit({
      currentTime: 0,
      duration: 0,
      playing: false,
      error: null,
      status: "idle",
    });
    return this.play();
  }
  previous() {
    if (this.state.number > 1) this.select(this.state.number - 1);
  }
  next() {
    if (this.state.number < 114) this.select(this.state.number + 1);
  }
  seek(value) {
    if (
      !this.audio ||
      this.audio.readyState < 1 ||
      !this.state.duration ||
      !Number.isFinite(value)
    )
      return false;
    try {
      this.audio.currentTime = Math.max(
        0,
        Math.min(value, this.state.duration),
      );
      this.emit({ currentTime: this.audio.currentTime });
      return true;
    } catch {
      return false;
    }
  }
  setVolume(value) {
    if (!Number.isFinite(value)) return;
    const volume = Math.max(0, Math.min(1, value));
    if (volume > 0) this.lastVolume = volume;
    this.emit({ volume, muted: volume === 0 });
    if (this.audio) {
      this.audio.volume = volume;
      this.audio.muted = volume === 0;
    }
  }
  toggleMute() {
    const muted = !this.state.muted,
      volume =
        !muted && this.state.volume === 0 ? this.lastVolume : this.state.volume;
    this.emit({ muted, volume });
    if (this.audio) {
      this.audio.muted = muted;
      this.audio.volume = volume;
    }
  }
  setRate(rate) {
    if (!PLAYBACK_RATES.includes(rate)) return;
    this.emit({ rate });
    if (this.audio) this.audio.playbackRate = rate;
  }
  setAutoNext(value) {
    this.emit({ autoNext: Boolean(value) });
  }
  fail(error) {
    this.release();
    this.emit({
      status: "error",
      error,
      playing: false,
      duration: 0,
      currentTime: 0,
    });
  }
  offline() {
    if (this.audio) this.fail("offline");
  }
  dispose() {
    this.release();
    this.listeners.clear();
    this.disposed = true;
  }
}
