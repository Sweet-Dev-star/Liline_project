import { PageShell } from "@/src/features/landing/PageShell";

export const metadata = {
  title: "ABOUT｜TAX STRATEGY LAB",
  description: "TAX STRATEGY LAB の理念と、私たちが大切にする価値観。税理士が監修する富裕層のための資産戦略。",
};

export default function AboutPage() {
  return (
    <PageShell eyebrow="ABOUT" title={<>運営者について</>}>
      <div className="prose">
        <p className="big r">
          “守りながら、増やす”。<br />
          それが、本物の資産戦略です。
        </p>
        <p className="r d1">
          TAX STRATEGY LAB は、税理士「ゆか姉」が監修する、富裕層・経営者のための資産戦略メディアです。
          多忙を極める方々が、本業や家族との時間を犠牲にすることなく、税務と運用の両面から
          資産を“守り抜き、育てる”ための知見をお届けしています。
        </p>
        <p className="r d1">
          資産規模が一定を超えると、「貯める」「自分で増やす」だけのアプローチには限界が訪れます。
          私たちは、お一人おひとりの状況に応じて、最適な“次の一手”を見極めるお手伝いをします。
        </p>

        <h3 className="r">私たちが大切にする3つの価値観</h3>
        <div className="values">
          <div className="value r d1">
            <div className="vn">壱</div>
            <div>
              <h4>時間という、最も希少な資産を守る</h4>
              <p>お金は取り戻せても、時間は取り戻せません。本業と人生の質を最優先に、資産の最適化は信頼できる専門性に委ねるという選択を尊重します。</p>
            </div>
          </div>
          <div className="value r d2">
            <div className="vn">弐</div>
            <div>
              <h4>“見識”こそ、一生ものの資産である</h4>
              <p>金融機関に流されない判断軸を持つこと。構造を理解し、自らの意思で意思決定できる力を、本質的な教養としてお伝えします。</p>
            </div>
          </div>
          <div className="value r d3">
            <div className="vn">参</div>
            <div>
              <h4>誠実であること、煽らないこと</h4>
              <p>不安を煽る手法は用いません。事実と構造に基づき、一人ひとりにとって最適な道のみを、静かに、確かにご案内します。</p>
            </div>
          </div>
        </div>

        <h3 className="r">私たちのアプローチ</h3>
        <p className="r">
          Webでの簡単な診断から始まり、LINE を通じて、あなたの資産状況とお考えに合わせた情報を段階的にお届けします。
          一方的な営業ではなく、あなた自身が納得して次の一歩を選べる——そのための設計を徹底しています。
        </p>

        <a className="backhome" href="/">← トップへ戻る</a>
      </div>
    </PageShell>
  );
}
