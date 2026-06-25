import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ゆか姉の推奨環境 | TAX STRATEGY LAB",
  description: "資産拡大フェーズの方へ。ゆか姉が推薦する、お金の基礎体力を養う学習環境のご案内。",
};

const C = {
  navy: "#0F1C30",
  navyDeep: "#0A1320",
  gold: "#C9A227",
  goldSoft: "#E7C45A",
  ink: "#EAEEF5",
  muted: "#B7C0CF",
  faint: "#7E8A9C",
  line: "rgba(255,255,255,.09)",
};

const REASONS = [
  {
    n: "01",
    title: "ゴールドマン・サックス出身の代表",
    body: "世界最高峰の金融機関で培われた知見をもとに設計された、本質的なカリキュラム。",
  },
  {
    n: "02",
    title: "金融 × 不動産の実践教育",
    body: "机上の理論ではなく、実際に資産を「増やし、守る」ための実践的な型を体系的に学べます。",
  },
  {
    n: "03",
    title: "“カモ”にならない教養",
    body: "金融機関に勧められるまま選ぶのではなく、自らの判断軸を持つための基礎リテラシー。",
  },
];

export default function RecommendPage() {
  return (
    <main style={s.root}>
      <style>{CSS}</style>
      <div className="rc-wrap">
        <p className="rc-eyebrow">ゆか姉からのご提案</p>
        <h1 className="rc-title">
          資産拡大フェーズの、
          <br />
          あなたへ。
        </h1>
        <p className="rc-lead">
          診断の結果、いま最も優先すべきは「高度な税務スキーム」よりも、
          <strong>ご自身の力で資産を増やす“投資・運用の基礎体力”</strong>を身につけることです。
          <br />
          私は現在、個別コンサルティングをお受けしておりませんが、これから資産を築く方へ、
          <strong>最も体系的におすすめできる学習環境</strong>として『マネトレ大学』を強く推奨しています。
        </p>

        <div className="rc-grid">
          {REASONS.map((r) => (
            <div className="rc-card" key={r.n}>
              <span className="rc-num">{r.n}</span>
              <h3 className="rc-card-title">{r.title}</h3>
              <p className="rc-card-body">{r.body}</p>
            </div>
          ))}
        </div>

        <a className="rc-cta" href="/api/go?to=school">
          マネトレ大学の詳細を確認する ▶
        </a>

        <p className="rc-note">
          ※本ページにはプロモーション（アフィリエイト）を含みます。
          記載の内容は一般的な情報提供であり、特定の投資・税務に関する助言ではありません。
        </p>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    margin: 0,
    color: C.ink,
    fontFamily: "system-ui, 'Helvetica Neue', sans-serif",
    background: `radial-gradient(900px 600px at 80% -5%, rgba(201,162,39,.10), transparent 55%), linear-gradient(180deg, ${C.navy} 0%, ${C.navyDeep} 60%, #070D17 100%)`,
  },
};

const CSS = `
.rc-wrap{ max-width:760px; margin:0 auto; padding:clamp(48px,9vw,96px) 22px 80px; }
.rc-eyebrow{ color:${C.gold}; letter-spacing:.4em; font-size:12px; font-weight:700; margin:0 0 18px; }
.rc-title{ font-family:"Hiragino Mincho ProN","Yu Mincho",serif; font-weight:700;
  font-size:clamp(30px,7vw,46px); line-height:1.35; letter-spacing:.03em; margin:0 0 28px; }
.rc-lead{ color:${C.muted}; font-size:15px; line-height:2.05; margin:0 0 48px; }
.rc-lead strong{ color:${C.goldSoft}; font-weight:700; }
.rc-grid{ display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:16px; margin:0 0 48px; }
.rc-card{ background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02));
  border:1px solid ${C.line}; border-top:2px solid ${C.gold}; border-radius:16px; padding:24px 22px; }
.rc-num{ color:${C.gold}; font-size:13px; font-weight:800; letter-spacing:.1em; }
.rc-card-title{ font-size:16px; font-weight:800; margin:12px 0 10px; line-height:1.5; }
.rc-card-body{ color:${C.muted}; font-size:13px; line-height:1.85; margin:0; }
.rc-cta{ display:block; width:100%; max-width:420px; margin:0 auto; box-sizing:border-box;
  text-align:center; text-decoration:none; cursor:pointer;
  background:linear-gradient(135deg, ${C.goldSoft}, ${C.gold}); color:#1a1407;
  font-size:16px; font-weight:800; padding:18px 28px; border-radius:999px;
  box-shadow:0 14px 36px rgba(201,162,39,.34); transition:transform .25s, box-shadow .25s; }
.rc-cta:hover{ transform:translateY(-2px); box-shadow:0 18px 46px rgba(201,162,39,.5); }
.rc-note{ color:${C.faint}; font-size:11px; line-height:1.8; text-align:center; margin:28px auto 0; max-width:560px; }
`;
