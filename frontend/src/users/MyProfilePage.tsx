import { useState, type SubmitEventHandler } from "react";
import checkAuth from "../utils/checkAuth.ts";

export default function UserOwnProfile() {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      alert("Please sign in before uploading an avatar.");
      return;
    }

    if (!file) return;

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
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  return (
    <>
      <h1>Your Profile</h1>

      <h2>Upload a new avatar</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label htmlFor="uploaded-avatar">New Avatar</label>
        <input
          type="file"
          accept="image/*"
          name="uploaded-avatar"
          id="uploaded-avatar"
          onChange={(event) => {
            setFile(event.currentTarget.files?.[0] ?? null);
          }}
        />

        <button type="submit" disabled={!file}>
          Upload
        </button>
      </form>
    </>
  );
}
