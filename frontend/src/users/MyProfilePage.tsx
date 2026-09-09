import { useState, type SubmitEventHandler } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import MyUserIntro from "./MyUserIntro.tsx";

export default function MyProfilePage() {
  const { user } = useLoaderData();

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
    <>
      <h1>Your Profile</h1>

      <div>
        <h2>{user.name}</h2>

        <button
          type="button"
          onClick={() => setShowNameEditor((prev) => !prev)}
        >
          Edit
        </button>
        {showNameEditor && (
          <div className="rounded-lg border border-amber-800 p-4">
            <form onSubmit={handleNameSubmit} className="flex gap-3">
              <label htmlFor="new-name" className="sr-only">
                New username
              </label>
              <input
                type="text"
                id="new-name"
                name="new-name"
                placeholder="Type your new username"
                className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-amber-800 focus:ring-1 focus:ring-amber-800 focus:outline-none"
                onChange={(e) => {
                  setNewName(e.currentTarget.value);
                }}
              />
              <button
                type="submit"
                className="rounded-md bg-amber-800 px-4 py-2 text-white hover:bg-amber-900"
              >
                Submit
              </button>
            </form>
          </div>
        )}
      </div>

      <div>
        {user.image && <img src={user.image} alt="your avatar" />}

        <h2>Upload a new avatar</h2>

        <form onSubmit={handleAvatarSubmit} encType="multipart/form-data">
          <label htmlFor="uploaded-avatar">New Avatar</label>
          <input
            type="file"
            accept="image/*"
            name="uploaded-avatar"
            id="uploaded-avatar"
            onChange={(e) => {
              setFile(e.currentTarget.files?.[0] ?? null);
            }}
          />

          <button type="submit" disabled={!file}>
            Upload
          </button>
        </form>
      </div>

      <MyUserIntro user={user} />
    </>
  );
}
