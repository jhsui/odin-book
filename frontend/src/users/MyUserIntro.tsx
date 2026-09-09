import { useState, type SubmitEventHandler } from "react";
import type { User } from "./types.ts";
import { useRevalidator } from "react-router";

export default function MyUserIntro({ user }: { user: User }) {
  const [showIntroInput, setShowIntroInput] = useState(false);
  const [intro, setIntro] = useState(user.intro ?? "");

  const revalidator = useRevalidator();

  const handleIntroSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/me/intro`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intro }),
      },
    );

    if (!res.ok) {
      throw new Error("Failed to update intro");
    }

    const updated = await res.json();
    // todo: delete
    console.log(updated.message);

    await revalidator.revalidate();

    setShowIntroInput(false);
  };

  return (
    <>
      <p>{user.intro || "You haven't added an intro yet."}</p>
      <button
        type="button"
        hidden={showIntroInput}
        // todo: (prev) => !prev or true
        onClick={() => setShowIntroInput(true)}
      >
        {user.intro ? "Edit Intro" : "Add an introduction"}
      </button>

      {showIntroInput && (
        <form onSubmit={handleIntroSubmit}>
          <label htmlFor="intro">Intro</label>
          <textarea
            id="intro"
            name="intro"
            value={intro}
            onChange={(e) => setIntro(e.currentTarget.value)}
          ></textarea>

          <button type="button" onClick={() => setShowIntroInput(false)}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </form>
      )}
    </>
  );
}
