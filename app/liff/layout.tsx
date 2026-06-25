import type { ReactNode } from "react";

/**
 * LIFF-only layout: lock the viewport so the experience fits ONE screen with no
 * scrolling, in both portrait and landscape. (The root <body> margin is already 0.)
 */
export default function LiffLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        html, body { margin: 0; height: 100%; overflow: hidden; overscroll-behavior: none; }
      `}</style>
      {children}
    </>
  );
}
