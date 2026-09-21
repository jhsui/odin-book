import { type Comment } from "../comments/Comments.tsx";

export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  images: {
    id: string;
    path: string;
    position: number;
  }[];
};

export type PostDash = Post & { comments: Comment[] };
