"use client";

import { useState, useEffect, useCallback } from "react";
import { DatePicker } from "./DatePicker";
import "./admin.css";

const TOKEN_KEY = "tsl_admin_token";

interface Stats {
  total: number; active: number; blocked: number;
  consultation: number; school: number; nurture: number;
  pending: number; sent: number; surveys: number; ai: number;
}
interface SeriesPoint { label: string; adds: number; surveys: number; clicks: number; ai: number; }
/** Funnel totals for a single selected date. */
interface FunnelTotals {
  adds: number; surveys: number; consultation: number; school: number; nurture: number; ai: number;
  clicks: { consult: number; school: number; mtu: number };
}
interface Row {
  id: string; displayName: string | null; branch: string | null;
  status: string; registeredAt: string; tags: string[];
}

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats>();
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [granularity, setGranularity] = useState("day");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [funnelDate, setFunnelDate] = useState("");
  const [funnelData, setFunnelData] = useState<FunnelTotals | null>(null);
  const [users, setUsers] = useState<Row[]>([]);
  const [broadcastTag, setBroadcastTag] = useState("");
  const [broadcastText, setBroadcastText] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // today's date in JST (YYYY-MM-DD) — used as the max selectable date
  const todayJst = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // load the date-range chart series
  const loadRange = useCallback(async (t: string, from: string, to: string) => {
    try {
      const res = await fetch(`/api/admin/analytics?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const d = await res.json();
        setSeries(d.series ?? []);
        setGranularity(d.granularity ?? "day");
      }
    } catch {
      /* ignore */
    }
  }, []);

  // load the funnel totals for a single selected date
  const loadFunnel = useCallback(async (t: string, date: string) => {
    try {
      const res = await fetch(`/api/admin/analytics?from=${date}&to=${date}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) setFunnelData((await res.json()).totals);
    } catch {
      /* ignore */
    }
  }, []);

  // load stats with a given token; persist it on success so reload stays logged in
  const loadWith = useCallback(
    async (t: string, persist: boolean): Promise<boolean> => {
      try {
        const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${t}` } });
        if (!res.ok) throw new Error("unauthorized");
        const data = await res.json();
        setStats(data.stats);
        setUsers(data.users);
        setAuthed(true);
        if (persist) localStorage.setItem(TOKEN_KEY, t);

        // initialise the date controls (funnel = today, range chart = last 14 days)
        const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const from14 = new Date(Date.now() + 9 * 60 * 60 * 1000 - 13 * 86400000)
          .toISOString()
          .slice(0, 10);
        setFunnelDate(today);
        setRangeFrom(from14);
        setRangeTo(today);
        loadFunnel(t, today);
        loadRange(t, from14, today);
        return true;
      } catch {
        return false;
      }
    },
    [loadRange, loadFunnel]
  );

  // on mount: if a saved token exists, auto-login (survives reload)
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (saved) {
      setToken(saved);
      loadWith(saved, false).then((ok) => {
        if (!ok) localStorage.removeItem(TOKEN_KEY);
      });
    }
  }, [loadWith]);

  async function login() {
    setErr("");
    const ok = await loadWith(token, true);
    if (!ok) setErr("認証に失敗しました。トークンをご確認ください。");
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
    setToken("");
    setStats(undefined);
    setUsers([]);
    setSelected(new Set());
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === users.length ? new Set() : new Set(users.map((u) => u.id))));
  }

  async function setSuppressed(suppress: boolean) {
    setMsg(""); setErr("");
    if (!selected.size) return;
    const label = suppress ? "配信停止" : "配信再開";
    if (!confirm(`選択した${selected.size}名を${label}しますか？`)) return;
    try {
      const res = await fetch("/api/admin/users/suppress", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selected), suppress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setMsg(`${data.updated}名を${label}しました。`);
      setSelected(new Set());
      await loadWith(token, false);
    } catch (e) {
      setErr(`${label}に失敗しました：` + (e as Error).message);
    }
  }

  async function deleteSelected() {
    setMsg(""); setErr("");
    if (!selected.size) return;
    if (!confirm(`選択した${selected.size}名のユーザーを削除しますか？\nこの操作は取り消せません。`)) return;
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setMsg(`${data.deleted}名のユーザーを削除しました。`);
      setSelected(new Set());
      await loadWith(token, false); // refresh stats + list
    } catch (e) {
      setErr("削除に失敗しました：" + (e as Error).message);
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

  function onFromChange(v: string) {
    if (!v) return;
    const nf = v > todayJst ? todayJst : v;
    const nt = rangeTo < nf ? nf : rangeTo;
    setRangeFrom(nf);
    if (nt !== rangeTo) setRangeTo(nt);
    loadRange(token, nf, nt);
  }
  function onToChange(v: string) {
    if (!v) return;
    let nt = v > todayJst ? todayJst : v;
    if (nt < rangeFrom) nt = rangeFrom;
    setRangeTo(nt);
    loadRange(token, rangeFrom, nt);
  }
  function onFunnelDateChange(v: string) {
    if (!v) return;
    const nd = v > todayJst ? todayJst : v;
    setFunnelDate(nd);
    loadFunnel(token, nd);
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
        <button className="adm-logout" onClick={logout}>ログアウト</button>
      </div>

      <div className="adm-main">
        {stats && (
          <div className="adm-stats">
            <Stat label="友だち総数" value={stats.total} />
            <Stat label="アクティブ" value={stats.active} />
            <Stat label="ブロック" value={stats.blocked} />
            <Stat label="個別相談" value={stats.consultation} accent />
            <Stat label="スクール" value={stats.school} accent />
            <Stat label="非該当" value={stats.nurture} accent />
            <Stat label="回答数" value={stats.surveys} />
            <Stat label="AI応答" value={stats.ai} />
            <Stat label="配信予約" value={stats.pending} />
            <Stat label="配信済み" value={stats.sent} />
          </div>
        )}

        {funnelData && (
          <div className="adm-panel">
            <div className="adm-panel-head">
              <h2 className="adm-h2">ファネル分析</h2>
              <div className="adm-daterange">
                <span className="adm-date-label">対象日</span>
                <DatePicker value={funnelDate} max={todayJst} onChange={onFunnelDateChange} align="right" />
              </div>
            </div>

            {(() => {
              const f = funnelData;
              const fmax = Math.max(
                f.adds, f.surveys, f.consultation, f.school, f.nurture,
                f.clicks.consult, f.clicks.school + f.clicks.mtu, 1
              );
              return (
                <div className="funnel">
                  <FunnelRow label="友だち追加" value={f.adds} max={fmax} />
                  <FunnelRow label="アンケート完了" value={f.surveys} prev={f.adds} max={fmax} />
                  <FunnelRow label="個別相談（適格）" value={f.consultation} prev={f.surveys} max={fmax} indent />
                  <FunnelRow label="マネトレ大学（School）" value={f.school} prev={f.surveys} max={fmax} indent />
                  <FunnelRow label="育成（Nurture）" value={f.nurture} prev={f.surveys} max={fmax} indent />
                  <FunnelRow label="相談リンク クリック" value={f.clicks.consult} prev={f.consultation} max={fmax} accent />
                  <FunnelRow label="マネトレ リンク クリック" value={f.clicks.school + f.clicks.mtu} prev={f.school} max={fmax} accent />
                  <p className="funnel-note">この日のAI応答：<b>{f.ai}</b> 件</p>
                </div>
              );
            })()}

            <h3 className="adm-h3">
              期間別の推移
              <span className="gran-badge">{granularity === "month" ? "月次" : granularity === "week" ? "週次" : "日次"}</span>
            </h3>
            <div className="adm-daterange">
              <span className="adm-date-label">開始</span>
              <DatePicker value={rangeFrom} max={todayJst} onChange={onFromChange} />
              <span className="sep">〜</span>
              <span className="adm-date-label">終了</span>
              <DatePicker value={rangeTo} min={rangeFrom} max={todayJst} onChange={onToChange} />
            </div>
            <TrendChart points={series} />
            <div className="daily-legend">
              <span><i className="lg lg-adds" />友だち追加</span>
              <span><i className="lg lg-surveys" />アンケート</span>
              <span><i className="lg lg-clicks" />クリック</span>
              <span><i className="lg lg-ai" />AI応答</span>
            </div>
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
          <div className="adm-panel-head">
            <h2 className="adm-h2">登録ユーザー（最新100件）</h2>
            <div className="adm-actions">
              <button className="adm-btn ghost" onClick={() => setSuppressed(true)} disabled={selected.size === 0}>
                配信停止{selected.size > 0 ? `（${selected.size}）` : ""}
              </button>
              <button className="adm-btn ghost" onClick={() => setSuppressed(false)} disabled={selected.size === 0}>
                配信再開
              </button>
              <button className="adm-btn danger" onClick={deleteSelected} disabled={selected.size === 0}>
                削除{selected.size > 0 ? `（${selected.size}）` : ""}
              </button>
            </div>
          </div>
          <div className="adm-tablewrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th className="adm-check">
                    <input
                      type="checkbox"
                      aria-label="すべて選択"
                      checked={users.length > 0 && selected.size === users.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>表示名</th><th>ルート</th><th>状態</th><th>タグ</th><th>登録日</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={selected.has(u.id) ? "is-selected" : undefined}>
                    <td className="adm-check">
                      <input
                        type="checkbox"
                        aria-label={`${u.displayName ?? u.id} を選択`}
                        checked={selected.has(u.id)}
                        onChange={() => toggleOne(u.id)}
                      />
                    </td>
                    <td>{u.displayName ?? "—"}</td>
                    <td>{u.branch ? <span className="pill route">{u.branch}</span> : "—"}</td>
                    <td>
                      <span className={"pill " + (u.status === "active" ? "active" : "blocked")}>{u.status}</span>
                      {u.tags.includes("suppressed") && <span className="pill suppressed">停止中</span>}
                    </td>
                    <td>
                      <div className="tagcell">
                        {(() => {
                          const shown = u.tags.filter((t) => t !== "suppressed");
                          return shown.length ? shown.map((t) => <span className="tag" key={t}>{t}</span>) : "—";
                        })()}
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

function FunnelRow({
  label, value, prev, max, accent, indent,
}: {
  label: string; value: number; prev?: number; max: number; accent?: boolean; indent?: boolean;
}) {
  const width = max > 0 && value > 0 ? Math.max(3, Math.round((value / max) * 100)) : 0;
  const pct = prev && prev > 0 ? Math.round((value / prev) * 100) : null;
  return (
    <div className={"fr" + (indent ? " fr-indent" : "")}>
      <div className="fr-head">
        <span className="fr-label">{label}</span>
        <span className="fr-val">
          {value}
          {pct !== null && <em className="fr-pct"> ({pct}%)</em>}
        </span>
      </div>
      <div className="fr-track">
        <div className={"fr-bar" + (accent ? " fr-bar-accent" : "")} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function TrendChart({ points }: { points: SeriesPoint[] }) {
  const max = Math.max(1, ...points.map((p) => Math.max(p.adds, p.surveys, p.clicks, p.ai)));
  // show at most ~12 labels so they never crowd/overflow, regardless of range size
  const step = Math.max(1, Math.ceil(points.length / 12));
  return (
    <div className="daily">
      {points.map((p, i) => (
        <div
          className="day"
          key={i}
          title={`${p.label}｜追加 ${p.adds} / 回答 ${p.surveys} / クリック ${p.clicks} / AI ${p.ai}`}
        >
          <div className="day-bars">
            <i className="db db-adds" style={{ height: `${(p.adds / max) * 100}%` }} />
            <i className="db db-surveys" style={{ height: `${(p.surveys / max) * 100}%` }} />
            <i className="db db-clicks" style={{ height: `${(p.clicks / max) * 100}%` }} />
            <i className="db db-ai" style={{ height: `${(p.ai / max) * 100}%` }} />
          </div>
          <span className="day-label">{i % step === 0 ? p.label : ""}</span>
        </div>
      ))}
    </div>
  );
}
