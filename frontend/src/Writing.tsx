import { useState, type ChangeEvent, type SubmitEventHandler } from "react";
import { authClient } from "./lib/auth-client.ts";

export default function Writing() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const { data: session, error } = authClient.useSession();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      if (error || !session) {
        alert("Something went wrong, please try to sign in or sign up.");
        return;
      }

      const res = await fetch("http://localhost:3000/posts", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? `Request failed: ${res.status}`);
      }

      //
      console.log("STATUS:", res.status);
      console.log("RESPONSE:", data);
      //
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
          Write Your Post
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-slate-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter a title"
              className="rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="content"
              className="text-sm font-medium text-slate-700"
            >
              Content
            </label>
            <textarea
              name="content"
              id="content"
              rows={8}
              placeholder="Write your post..."
              className="resize-y rounded-lg border border-slate-300 px-4 py-3 text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="self-start rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 focus:outline-none active:scale-[0.98]"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
}
