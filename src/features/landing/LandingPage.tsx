"use client";

import { useEffect } from "react";
import "./landing.css";
import { SiteNav } from "./SiteNav";

const LINE_ADD_URL = "https://line.me/R/ti/p/@169yaiam";

export function LandingPage() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".r"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp">
      {/* one shared animated background for the entire page */}
      <div className="lp-bg" aria-hidden />
      <SiteNav />

      <div className="lp-wrap">
        {/* ---------- HERO ---------- */}
        <header className="hero">
          <p className="eyebrow">TAX STRATEGY LAB</p>
          <div className="rule" />
          <h1>
            税理士が警告する、<br />
            <span className="g">富裕層の資産防衛</span>の盲点
          </h1>
          <p className="sub">
            資産規模が一定を超えると、これまでの「貯める・増やす」だけでは守り切れません。
            税務と運用の両面から、あなたに最適な“次の一手”を無料で診断します。
          </p>
          <a className="cta" href={LINE_ADD_URL}>LINEで無料診断を受け取る</a>
          <p className="cta-note">所要わずか30秒・3つの質問に答えるだけ</p>
          <div className="scroll" />
        </header>

        {/* ---------- PROBLEM ---------- */}
        <section className="sec">
          <p className="kick r"><i>—</i>&nbsp;PROBLEM&nbsp;<i>—</i></p>
          <h2 className="h2 r d1">こんな“見えないリスク”はありませんか</h2>
          <p className="lead r d2">
            多忙な経営者・資産家ほど、資産の最適化は後回しになりがちです。
            気づかぬうちに、大きな差が生まれています。
          </p>
          <div className="grid">
            <div className="card r d1"><div className="num">01</div><h3>税負担の最適化</h3><p>本業に集中するあまり、合法的に圧縮できる税が放置されていませんか。</p></div>
            <div className="card r d2"><div className="num">02</div><h3>運用の機会損失</h3><p>「なんとなく」の運用で、本来得られたはずのリターンを逃していませんか。</p></div>
            <div className="card r d3"><div className="num">03</div><h3>守りの設計不足</h3><p>増やすことばかりで、資産を“守り抜く”設計が後回しになっていませんか。</p></div>
          </div>
        </section>

        <div className="divider r" />

        {/* ---------- FLOW ---------- */}
        <section className="sec">
          <p className="kick r"><i>—</i>&nbsp;HOW IT WORKS&nbsp;<i>—</i></p>
          <h2 className="h2 r d1">最適な一手が分かるまで、たった3ステップ</h2>
          <div className="flow">
            <div className="fstep r d1"><div className="idx">1</div><div className="ftxt">LINEで友だち追加（無料）</div></div>
            <div className="fstep r d2"><div className="idx">2</div><div className="ftxt">動画を視聴し、3つの質問に回答</div></div>
            <div className="fstep r d3"><div className="idx">3</div><div className="ftxt">あなたに最適なご案内が届く</div></div>
          </div>
        </section>

        <div className="divider r" />

        {/* ---------- OUTCOMES ---------- */}
        <section className="sec">
          <p className="kick r"><i>—</i>&nbsp;FOR YOU&nbsp;<i>—</i></p>
          <h2 className="h2 r d1">あなたに合った“出口”をご用意</h2>
          <div className="out">
            <div className="ocard r d1">
              <span className="tag">EXCLUSIVE</span>
              <h3>全資産の最適化コンサル</h3>
              <p>一定基準を満たす方へ。超一流のプロに、税務と運用を横断した資産防衛を託す道。</p>
            </div>
            <div className="ocard r d2">
              <span className="tag">GATEWAY</span>
              <h3>本物の富裕層への登竜門</h3>
              <p>これから資産を築く方へ。金融機関の“カモ”にならない、一生モノの教養を学ぶ道。</p>
            </div>
          </div>
        </section>

        {/* ---------- FINAL ---------- */}
        <section className="final">
          <p className="kick r"><i>—</i>&nbsp;START NOW&nbsp;<i>—</i></p>
          <h2 className="h2 r d1">まずは、あなたの“今”を知ることから。</h2>
          <p className="lead r d2">
            診断は無料、しつこい勧誘は一切ありません。<br />
            30秒で、あなたに最適な次の一歩が見つかります。
          </p>
          <div className="r d3" style={{ marginTop: 40 }}>
            <a className="cta" href={LINE_ADD_URL}>LINEで無料診断を受け取る</a>
          </div>
        </section>

        <footer className="foot">© TAX STRATEGY LAB　|　【公式】ゆか姉 | TAX LAB</footer>
      </div>
    </div>
  );
}
