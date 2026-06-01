"use client";

import { ui } from "../theme";
import type { Option } from "../questions";

/**
 * One survey question: a title + tappable option cards.
 * Uses CSS classes + a scoped stylesheet so we can shrink everything in
 * landscape / short screens (media queries aren't possible with inline styles).
 */
export function QuestionStep<T extends string>({
  index,
  total,
  title,
  options,
  selected,
  onSelect,
}: {
  index: number;
  total: number;
  title: string;
  options: Option<T>[];
  selected: T | undefined;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="qs-panel">
      <style>{CSS}</style>
      <div className="qs-head">
        <p className="qs-progress">
          質問 {index} / {total}
        </p>
        <h2 className="qs-title">{title}</h2>
      </div>
      <div className="qs-options">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className={"qs-option" + (selected === o.value ? " qs-active" : "")}
          >
            <span className="qs-label">{o.label}</span>
            {o.sub && <span className="qs-sub">{o.sub}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.qs-panel{
  position:relative; z-index:1; height:100%;
  box-sizing:border-box; color:${ui.white}; text-align:center;
}
/* title sits near the TOP, with a gap below the video boundary */
.qs-head{
  position:absolute; top:0; left:0; right:0;
  padding:64px 24px 0; box-sizing:border-box;
}
.qs-progress{ color:${ui.gold}; font-size:12px; font-weight:700; letter-spacing:2px; margin:0; text-align:center; }
.qs-title{ font-size:20px; line-height:1.6; font-weight:800; margin:8px auto 0; text-align:center; max-width:88%; }
/* options are absolutely centered on the whole screen */
.qs-options{
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  display:flex; flex-direction:column; gap:12px; align-items:center;
  width:100%; box-sizing:border-box; padding:0 24px;
}
.qs-option{
  display:flex; flex-direction:column; align-items:center; gap:4px;
  width:auto; min-width:240px; max-width:88%; text-align:center;
  padding:14px 28px; border-radius:999px;
  border:1px solid rgba(255,255,255,.25); background:rgba(255,255,255,.08);
  color:${ui.white}; cursor:pointer; -webkit-backdrop-filter:blur(2px); backdrop-filter:blur(2px);
}
.qs-active{ border-color:${ui.gold}; background:rgba(201,162,39,.20); }
.qs-label{ font-size:14px; font-weight:700; }
.qs-sub{ font-size:10px; color:${ui.mutedOnDark}; line-height:1.6; }

/* landscape OR short viewport: compact + center the options (not full width) */
@media (orientation: landscape) and (max-height: 520px){
  .qs-head{ padding:14px 20px 0; }
  .qs-title{ font-size:16px; line-height:1.4; }
  .qs-progress{ font-size:11px; }
  .qs-options{ gap:8px; }
  .qs-option{
    width:auto; min-width:220px; max-width:70%;
    align-items:center; text-align:center;
    padding:9px 22px; border-radius:999px;
  }
  .qs-label{ font-size:12px; }
  .qs-sub{ font-size:9px; line-height:1.4; text-align:center; }
}
@media (orientation: landscape) and (max-height: 380px){
  .qs-head{ padding:6px 16px 0; }
  .qs-title{ font-size:14px; }
  .qs-options{ gap:6px; }
  .qs-option{ min-width:200px; padding:7px 20px; }
  .qs-label{ font-size:11px; }
  .qs-sub{ font-size:8px; }
}
`;
