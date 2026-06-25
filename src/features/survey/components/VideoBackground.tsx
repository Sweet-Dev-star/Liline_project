"use client";

import { useEffect, useRef, useState } from "react";
import { ui } from "../theme";

/**
 * Fullscreen muted, looping, autoplaying background video with a dark overlay.
 * Mobile autoplay REQUIRES muted + playsInline.
 *
 * The native "play" icon must NEVER show. So a navy curtain covers the video
 * until playback genuinely starts (the `playing` event). If autoplay is blocked
 * by the device, we keep retrying play() — and the curtain stays up (showing a
 * clean navy screen) rather than exposing a paused video with a play button.
 */
export function VideoBackground({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;

    let cancelled = false;
    const tryPlay = () => {
      v.play().catch(() => {
        // autoplay blocked — retry shortly (keeps curtain up meanwhile)
        if (!cancelled) setTimeout(tryPlay, 400);
      });
    };
    tryPlay();
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div style={styles.wrap}>
      {src && (
        <video
          ref={videoRef}
          style={styles.video}
          src={src}
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
        />
      )}
      {/* curtain covers the video until it's genuinely playing (no play-icon flash) */}
      <div style={{ ...styles.curtain, opacity: playing ? 0 : 1 }} />
      <div style={styles.overlay} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: ui.navyDeep },
  video: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    pointerEvents: "none",
  },
  curtain: {
    position: "absolute",
    inset: 0,
    background: ui.navyDeep,
    transition: "opacity .5s ease",
    pointerEvents: "none",
  },
  overlay: { position: "absolute", inset: 0, background: ui.overlay },
};
