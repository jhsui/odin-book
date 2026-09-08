import { useState, type SubmitEventHandler } from "react";
import checkAuth from "../utils/checkAuth.ts";
import { useLoaderData, useRevalidator } from "react-router";

export default function MyProfilePage() {
  const { user } = useLoaderData();
  const revalidator = useRevalidator();

  // todo: delete
  console.log(user);

  const [file, setFile] = useState<File | null>(null);

  // todo: tanstack mutation?
  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      // todo: refine ux
      alert("Please sign in before uploading an avatar.");
      return;
    }

    // todo: refine ux
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

      await revalidator.revalidate();
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    }
  };

  return (
    <>
      <h1>Your Profile</h1>

      {user.image && <img src={user.image} alt="user avatar" />}

      <h2>Upload a new avatar</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
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
    </>
  );
}
