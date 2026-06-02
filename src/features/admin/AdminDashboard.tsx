"use client";

import { useState } from "react";
import "./admin.css";

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
      <div className="adm">
        <div className="adm-login">
          <div className="adm-login-card">
            <p className="adm-eyebrow">TAX STRATEGY LAB</p>
            <h1>管理ダッシュボード</h1>
            <input className="adm-input" type="password" placeholder="アクセストークン" value={token}
              onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
            <button className="adm-btn" style={{ width: "100%" }} onClick={login}>ログイン</button>
            {err && <p className="adm-msg-err">{err}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm">
      <div className="adm-bar">
        <span className="b">TAX STRATEGY LAB</span>
        <span className="s">管理ダッシュボード</span>
      </div>

      <div className="adm-main">
        {stats && (
          <div className="adm-stats">
            <Stat label="友だち総数" value={stats.total} />
            <Stat label="アクティブ" value={stats.active} />
            <Stat label="ブロック" value={stats.blocked} />
            <Stat label="IFA" value={stats.ifa} accent />
            <Stat label="スクール" value={stats.school} accent />
            <Stat label="非該当" value={stats.nurture} accent />
            <Stat label="回答数" value={stats.surveys} />
            <Stat label="配信予約" value={stats.pending} />
            <Stat label="配信済み" value={stats.sent} />
          </div>
        )}

        <div className="adm-panel">
          <h2 className="adm-h2">一斉配信（メルマガ）</h2>
          <p className="adm-hint">対象タグを空欄にすると、アクティブな全員に配信されます。例：branch:school</p>
          <input className="adm-input" placeholder="対象タグ（空欄＝全員 active）" value={broadcastTag}
            onChange={(e) => setBroadcastTag(e.target.value)} />
          <textarea className="adm-textarea" placeholder="配信メッセージ本文を入力…"
            value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)} />
          <button className="adm-btn" onClick={sendBroadcast}>配信する</button>
          {msg && <p className="adm-msg-ok">{msg}</p>}
          {err && <p className="adm-msg-err">{err}</p>}
        </div>

        <div className="adm-panel">
          <h2 className="adm-h2">登録ユーザー（最新100件）</h2>
          <div className="adm-tablewrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>表示名</th><th>ルート</th><th>状態</th><th>タグ</th><th>登録日</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.displayName ?? "—"}</td>
                    <td>{u.branch ? <span className="pill route">{u.branch}</span> : "—"}</td>
                    <td><span className={"pill " + (u.status === "active" ? "active" : "blocked")}>{u.status}</span></td>
                    <td>
                      <div className="tagcell">
                        {u.tags.length ? u.tags.map((t) => <span className="tag" key={t}>{t}</span>) : "—"}
                      </div>
                    </td>
                    <td>{new Date(u.registeredAt).toLocaleString("ja-JP")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={"adm-stat" + (accent ? " accent" : "")}>
      <div className="l">{label}</div>
      <div className="v">{value}</div>
    </div>
  );
}
