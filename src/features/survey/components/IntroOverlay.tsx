"use client";

import { ui } from "../theme";

/**
 * First screen inside LIFF. The background video is the focus, so the survey
 * CTA is parked in the TOP-RIGHT corner rather than centered over the video.
 */
export function IntroOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div style={styles.layer}>
      <button style={styles.cta} onClick={onStart}>
        Q3アンケートへ進む ▶
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layer: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    pointerEvents: "none", // let the (muted) video area stay unobstructed
  },
  cta: {
    pointerEvents: "auto",
    position: "fixed",
    top: "max(16px, env(safe-area-inset-top))",
    right: "max(16px, env(safe-area-inset-right))",
    zIndex: 2,
    background: ui.gold,
    color: ui.navyDeep,
    border: "none",
    borderRadius: 999,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,.35)",
  },
};
