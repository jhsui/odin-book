import { useState, type ChangeEvent, type SubmitEventHandler } from "react";
import { authClient } from "./lib/auth-client.ts";
import Comments from "./partials/Comments.tsx";

export default function CommentSection({ postId }: { postId: string }) {
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const { data: session, error } = authClient.useSession();

  const handleCommentSubmit: SubmitEventHandler<HTMLFormElement> = async (
    e,
  ) => {
    e.preventDefault();

    if (error || !session) {
      alert("Something went wrong, please try to sign in or sign up.");
      return;
    }

    // check empty
    if (!comment.trim()) {
      alert("Comment can not be empty.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/posts/${encodeURIComponent(postId)}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment }),
        },
      );

      if (!res.ok) {
        throw new Error("Comment submission failed.");
      }

      const { message } = await res.json();

      setMessage(message);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setComment(e.target.value);

  return (
    <>
      <form onSubmit={handleCommentSubmit}>
        <label htmlFor="comment"></label>
        <input
          type="text"
          id="comment"
          name="comment"
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
        {message && <p>{message}</p>}
      </form>

      <Comments postId={postId}></Comments>
    </>
  );
}
