"use client";

import { useState } from "react";
import { adminUi as c } from "./theme";

interface Stats {
  total: number; active: number; blocked: number;
  ifa: number; school: number; nurture: number;
  pending: number; sent: number; surveys: number;
}
interface Row {
  id: string; displayName: string | null; branch: string | null;
  status: string; registeredAt: string; tags: string[];
}

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats>();
  const [users, setUsers] = useState<Row[]>([]);
  const [broadcastTag, setBroadcastTag] = useState("");
  const [broadcastText, setBroadcastText] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function login() {
    setErr("");
    try {
      const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("unauthorized");
      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users);
      setAuthed(true);
    } catch {
      setErr("認証に失敗しました。トークンをご確認ください。");
    }
  }

  async function sendBroadcast() {
    setMsg(""); setErr("");
    if (!broadcastText.trim()) { setErr("配信メッセージを入力してください。"); return; }
    if (!confirm(`配信しますか？\n対象: ${broadcastTag || "全員(active)"}\n本文: ${broadcastText.slice(0, 40)}...`)) return;
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tag: broadcastTag.trim() || null, text: broadcastText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setMsg(`配信完了：対象${data.targeted}名 / 送信${data.sent}名`);
      setBroadcastText("");
    } catch (e) {
      setErr("配信に失敗しました：" + (e as Error).message);
    }
  }

  if (!authed) {
    return (
      <main style={s.loginPage}>
        <div style={s.loginCard}>
          <p style={s.eyebrow}>TAX STRATEGY LAB</p>
          <h1 style={s.h1}>管理ダッシュボード</h1>
          <input style={s.input} type="password" placeholder="アクセストークン" value={token}
            onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
          <button style={s.btn} onClick={login}>ログイン</button>
          {err && <p style={s.err}>{err}</p>}
        </div>
      </main>
    );
  }

  return (
    <main style={s.page}>
      <header style={s.header}>
        <span style={s.eyebrow}>TAX STRATEGY LAB</span>
        <h1 style={s.h1}>管理ダッシュボード</h1>
      </header>

      {stats && (
        <section style={s.cards}>
          <Card label="友だち総数" value={stats.total} />
          <Card label="アクティブ" value={stats.active} />
          <Card label="ブロック" value={stats.blocked} />
          <Card label="IFA" value={stats.ifa} accent />
          <Card label="スクール" value={stats.school} accent />
          <Card label="非該当" value={stats.nurture} accent />
          <Card label="回答数" value={stats.surveys} />
          <Card label="配信予約(待機)" value={stats.pending} />
          <Card label="配信済み" value={stats.sent} />
        </section>
      )}

      <section style={s.panel}>
        <h2 style={s.h2}>一斉配信（メルマガ）</h2>
        <input style={s.input} placeholder="対象タグ（空欄=全員 active）例: branch:school" value={broadcastTag}
          onChange={(e) => setBroadcastTag(e.target.value)} />
        <textarea style={{ ...s.input, height: 90, resize: "vertical" }} placeholder="配信メッセージ本文"
          value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)} />
        <button style={s.btn} onClick={sendBroadcast}>配信する</button>
        {msg && <p style={s.ok}>{msg}</p>}
        {err && <p style={s.err}>{err}</p>}
      </section>

      <section style={s.panel}>
        <h2 style={s.h2}>登録ユーザー（最新100件）</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>表示名</th><th style={s.th}>ルート</th><th style={s.th}>状態</th>
                <th style={s.th}>タグ</th><th style={s.th}>登録日</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={s.td}>{u.displayName ?? "—"}</td>
                  <td style={s.td}>{u.branch ?? "—"}</td>
                  <td style={s.td}>{u.status}</td>
                  <td style={s.td}>{u.tags.join(", ")}</td>
                  <td style={s.td}>{new Date(u.registeredAt).toLocaleString("ja-JP")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Card({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{ ...s.card, ...(accent ? { borderTop: `3px solid ${c.gold}` } : {}) }}>
      <div style={s.cardLabel}>{label}</div>
      <div style={s.cardValue}>{value}</div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  loginPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: c.navy, fontFamily: "system-ui, sans-serif" },
  loginCard: { background: c.card, padding: 32, borderRadius: 16, width: 340, textAlign: "center" },
  page: { maxWidth: 1100, margin: "0 auto", padding: 24, background: c.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: c.text },
  header: { marginBottom: 20 },
  eyebrow: { color: c.gold, letterSpacing: 3, fontSize: 12, fontWeight: 700 },
  h1: { fontSize: 24, margin: "4px 0 0" },
  h2: { fontSize: 16, margin: "0 0 12px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 },
  card: { background: c.card, borderRadius: 12, padding: 16, border: `1px solid ${c.border}` },
  cardLabel: { fontSize: 12, color: c.muted },
  cardValue: { fontSize: 28, fontWeight: 700, marginTop: 4 },
  panel: { background: c.card, borderRadius: 12, padding: 20, border: `1px solid ${c.border}`, marginBottom: 20 },
  input: { display: "block", width: "100%", boxSizing: "border-box", padding: 12, marginBottom: 12, borderRadius: 8, border: `1px solid ${c.border}`, fontSize: 14 },
  btn: { padding: "10px 24px", borderRadius: 8, border: "none", background: c.navy, color: "#fff", fontWeight: 700, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", borderBottom: `2px solid ${c.border}`, padding: 8, whiteSpace: "nowrap" },
  td: { borderBottom: `1px solid ${c.bg}`, padding: 8 },
  ok: { color: "#0a7d28", marginTop: 8 },
  err: { color: "crimson", marginTop: 8 },
};
