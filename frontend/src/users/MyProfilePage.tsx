import { useState, type SubmitEventHandler } from "react";
import { Link, useLoaderData, useRevalidator } from "react-router";
import SwayHeader from "../layout/SwayHeader.tsx";
import MyUserIntro from "./MyUserIntro.tsx";
import type { User } from "./types.ts";
import formatDateTime from "../utils/formatDateTime.ts";

export default function MyProfilePage() {
  const { user } = useLoaderData<{ user: User }>();

  // todo: delete
  console.log(user);

  const [file, setFile] = useState<File | null>(null);
  const revalidator = useRevalidator();

  const [showNameEditor, setShowNameEditor] = useState(false);
  const [newName, setNewName] = useState("");

  // todo: tanstack mutation?
  const handleAvatarSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // todo: refine ux
    if (!file) return;

    // Package for multer
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/me/avatar`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
      }

      await revalidator.revalidate();
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  const handleNameSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // todo: validator in backend
    try {
      if (!newName || !newName.trim()) {
        // todo: ux
        console.error("New username can not be empty");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/me/name`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newName }),
        },
      );

      if (!res.ok) {
        throw new Error(
          `Update username failed (${res.status}): ${await res.text()}`,
        );
      }
      // todo: use Form to revalidate?
      await revalidator.revalidate();
    } catch (error) {
      console.error("Failed to edit username:", error);
    }
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_45%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_40%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-12">
          <SwayHeader />
        </div>
        <header className="mb-8">
          <p className="mb-4 inline-flex rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold tracking-wider text-indigo-300 uppercase">
            Your space
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your Profile
          </h1>
          <p className="mt-3 leading-7 text-slate-400">
            Update your profile and revisit what you’ve shared.
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <section
            aria-label="Profile settings"
            className="min-w-0 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7"
          >
            <div>
              <div className="mb-5">
                {user.image ? (
                  <img
                    src={user.image}
                    alt="Your avatar"
                    className="size-24 rounded-2xl object-cover ring-4 ring-indigo-400/15"
                  />
                ) : (
                  <span className="flex size-24 items-center justify-center rounded-2xl bg-indigo-400/15 text-3xl font-bold text-indigo-300 ring-1 ring-indigo-400/20">
                    {user.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-semibold wrap-anywhere text-white">
                {user.name}
              </h2>

              <button
                type="button"
                aria-expanded={showNameEditor}
                aria-controls="name-editor"
                className="mt-2 rounded-lg text-sm font-medium text-indigo-300 transition hover:text-indigo-200 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
                onClick={() => setShowNameEditor((prev) => !prev)}
              >
                {showNameEditor ? "Cancel editing" : "Edit name"}
              </button>
              {showNameEditor && (
                <div
                  id="name-editor"
                  className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                >
                  <form onSubmit={handleNameSubmit} className="space-y-3">
                    <label
                      htmlFor="new-name"
                      className="block text-sm font-medium text-slate-300"
                    >
                      New username
                    </label>
                    <input
                      type="text"
                      id="new-name"
                      name="new-name"
                      placeholder="Type your new username"
                      className="w-full min-w-0 rounded-xl border border-white/15 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                      onChange={(e) => {
                        setNewName(e.currentTarget.value);
                      }}
                    />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
                    >
                      Save name
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="mt-7 border-t border-white/10 pt-6">
              <h3 className="font-semibold text-white">Profile photo</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Add a face to your conversations.
              </p>

              <form
                onSubmit={handleAvatarSubmit}
                encType="multipart/form-data"
                className="mt-4 space-y-3"
              >
                <label
                  htmlFor="uploaded-avatar"
                  className="block text-sm font-medium text-slate-300"
                >
                  Upload a new avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="uploaded-avatar"
                  id="uploaded-avatar"
                  className="block w-full min-w-0 rounded-xl border border-dashed border-white/20 bg-slate-950/50 p-3 text-xs text-slate-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-400/15 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-300 hover:file:bg-indigo-400/25 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                  onChange={(e) => {
                    setFile(e.currentTarget.files?.[0] ?? null);
                  }}
                />

                <button
                  type="submit"
                  disabled={!file}
                  className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10"
                >
                  Upload photo
                </button>
              </form>
            </div>

            <div className="mt-7 border-t border-white/10 pt-6">
              <h3 className="mb-3 font-semibold text-white">About you</h3>
              <MyUserIntro user={user} />
            </div>
          </section>

          <div className="min-w-0 space-y-8">
            <section aria-labelledby="your-posts">
              <div className="mb-4 flex items-center gap-3">
                <h2
                  id="your-posts"
                  className="text-xl font-semibold text-white"
                >
                  Your posts
                </h2>
                <span className="rounded-full bg-indigo-400/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                  {user.posts.length}
                </span>
              </div>
              <div className="space-y-4">
                {user.posts.length ? (
                  user.posts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
                    >
                      <h3 className="text-lg font-semibold wrap-anywhere text-white">
                        <Link
                          to={`/dashboard/posts/${post.id}`}
                          className="rounded transition hover:text-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <time
                        dateTime={post.createdAt}
                        className="mt-2 block text-xs text-slate-400"
                      >
                        {formatDateTime(post.createdAt)}
                      </time>
                      <p className="mt-4 text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-slate-300">
                        {post.content}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
                    <p className="font-medium text-slate-200">
                      Your story starts here
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      You haven’t published any posts yet.
                    </p>
                    <Link
                      to="/dashboard/writing"
                      className="mt-5 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none"
                    >
                      Write your first post
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section aria-labelledby="your-comments">
              <div className="mb-4 flex items-center gap-3">
                <h2
                  id="your-comments"
                  className="text-xl font-semibold text-white"
                >
                  Your comments
                </h2>
                <span className="rounded-full bg-sky-400/10 px-2.5 py-1 text-xs font-semibold text-sky-300">
                  {user.comments.length}
                </span>
              </div>
              {user.comments.length ? (
                <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5 px-5 sm:px-6">
                  {user.comments.map((comment) => (
                    <article key={comment.id} className="py-5">
                      <p className="text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-slate-300">
                        {comment.content}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <time
                          dateTime={comment.createdAt}
                          className="text-slate-400"
                        >
                          {formatDateTime(comment.createdAt)}
                        </time>
                        <Link
                          to={`/dashboard/posts/${comment.postId}`}
                          className="rounded font-medium text-indigo-300 transition hover:text-indigo-200 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                        >
                          View conversation <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
                  <p className="font-medium text-slate-200">No comments yet</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Join a conversation and your replies will appear here.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
