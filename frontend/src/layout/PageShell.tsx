import type { ReactNode } from "react";
import SwayHeader from "./SwayHeader.tsx";

export default function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="bg-canvas text-ink min-h-screen">
      <a
        href="#main-content"
        className="text-brand-700 sr-only fixed top-3 left-3 z-50 rounded-xl bg-white px-4 py-3 font-medium shadow-sm focus:not-sr-only"
      >
        Skip to content
      </a>
      <header className="bg-canvas/95 sticky top-0 z-20 border-b border-stone-200/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SwayHeader compact />
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className={`mx-auto w-full max-w-7xl scroll-mt-44 px-4 py-7 outline-none sm:px-6 sm:py-10 ${className}`}
      >
        {children}
      </main>
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
      <div className="min-w-0">
        {eyebrow && <p className="ui-eyebrow mb-3">{eyebrow}</p>}
        <h1 className="font-display text-ink text-4xl leading-tight tracking-tight sm:text-[2.75rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
            {description}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}
