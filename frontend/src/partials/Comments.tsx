import { useQuery } from "@tanstack/react-query";
import formatDateTime from "../utils/formatDateTime";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
};

export default function Comments({ postId }: { postId: string }) {
  const {
    data: comments = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async (): Promise<Comment[]> => {
      const res = await fetch(
        `http://localhost:3000/posts/${encodeURIComponent(postId)}/comments`,
      );

      if (!res.ok) {
        throw new Error("Failed to fetch comments.");
      }

      const { comments }: { comments: Comment[] } = await res.json();

      return comments;
    },
  });

  if (isPending) return <p>Loading comments...</p>;
  if (isError) return <p>{error.message}</p>;

  return (
    <ul>
      {comments.map((comment: Comment) => (
        <li key={comment.id}>
          <p>{comment.content}</p>
          <p> {formatDateTime(comment.createdAt)}</p>
          <p>{comment.author.name}</p>
        </li>
      ))}
    </ul>
  );
}
