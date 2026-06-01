"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import "./landing.css";
import { SiteNav } from "./SiteNav";

/** Shared shell for inner pages (about/contact/faq): same dark canvas, nav, footer, reveal. */
export function PageShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".r"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp">
      <div className="lp-bg" aria-hidden />
      <SiteNav />
      <div className="lp-wrap">
        <header className="page-hero">
          <p className="eyebrow r">{eyebrow}</p>
          <h1 className="r d1">{title}</h1>
          <div className="rule r d2" />
        </header>
        <main className="page-body">{children}</main>
        <footer className="foot">© TAX STRATEGY LAB　|　【公式】ゆか姉 | TAX LAB</footer>
      </div>
    </div>
  );
}
