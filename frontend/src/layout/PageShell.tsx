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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only fixed top-3 left-3 z-50 rounded-xl bg-white px-4 py-3 font-medium text-indigo-700 shadow-sm focus:not-sr-only"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SwayHeader compact />
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className={`mx-auto w-full max-w-7xl scroll-mt-44 px-4 py-6 outline-none sm:px-6 sm:py-8 ${className}`}
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
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-widest text-indigo-600 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            {description}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}
