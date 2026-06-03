"use client";

import { useRef, useState } from "react";
import { ui } from "../theme";

/**
 * First screen inside LIFF: the main education video as a TAP-TO-PLAY player
 * WITH SOUND. Mobile browsers block autoplay-with-audio, so we require a tap
 * (a real user gesture) before calling play() unmuted — that's what lets the
 * audio through. A poster + big ▶ button is shown until the user taps.
 *
 * After playing (or any time) the user can advance to the survey questions.
 */
export function IntroVideo({
  src,
  poster,
  onProceed,
}: {
  src: string;
  poster?: string;
  onProceed: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  const play = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    v.play()
      .then(() => setStarted(true))
      .catch(() => {
        // extremely defensive: if unmuted playback is still blocked, play muted
        v.muted = true;
        v.play().then(() => setStarted(true)).catch(() => {});
      });
  };

  return (
    <div style={styles.wrap}>
      <video
        ref={ref}
        style={styles.video}
        src={src}
        poster={poster}
        playsInline
        preload="auto"
        controls={started}
        onEnded={() => setEnded(true)}
      />

      {!started && (
        <button style={styles.playBtn} onClick={play} aria-label="動画を再生">
          <span style={styles.triangle}>▶</span>
        </button>
      )}
      {!started && <div style={styles.hint}>タップして動画を再生（音声あり）</div>}

      <button
        style={{ ...styles.cta, ...(ended ? styles.ctaReady : {}) }}
        onClick={onProceed}
      >
        アンケートへ進む ▶
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { position: "fixed", inset: 0, background: ui.navyDeep, overflow: "hidden" },
  video: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    background: ui.navyDeep,
  },
  playBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    width: 88,
    height: 88,
    borderRadius: "50%",
    background: "rgba(201,162,39,.92)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,.45)",
    zIndex: 3,
  },
  triangle: { color: ui.navyDeep, fontSize: 32, marginLeft: 6, lineHeight: 1 },
  hint: {
    position: "absolute",
    top: "calc(50% + 64px)",
    left: 0,
    right: 0,
    textAlign: "center",
    color: ui.white,
    fontSize: 13,
    fontWeight: 700,
    textShadow: "0 2px 8px rgba(0,0,0,.6)",
    zIndex: 3,
    pointerEvents: "none",
  },
  cta: {
    position: "fixed",
    bottom: "max(24px, env(safe-area-inset-bottom))",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 4,
    background: ui.gold,
    color: ui.navyDeep,
    border: "none",
    borderRadius: 999,
    padding: "14px 28px",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,.35)",
    opacity: 0.92,
  },
  // once the video has finished, make the proceed button pop
  ctaReady: {
    opacity: 1,
    transform: "translateX(-50%) scale(1.05)",
    boxShadow: "0 0 0 3px rgba(201,162,39,.35), 0 8px 22px rgba(0,0,0,.4)",
  },
};
