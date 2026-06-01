import { PageShell } from "@/src/features/landing/PageShell";

const LINE_ADD_URL = "https://line.me/R/ti/p/@169yaiam";

export const metadata = {
  title: "CONTACT｜TAX STRATEGY LAB",
  description: "TAX STRATEGY LAB へのお問い合わせ。ご相談・ご質問はLINEから承っております。",
};

export default function ContactPage() {
  return (
    <PageShell eyebrow="CONTACT" title={<>お問い合わせ</>}>
      <div className="prose">
        <p className="big r">
          ご相談・ご質問は、<br />
          LINEから承っております。
        </p>
        <p className="r d1" style={{ textAlign: "center" }}>
          資産戦略に関するご相談、サービスへのご質問など、どんな小さなことでもお気軽にお寄せください。
          担当より順次、丁寧にご返信いたします。
        </p>

        <div className="contact-card r d1">
          <p className="lbl">RECOMMENDED</p>
          <h3>LINEで相談する</h3>
          <p style={{ color: "#93A0B4", marginTop: 10 }}>
            まずは友だち追加から。無料診断もこちらから受けられます。
          </p>
          <div style={{ marginTop: 26 }}>
            <a className="cta" href={LINE_ADD_URL}>LINEで無料相談・診断を受ける</a>
          </div>

          <div className="contact-methods">
            <div className="cmethod">
              <div className="ci">＠</div>
              <div className="ct"><b>LINE公式アカウント</b><span>【公式】ゆか姉 | TAX LAB（@169yaiam）</span></div>
            </div>
            <div className="cmethod">
              <div className="ci">🕒</div>
              <div className="ct"><b>ご返信について</b><span>内容を確認のうえ、順次ご返信いたします</span></div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <a className="backhome" href="/">← トップへ戻る</a>
        </div>
      </div>
    </PageShell>
  );
}
