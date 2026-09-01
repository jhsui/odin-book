import SwayHeader from "./partials/SwayHeader.tsx";

export default function UserProfile({ userId }: { userId: string }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_40%)]"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-12">
          <SwayHeader />
        </div>

        <section className="rounded-3xl border border-white/10 bg-white p-8 text-center text-slate-900 shadow-2xl shadow-black/20 sm:p-12">
          <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-indigo-100 text-2xl font-bold text-indigo-700">
            ?
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
            User profile
          </h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
            This member’s profile details will appear here when they become
            available.
          </p>
          <p className="mt-5 text-xs text-slate-400">Profile ID: {userId}</p>
        </section>
      </div>
    </main>
  );
}
