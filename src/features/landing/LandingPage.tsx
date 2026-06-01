"use client";

import { useEffect } from "react";
import "./landing.css";

const LINE_ADD_URL = "https://line.me/R/ti/p/@169yaiam";

export function LandingPage() {
  // scroll-reveal: add .in when elements enter the viewport
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp">
      {/* ---------- HERO ---------- */}
      <header className="lp-hero">
        <p className="lp-eyebrow">TAX STRATEGY LAB</p>
        <div className="lp-rule" />
        <h1 className="lp-h1">
          税理士が警告する、<br />
          <span className="accent">富裕層の資産防衛</span>の盲点
        </h1>
        <p className="lp-sub">
          資産規模が一定を超えると、これまでの「貯める・増やす」だけでは守り切れません。
          税務と運用の両面から、あなたに最適な“次の一手”を無料で診断します。
        </p>
        <a className="lp-cta" href={LINE_ADD_URL}>LINEで無料診断を受け取る</a>
        <p className="lp-cta-note">所要わずか30秒・3つの質問に答えるだけ</p>
        <div className="lp-scroll" />
      </header>

      {/* ---------- PROBLEM ---------- */}
      <section className="lp-sec">
        <p className="kicker reveal">PROBLEM</p>
        <h2 className="reveal">こんな“見えないリスク”はありませんか</h2>
        <p className="lp-lead reveal">
          多忙な経営者・資産家ほど、資産の最適化は後回しになりがちです。気づかぬうちに、大きな差が生まれています。
        </p>
        <div className="lp-grid">
          <div className="lp-card reveal"><div className="num">01</div><h3>税負担の最適化</h3><p>本業に集中するあまり、合法的に圧縮できる税が放置されていませんか。</p></div>
          <div className="lp-card reveal"><div className="num">02</div><h3>運用の機会損失</h3><p>「なんとなく」の運用で、本来得られたはずのリターンを逃していませんか。</p></div>
          <div className="lp-card reveal"><div className="num">03</div><h3>守りの設計不足</h3><p>増やすことばかりで、資産を“守り抜く”設計が後回しになっていませんか。</p></div>
        </div>
      </section>

      {/* ---------- FLOW ---------- */}
      <section className="lp-band">
        <div className="lp-sec">
          <p className="kicker reveal">HOW IT WORKS</p>
          <h2 className="reveal">最適な一手が分かるまで、たった3ステップ</h2>
          <div className="lp-flow">
            <div className="lp-step reveal"><div className="idx">1</div><span>LINEで友だち追加（無料）</span></div>
            <div className="lp-arrow reveal">▼</div>
            <div className="lp-step reveal"><div className="idx">2</div><span>動画を視聴し、3つの質問に回答</span></div>
            <div className="lp-arrow reveal">▼</div>
            <div className="lp-step reveal"><div className="idx">3</div><span>あなたに最適なご案内が届く</span></div>
          </div>
        </div>
      </section>

      {/* ---------- OUTCOMES ---------- */}
      <section className="lp-sec">
        <p className="kicker reveal">FOR YOU</p>
        <h2 className="reveal">あなたに合った“出口”をご用意</h2>
        <div className="lp-out">
          <div className="lp-out-card reveal">
            <span className="tag">EXCLUSIVE</span>
            <h3>全資産の最適化コンサル</h3>
            <p>一定基準を満たす方へ。超一流のプロに、税務と運用を横断した資産防衛を託す道。</p>
          </div>
          <div className="lp-out-card reveal">
            <span className="tag">GATEWAY</span>
            <h3>本物の富裕層への登竜門</h3>
            <p>これから資産を築く方へ。金融機関の“カモ”にならない、一生モノの教養を学ぶ道。</p>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="lp-final">
        <p className="kicker reveal" style={{ color: "#E7C45A" }}>START NOW</p>
        <h2 className="reveal">まずは、あなたの“今”を知ることから。</h2>
        <p className="lp-lead reveal" style={{ color: "#C7CDD6" }}>
          診断は無料、しつこい勧誘は一切ありません。30秒で、あなたに最適な次の一歩が見つかります。
        </p>
        <div className="reveal" style={{ marginTop: 36 }}>
          <a className="lp-cta" href={LINE_ADD_URL}>LINEで無料診断を受け取る</a>
        </div>
      </section>

      <footer className="lp-foot">
        © TAX STRATEGY LAB　|　【公式】ゆか姉 | TAX LAB
      </footer>
    </div>
  );
}
