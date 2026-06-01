"use client";

import { useEffect, useState } from "react";

const LINE_ADD_URL = "https://line.me/R/ti/p/@169yaiam";

/** Fixed top navigation shared by the home + inner pages. */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")}>
      <a className="brand" href="/">TAX STRATEGY LAB</a>
      <div className="links">
        <a href="/about">ABOUT</a>
        <a href="/faq">FAQ</a>
        <a href="/contact">CONTACT</a>
        <a className="cta-mini" href={LINE_ADD_URL}>無料診断</a>
      </div>
    </nav>
  );
}
