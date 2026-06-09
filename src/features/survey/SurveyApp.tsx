"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";
import type { AssetBand, IncomeBand, ConsultWish } from "@/src/shared/branch";
import { isConsultEligible } from "@/src/shared/branch";
import { ui } from "./theme";
import { Q1_ASSETS, Q2_INCOME, Q3_CONSULT, Q3_INFO } from "./questions";
import { VideoBackground } from "./components/VideoBackground";
import { IntroVideo } from "./components/IntroVideo";
import { QuestionStep } from "./components/QuestionStep";
import { ResultScreen } from "./components/ResultScreen";

type Phase = "loading" | "intro" | "q1" | "q2" | "q3" | "submitting" | "done" | "error";

export function SurveyApp({ liffId, videoUrl }: { liffId: string; videoUrl: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [assets, setAssets] = useState<AssetBand>();
  const [income, setIncome] = useState<IncomeBand>();
  const [consult, setConsult] = useState<ConsultWish>();

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

  async function submit(finalConsult: ConsultWish) {
    if (!assets || !income) return;
    setPhase("submitting");
    try {
      const idToken = liff.getIDToken();
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, assets, income, consult: finalConsult }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  // poster image lives next to the video (same path, .jpg) — see public/*-audio.jpg
  const poster = videoUrl ? videoUrl.replace(/\.mp4$/i, ".jpg") : undefined;

  // Q3 is dynamic: consultation question for eligible respondents, otherwise the
  // "useful info?" question. Same yes/no shape, so the API re-derives the meaning.
  const q3 = assets && income && isConsultEligible(assets, income) ? Q3_CONSULT : Q3_INFO;

  // muted ambient background is shown only during the questions; the intro uses
  // the tap-to-play IntroVideo (with sound) instead.
  const showBackground = phase === "q1" || phase === "q2" || phase === "q3" || phase === "submitting";

  return (
    <main style={styles.root}>
      {showBackground && <VideoBackground src={videoUrl} />}

      {phase === "loading" && <Centered>読み込み中…</Centered>}
      {phase === "submitting" && <Centered>送信中…</Centered>}
      {phase === "error" && <Centered>エラーが発生しました。LINEから再度お試しください。</Centered>}

      {phase === "intro" && (
        <IntroVideo src={videoUrl} poster={poster} onProceed={() => setPhase("q1")} />
      )}

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
          title={q3.title}
          options={q3.options}
          selected={consult}
          onSelect={(v) => {
            setConsult(v);
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
    // permanent navy backdrop: the video layers (intro / background) are now
    // conditional, so loading / submitting / done / error screens need their
    // own dark backdrop or their light text would be invisible.
    background: ui.navyDeep,
    fontFamily: "system-ui, sans-serif",
  },
};
