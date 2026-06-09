"use client";

import { ui } from "../theme";
import type { Option } from "../questions";

/**
 * One survey question: an optional lead paragraph (診断結果＋処方箋) + title +
 * tappable option cards, inside a readable scrim panel over the background video.
 * The panel scrolls internally if the content is taller than the screen, so even
 * the long "prescription" Q3 fits on any device.
 */
export function QuestionStep<T extends string>({
  index,
  total,
  title,
  lead,
  options,
  selected,
  onSelect,
}: {
  index: number;
  total: number;
  title: string;
  lead?: string;
  options: Option<T>[];
  selected: T | undefined;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="qs-panel">
      <style>{CSS}</style>
      <div className="qs-inner">
        <p className="qs-progress">
          質問 {index} / {total}
        </p>
        {lead && <p className="qs-lead">{lead}</p>}
        <h2 className="qs-title">{title}</h2>
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
    </div>
  );
}

const CSS = `
.qs-panel{
  position:absolute; inset:0; z-index:1;
  display:flex; align-items:center; justify-content:center;
  padding:40px 18px; box-sizing:border-box;
  overflow-y:auto; -webkit-overflow-scrolling:touch;
}
.qs-inner{
  width:100%; max-width:520px; box-sizing:border-box; text-align:center;
  color:${ui.white};
  background:rgba(10,19,32,.60);
  border:1px solid rgba(201,162,39,.28);
  border-radius:20px; padding:26px 22px;
  -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px);
  box-shadow:0 22px 60px rgba(0,0,0,.5);
}
.qs-progress{ color:${ui.gold}; font-size:12px; font-weight:700; letter-spacing:.18em; margin:0 0 14px; }
.qs-lead{ font-size:13px; line-height:1.95; color:${ui.mutedOnDark}; white-space:pre-line; text-align:left; margin:0 0 18px; }
.qs-title{ font-size:18px; line-height:1.65; font-weight:800; margin:0 0 18px; }
.qs-options{ display:flex; flex-direction:column; gap:12px; }
.qs-option{
  display:flex; flex-direction:column; align-items:center; gap:4px;
  width:100%; box-sizing:border-box; text-align:center;
  padding:13px 18px; border-radius:14px;
  border:1px solid rgba(255,255,255,.25); background:rgba(255,255,255,.08);
  color:${ui.white}; cursor:pointer;
  transition:border-color .2s, background .2s;
}
.qs-option:hover{ border-color:rgba(201,162,39,.6); }
.qs-active{ border-color:${ui.gold}; background:rgba(201,162,39,.22); }
.qs-label{ font-size:14px; font-weight:700; }
.qs-sub{ font-size:11px; color:${ui.mutedOnDark}; line-height:1.55; }

@media (max-height:560px){
  .qs-panel{ padding:20px 16px; }
  .qs-inner{ padding:18px 16px; }
  .qs-lead{ font-size:12px; line-height:1.8; margin-bottom:12px; }
  .qs-title{ font-size:16px; margin-bottom:14px; }
  .qs-option{ padding:10px 16px; }
}
`;
