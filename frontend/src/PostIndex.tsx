import { useQuery } from "@tanstack/react-query";
import formatDateTime from "./utils/formatDateTime.ts";

type PostListItem = {
  id: string;
  title: string;
  createdAt: string;
  author: {
    name: string;
  };
};

export default function PostIndex() {
  const {
    data: posts,
    isError,
    isLoading,
    error,
  } = useQuery<PostListItem[]>({
    queryKey: ["post-index"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/posts/index");

      if (!res.ok) {
        throw new Error("Failed to get post index");
      }

      const { posts } = (await res.json()) as {
        posts: PostListItem[];
      };

      return posts;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Internal Error</div>;
  }

  return (
    <>
      <h1>Post Index</h1>
      <div>
        {posts && (
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                {post.title} by {post.author.name} at{" "}
                {formatDateTime(post.createdAt)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
