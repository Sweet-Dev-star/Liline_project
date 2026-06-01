"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import type { AssetBand, IncomeBand, Stance } from "@/src/shared/branch";
import { ui } from "./theme";
import { Q1_ASSETS, Q2_INCOME, Q3_STANCE } from "./questions";
import { VideoBackground } from "./components/VideoBackground";
import { IntroOverlay } from "./components/IntroOverlay";
import { QuestionStep } from "./components/QuestionStep";
import { ResultScreen } from "./components/ResultScreen";

type Phase = "loading" | "intro" | "q1" | "q2" | "q3" | "submitting" | "done" | "error";

export function SurveyApp({ liffId, videoUrl }: { liffId: string; videoUrl: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [assets, setAssets] = useState<AssetBand>();
  const [income, setIncome] = useState<IncomeBand>();
  const [stance, setStance] = useState<Stance>();

  useEffect(() => {
    (async () => {
      try {
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }
        setPhase("intro");
      } catch {
        setPhase("error");
      }
    })();
  }, [liffId]);

  async function submit(finalStance: Stance) {
    if (!assets || !income) return;
    setPhase("submitting");
    try {
      const idToken = liff.getIDToken();
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, assets, income, stance: finalStance }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  return (
    <main style={styles.root}>
      <VideoBackground src={videoUrl} />

      {phase === "loading" && <Centered>読み込み中…</Centered>}
      {phase === "submitting" && <Centered>送信中…</Centered>}
      {phase === "error" && <Centered>エラーが発生しました。LINEから再度お試しください。</Centered>}

      {phase === "intro" && <IntroOverlay onStart={() => setPhase("q1")} />}

      {phase === "q1" && (
        <QuestionStep
          index={1}
          total={3}
          title={Q1_ASSETS.title}
          options={Q1_ASSETS.options}
          selected={assets}
          onSelect={(v) => {
            setAssets(v);
            setPhase("q2");
          }}
        />
      )}
      {phase === "q2" && (
        <QuestionStep
          index={2}
          total={3}
          title={Q2_INCOME.title}
          options={Q2_INCOME.options}
          selected={income}
          onSelect={(v) => {
            setIncome(v);
            setPhase("q3");
          }}
        />
      )}
      {phase === "q3" && (
        <QuestionStep
          index={3}
          total={3}
          title={Q3_STANCE.title}
          options={Q3_STANCE.options}
          selected={stance}
          onSelect={(v) => {
            setStance(v);
            submit(v);
          }}
        />
      )}

      {phase === "done" && <ResultScreen onClose={() => liff.closeWindow()} />}
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
        boxSizing: "border-box",
        color: ui.white,
      }}
    >
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // fixed to the viewport so the LIFF never scrolls (portrait or landscape)
  root: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    fontFamily: "system-ui, sans-serif",
  },
};
