import { useEffect, useRef, useState, type SubmitEventHandler } from "react";
import { Link, useLoaderData, useRevalidator } from "react-router";
import PageShell, { PageHeading } from "../layout/PageShell.tsx";
import MyUserIntro from "./MyUserIntro.tsx";
import FollowButton from "./FollowButton.tsx";
import type { User, FollowUser } from "./types.ts";
import formatDateTime from "../utils/formatDateTime.ts";
import DeleteCommentButton from "../comments/DeleteCommentButton.tsx";
import { DeletePostButton } from "../posts/DeletePostButton.tsx";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MiB
const AVATAR_SIZE_ERROR =
  "This file is too large. Choose an image of 5 MiB or smaller.";

export default function MyProfilePage() {
  const { user } = useLoaderData<{ user: User }>();

  const [file, setFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState("");

  const revalidator = useRevalidator();

  const [showNameEditor, setShowNameEditor] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [activeConnections, setActiveConnections] = useState<
    "followers" | "following" | null
  >(null);

  // Keep the visible people fixed until the dialog is opened again.
  const [connections, setConnections] = useState<FollowUser[]>([]);

  const connectionsDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!activeConnections) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeConnections]);

  const handleAvatarSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!file) return;
    setAvatarError("");

    // Package avatar for multer.
    const avatarData = new FormData();
    avatarData.append("avatar", file);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me/avatar`,
        {
          method: "PUT",
          credentials: "include",
          body: avatarData,
        },
      );

      if (res.status === 413) {
        setAvatarError(AVATAR_SIZE_ERROR);
        return;
      }

      if (!res.ok) {
        throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
      }

      setFile(null);
      setAvatarError("");

      form.reset();

      await revalidator.revalidate();
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      setAvatarError("Couldn't upload your photo. Please try again.");
    }
  };

  const handleNameSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!newName.trim()) {
      setNameError("Username can not be empty.");
      nameInputRef.current?.focus();
      return;
    }

    setNameError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/me/name`,
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

      setNewName("");
      // todo: use Form to revalidate?
      await revalidator.revalidate();
    } catch (error) {
      console.error("Failed to edit username:", error);
    }
  };

  return (
    <PageShell>
      <PageHeading
        eyebrow="Your space"
        title="Your profile"
        description="Update your profile and revisit what you’ve shared."
      >
        <Link to="/dashboard/writing" className="ui-button-primary gap-2">
          <span aria-hidden="true">+</span> Write a post
        </Link>
      </PageHeading>

      <div className="grid items-start gap-7 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-10">
        <section
          aria-label="Profile settings"
          className="ui-card min-w-0 overflow-hidden p-5 sm:p-7"
        >
          <div
            aria-hidden="true"
            className="bg-brand-700 -mx-5 -mt-5 h-28 sm:-mx-7 sm:-mt-7"
          />
          <div className="relative -mt-12">
            <div className="mb-5">
              {user.image ? (
                <img
                  src={user.image}
                  alt="Your avatar"
                  className="size-24 rounded-full bg-white object-cover ring-[5px] ring-white"
                />
              ) : (
                <span className="bg-brand-50 text-brand-700 flex size-24 items-center justify-center rounded-full text-3xl font-semibold ring-[5px] ring-white">
                  {user.name.trim().charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>
            <p className="text-brand-700 mb-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
              Your profile
            </p>
            <h2 className="font-display text-ink text-3xl tracking-tight wrap-anywhere">
              {user.name}
            </h2>

            <button
              type="button"
              aria-expanded={showNameEditor}
              aria-controls="name-editor"
              className="ui-link mt-2 min-h-11 py-2 text-sm font-semibold"
              onClick={() => {
                setNewName("");
                setNameError("");
                setShowNameEditor((prev) => !prev);
              }}
            >
              {showNameEditor ? "Cancel editing" : "Edit name"}
            </button>
            {showNameEditor && (
              <div
                id="name-editor"
                className="bg-canvas mt-4 rounded-2xl border border-stone-200 p-4"
              >
                <form
                  noValidate
                  onSubmit={handleNameSubmit}
                  className="space-y-3"
                >
                  <label htmlFor="new-name" className="ui-label">
                    New username
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    id="new-name"
                    name="new-name"
                    required
                    aria-invalid={Boolean(nameError) || undefined}
                    aria-describedby={nameError ? "name-error" : undefined}
                    placeholder="Type your new username"
                    className="ui-input min-w-0 aria-invalid:border-rose-400 aria-invalid:focus:border-rose-400 aria-invalid:focus:ring-rose-400"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.currentTarget.value);
                      if (e.currentTarget.value.trim()) {
                        setNameError("");
                      }
                    }}
                  />

                  {nameError && (
                    <p
                      id="name-error"
                      role="alert"
                      className="text-sm leading-5 text-rose-700"
                    >
                      {nameError}
                    </p>
                  )}
                  <button type="submit" className="ui-button-primary w-full">
                    Save name
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="mt-6">
            <div
              className="grid grid-cols-2 gap-3"
              aria-label="Your connections"
            >
              {(["followers", "following"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  aria-expanded={activeConnections === kind}
                  aria-controls="profile-connections"
                  aria-haspopup="dialog"
                  onClick={() => {
                    setConnections(
                      kind === "followers"
                        ? user.followers.map(({ follower }) => follower)
                        : user.following.map(({ following }) => following),
                    );
                    setActiveConnections(kind);
                    connectionsDialogRef.current?.showModal();
                  }}
                  className={`focus-visible:ring-brand-600 cursor-pointer rounded-2xl border px-4 py-4 text-left transition focus-visible:ring-2 focus-visible:outline-none ${
                    activeConnections === kind
                      ? "border-brand-200 bg-brand-50"
                      : "bg-canvas hover:border-brand-200 hover:bg-brand-50 border-stone-200/80"
                  }`}
                >
                  <span className="text-ink block text-2xl font-semibold tabular-nums">
                    {user[kind].length}
                  </span>

                  <span className="mt-1 block text-xs text-stone-500">
                    {kind === "followers" ? "Followers" : "Following"}
                  </span>
                </button>
              ))}
            </div>

            <dialog
              ref={connectionsDialogRef}
              id="profile-connections"
              aria-labelledby="connections-title"
              onClose={() => setActiveConnections(null)}
              onClick={(event) => {
                if (event.target !== event.currentTarget) return;
                const bounds = event.currentTarget.getBoundingClientRect();
                if (
                  event.clientX < bounds.left ||
                  event.clientX > bounds.right ||
                  event.clientY < bounds.top ||
                  event.clientY > bounds.bottom
                ) {
                  event.currentTarget.close();
                }
              }}
              className="text-ink m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-stone-200 bg-white p-0 shadow-xl backdrop:bg-stone-950/40 backdrop:backdrop-blur-sm"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-stone-200 bg-white px-5 py-4 sm:px-6">
                <h2
                  id="connections-title"
                  className="font-display flex items-center gap-3 text-2xl"
                >
                  {activeConnections === "followers"
                    ? "Followers"
                    : "Following"}
                  <span className="ui-badge tabular-nums">
                    {activeConnections ? user[activeConnections].length : 0}
                  </span>
                </h2>

                <button
                  type="button"
                  aria-label="Close connections"
                  onClick={() => connectionsDialogRef.current?.close()}
                  className="focus-visible:ring-brand-600 flex size-11 shrink-0 items-center justify-center rounded-full text-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              {connections.length ? (
                <ul
                  aria-label={
                    activeConnections === "followers"
                      ? "Your followers"
                      : "People you follow"
                  }
                  className="space-y-1 p-3"
                >
                  {connections.map((person) => (
                    <li key={person.id} className="flex items-center gap-2">
                      <Link
                        to={`/user-profile/${person.id}`}
                        onClick={() => connectionsDialogRef.current?.close()}
                        className="hover:text-brand-600 focus-visible:ring-brand-600 flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50 focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <span
                          aria-hidden="true"
                          className="bg-brand-50 text-brand-700 relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold"
                        >
                          {person.name.trim().charAt(0).toUpperCase() || "?"}
                          {person.image && (
                            <img
                              key={person.image}
                              src={person.image}
                              alt={`User ${person.name}'s avatar`}
                              className="absolute inset-0 size-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                        </span>

                        <span className="min-w-0 flex-1 truncate">
                          {person.name}
                        </span>

                        <span aria-hidden="true" className="shrink-0">
                          →
                        </span>
                      </Link>

                      <div className="shrink-0">
                        <FollowButton
                          userId={person.id}
                          isFollowing={user.following.some(
                            ({ following }) => following.id === person.id,
                          )}
                          onFollowChange={() => revalidator.revalidate()}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-6 py-10 text-center text-sm leading-6 text-stone-500">
                  {activeConnections === "followers"
                    ? "You don't have any followers yet."
                    : "You aren't following anyone yet."}
                </p>
              )}
            </dialog>
          </div>

          <div className="mt-7 border-t border-stone-200 pt-6">
            <form
              onSubmit={handleAvatarSubmit}
              encType="multipart/form-data"
              className="mt-4 space-y-3"
            >
              <p id="avatar-label" className="ui-label">
                Upload a new avatar
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                id="uploaded-avatar"
                name="uploaded-avatar"
                aria-labelledby="avatar-label"
                aria-describedby={
                  avatarError
                    ? "avatar-size-hint avatar-error"
                    : "avatar-size-hint"
                }
                className="bg-canvas file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 focus-visible:ring-brand-600 block w-full min-w-0 rounded-2xl border border-dashed border-stone-300 p-3 text-xs text-stone-500 transition-transform file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:px-3 file:py-2 file:text-xs file:font-semibold focus-visible:outline-none active:scale-[0.97]"
                onChange={(e) => {
                  const selectedFile = e.currentTarget.files?.[0] ?? null;

                  if (selectedFile && selectedFile.size > MAX_AVATAR_SIZE) {
                    setFile(null);
                    setAvatarError(AVATAR_SIZE_ERROR);
                    return;
                  }

                  setFile(selectedFile);
                  setAvatarError("");
                }}
              />

              <p id="avatar-size-hint" className="text-xs text-stone-500">
                Maximum file size: 5 MiB.
              </p>
              {avatarError && (
                <p
                  id="avatar-error"
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                >
                  {avatarError}
                </p>
              )}

              <button
                type="submit"
                disabled={!file}
                className="ui-button-secondary w-full transition-transform active:scale-[0.97]"
              >
                Upload photo
              </button>
            </form>
          </div>

          <div className="mt-7 border-t border-stone-200 pt-6">
            <h3 className="text-ink mb-3 text-sm font-semibold">About you</h3>
            <MyUserIntro user={user} />
          </div>
        </section>

        <div className="min-w-0 space-y-10">
          <section aria-labelledby="your-posts">
            <div className="mb-5 flex items-center gap-3 border-b border-stone-200 pb-4">
              <h2
                id="your-posts"
                className="font-display text-ink text-2xl tracking-tight"
              >
                Your posts
              </h2>

              <span className="ui-badge">{user.posts.length}</span>
            </div>
            <div className="space-y-3">
              {user.posts.length ? (
                user.posts.map((post) => (
                  <article
                    key={post.id}
                    className="ui-card hover:border-brand-200 flex min-w-0 flex-col gap-4 p-5 transition sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  >
                    <div className="min-w-0">
                      <h3 className="text-ink text-lg leading-7 font-semibold tracking-tight wrap-anywhere">
                        <Link
                          to={`/posts/${post.id}`}
                          className="hover:text-brand-600 focus-visible:ring-brand-600 rounded transition focus-visible:ring-2 focus-visible:outline-none"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <time
                        dateTime={post.createdAt}
                        className="mt-1 block text-xs leading-5 text-stone-500 sm:text-sm"
                      >
                        {formatDateTime(post.createdAt)}
                      </time>
                    </div>

                    <div className="max-w-full shrink-0">
                      <DeletePostButton
                        postId={post.id}
                        authorId={user.id}
                        onDeleted={() => revalidator.revalidate()}
                      />
                    </div>
                  </article>
                ))
              ) : (
                <div className="ui-empty">
                  <p className="font-medium text-stone-900">
                    Your story starts here
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    You haven’t published any posts yet.
                  </p>
                  <Link
                    to="/dashboard/writing"
                    className="ui-button-primary mt-5"
                  >
                    Write your first post
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="your-comments">
            <div className="mb-5 flex items-center gap-3 border-b border-stone-200 pb-4">
              <h2
                id="your-comments"
                className="font-display text-ink text-2xl tracking-tight"
              >
                Your comments
              </h2>
              <span className="ui-badge">{user.comments.length}</span>
            </div>

            {user.comments.length ? (
              <div className="space-y-5">
                {user.comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="ui-card min-w-0 p-5 sm:p-6"
                  >
                    <p className="text-xs text-stone-600">
                      {comment.post.title}
                    </p>
                    <p className="text-base leading-7 font-bold wrap-anywhere whitespace-pre-wrap text-stone-800 italic">
                      {comment.content}
                    </p>

                    <footer className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-stone-200 pt-4">
                      <time
                        dateTime={comment.createdAt}
                        className="text-xs leading-5 text-stone-500 sm:text-sm"
                      >
                        {formatDateTime(comment.createdAt)}
                      </time>

                      <div className="flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 [&>div]:mt-0">
                        <Link
                          to={`/posts/${comment.postId}`}
                          className="ui-link min-h-11 items-center py-2 text-sm font-semibold"
                        >
                          View conversation <span aria-hidden="true">→</span>
                        </Link>

                        <DeleteCommentButton
                          commentId={comment.id}
                          authorId={user.id}
                          onDeleted={() => revalidator.revalidate()}
                        />
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="ui-empty">
                <p className="font-medium text-stone-900">No comments yet</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Join a conversation and your replies will appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
