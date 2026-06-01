import { PageShell } from "@/src/features/landing/PageShell";

export const metadata = {
  title: "FAQ｜TAX STRATEGY LAB",
  description: "TAX STRATEGY LAB のよくあるご質問。診断・費用・勧誘・対象者についてお答えします。",
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "診断は本当に無料ですか？",
    a: "はい。LINEでの友だち追加後、3つの質問にお答えいただく診断は完全に無料です。費用が発生することは一切ございません。",
  },
  {
    q: "しつこい勧誘や営業の電話はありませんか？",
    a: "ございません。お電話による営業は一切行っておりません。あなたの状況に合った情報を、LINE上で適切なタイミングでお届けするのみです。不要であればいつでも配信を停止できます。",
  },
  {
    q: "どのような人に向いていますか？",
    a: "多忙な経営者・医師・士業の方、ある程度の資産をお持ちの方、そしてこれから本格的に資産形成を目指す“将来の富裕層候補”の方に最適です。診断により、あなたに合ったご案内を自動で振り分けます。",
  },
  {
    q: "診断にはどれくらい時間がかかりますか？",
    a: "わずか30秒程度です。資産・年収・運用のお考えに関する3つの質問にタップでお答えいただくだけで完了します。",
  },
  {
    q: "個人情報は安全に扱われますか？",
    a: "診断結果は、最適なご案内を行う目的にのみ利用します。第三者へ無断で提供することはありません。安心してご利用ください。",
  },
  {
    q: "診断後、必ず契約しなければなりませんか？",
    a: "いいえ。診断はあくまで“あなたに合った選択肢を知る”ためのものです。その後の判断はすべてあなたご自身に委ねられています。",
  },
];

export default function FaqPage() {
  return (
    <PageShell eyebrow="FAQ" title={<>よくあるご質問</>}>
      <div className="prose">
        <p className="r" style={{ textAlign: "center", color: "#93A0B4" }}>
          ご不明な点は、LINEのトークからお気軽にお問い合わせください。
        </p>
        <div className="faqs">
          {FAQS.map((f, i) => (
            <div className={"faq r d" + ((i % 3) + 1)} key={i}>
              <div className="q"><span className="mark">Q</span><span>{f.q}</span></div>
              <div className="a"><span className="mark">A</span><p>{f.a}</p></div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <a className="backhome" href="/">← トップへ戻る</a>
        </div>
      </div>
    </PageShell>
  );
}
