import { Link } from "react-router";
import AllPosts from "./AllPosts.tsx";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wider text-indigo-600 uppercase">
              Overview
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Dashboard
            </h1>
          </div>

          <Link
            to="writing"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none"
          >
            Write a post
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <AllPosts />
        </section>
      </div>
    </main>
  );
}
