"use client";

import { useEffect, useRef, useState } from "react";

const WD = ["日", "月", "火", "水", "木", "金", "土"];
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * Custom navy/gold calendar (the native <input type=date> popup can't be styled).
 * `value`/`min`/`max` are YYYY-MM-DD strings (compared lexicographically = by date).
 * Dates outside [min, max] are disabled; month nav stops at those bounds.
 */
export function DatePicker({
  value,
  min,
  max,
  onChange,
  align = "left",
}: {
  value: string;
  min?: string;
  max?: string;
  onChange: (v: string) => void;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const todayYmd = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

  const seed = value || max || todayYmd;
  const [view, setView] = useState(() => {
    const [y, m] = seed.split("-").map(Number);
    return { y, m: m - 1 };
  });

  // re-centre on the selected month when value changes externally
  useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      setView({ y, m: m - 1 });
    }
  }, [value]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const firstWd = new Date(view.y, view.m, 1).getDay();
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWd).fill(null),
    ...Array.from({ length: daysIn }, (_, i) => i + 1),
  ];

  const monthStart = ymd(view.y, view.m, 1);
  const monthEnd = ymd(view.y, view.m, daysIn);
  const prevDisabled = !!min && monthStart <= min;
  const nextDisabled = !!max && monthEnd >= max;

  const cellDisabled = (d: number) => {
    const v = ymd(view.y, view.m, d);
    return (!!min && v < min) || (!!max && v > max);
  };
  const pick = (d: number) => {
    onChange(ymd(view.y, view.m, d));
    setOpen(false);
  };
  const goPrev = () => setView((v) => ({ y: v.m === 0 ? v.y - 1 : v.y, m: v.m === 0 ? 11 : v.m - 1 }));
  const goNext = () => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: v.m === 11 ? 0 : v.m + 1 }));
  const goToday = () => {
    const v = min && todayYmd < min ? min : max && todayYmd > max ? max : todayYmd;
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="dp" ref={ref}>
      <button type="button" className="dp-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="dp-ico">▦</span>
        {value ? value.replace(/-/g, "/") : "日付を選択"}
      </button>

      {open && (
        <div className={"dp-pop" + (align === "right" ? " dp-pop-right" : "")}>
          <div className="dp-head">
            <button type="button" className="dp-nav" disabled={prevDisabled} onClick={goPrev} aria-label="前の月">
              ‹
            </button>
            <span className="dp-title">
              {view.y}年 {view.m + 1}月
            </span>
            <button type="button" className="dp-nav" disabled={nextDisabled} onClick={goNext} aria-label="次の月">
              ›
            </button>
          </div>

          <div className="dp-grid dp-wd">
            {WD.map((w, i) => (
              <span key={w} className={"dp-wdc" + (i === 0 ? " sun" : i === 6 ? " sat" : "")}>
                {w}
              </span>
            ))}
          </div>

          <div className="dp-grid">
            {cells.map((d, i) =>
              d === null ? (
                <span key={`e${i}`} className="dp-cell empty" />
              ) : (
                <button
                  type="button"
                  key={d}
                  className={
                    "dp-cell" +
                    (ymd(view.y, view.m, d) === value ? " sel" : "") +
                    (ymd(view.y, view.m, d) === todayYmd ? " today" : "")
                  }
                  disabled={cellDisabled(d)}
                  onClick={() => pick(d)}
                >
                  {d}
                </button>
              )
            )}
          </div>

          <div className="dp-foot">
            <button type="button" className="dp-today" onClick={goToday}>
              今日
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
