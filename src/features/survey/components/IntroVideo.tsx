"use client";

import { useEffect, useRef, useState } from "react";
import { ui } from "../theme";

/**
 * First screen inside LIFF: the main education video that AUTO-PLAYS as soon as
 * the LIFF opens (i.e. right after the greeting-card button is tapped).
 *
 * Mobile browsers block autoplay *with sound* (the tap happened in the LINE
 * chat, not in this page), so we autoplay MUTED and show a prominent one-tap
 * "音声をオン" control. Tapping it is a real in-page gesture, so the sound turns
 * on immediately. On permissive webviews we try sound-on first and skip the pill.
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
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);

  // autoplay on open: try with sound, fall back to muted autoplay if blocked
  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    let cancelled = false;

    const start = async () => {
      try {
        v.muted = false;
        v.volume = 1;
        await v.play();
        if (!cancelled) setMuted(false);
      } catch {
        try {
          v.muted = true;
          await v.play();
          if (!cancelled) setMuted(true);
        } catch {
          /* extremely rare: user can tap the sound button to start */
        }
      }
    };
    start();
    return () => {
      cancelled = true;
    };
  }, [src]);

  const enableSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    v.play().catch(() => {});
    setMuted(false);
  };

  return (
    <div style={styles.wrap}>
      <video
        ref={ref}
        style={styles.video}
        src={src}
        poster={poster}
        muted
        playsInline
        preload="auto"
        controls={!muted}
        onEnded={() => setEnded(true)}
      />

      {/* one-tap sound enable (only while muted) */}
      {muted && (
        <button style={styles.sound} onClick={enableSound} aria-label="音声をオンにする">
          🔊 タップで音声をオン
        </button>
      )}

      {/* compact survey CTA */}
      <button style={{ ...styles.cta, ...(ended ? styles.ctaReady : {}) }} onClick={onProceed}>
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
  sound: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    zIndex: 3,
    background: "rgba(10,19,32,.72)",
    color: ui.white,
    border: `1px solid ${ui.gold}`,
    borderRadius: 999,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    WebkitBackdropFilter: "blur(2px)",
    backdropFilter: "blur(2px)",
    boxShadow: "0 6px 18px rgba(0,0,0,.4)",
  },
  // compact, well-proportioned pill (was 14px/28px·15px — too large)
  cta: {
    position: "fixed",
    bottom: "max(18px, env(safe-area-inset-bottom))",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 4,
    background: ui.gold,
    color: ui.navyDeep,
    border: "none",
    borderRadius: 999,
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: ".02em",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,0,0,.3)",
    opacity: 0.95,
  },
  ctaReady: {
    opacity: 1,
    boxShadow: "0 0 0 2px rgba(201,162,39,.4), 0 6px 18px rgba(0,0,0,.45)",
  },
};
