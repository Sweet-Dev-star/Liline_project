"use client";

import { ui } from "../theme";

/** Shown after submit — the actual branch CTA is delivered in the LINE chat (push). */
export function ResultScreen({ onClose }: { onClose: () => void }) {
  return (
    <div style={styles.center}>
      <p style={styles.eyebrow}>THANK YOU</p>
      <h2 style={styles.title}>ご回答ありがとうございます</h2>
      <p style={styles.lead}>
        あなたに最適なご案内を、
        <br />
        LINEのトークにお送りしました。
      </p>
      <button style={styles.cta} onClick={onClose}>
        トークに戻る
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  center: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "32px 24px",
    boxSizing: "border-box",
    color: ui.white,
  },
  eyebrow: { color: ui.gold, letterSpacing: 4, fontSize: 12, fontWeight: 700, margin: 0 },
  title: { fontSize: 22, fontWeight: 800, margin: "14px 0 0" },
  lead: { color: ui.mutedOnDark, fontSize: 14, lineHeight: 1.9, margin: "16px 0 32px" },
  cta: {
    background: ui.gold,
    color: ui.navyDeep,
    border: "none",
    borderRadius: 999,
    padding: "14px 32px",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
  },
};
