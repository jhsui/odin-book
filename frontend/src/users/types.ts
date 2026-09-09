export type UserListItem = {
  id: string;
  createdAt: string;
  name: string;
  isFollowing: boolean;
};

export type User = {
  id: string;
  name: string;
  image: string;
  intro: string;

  posts: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }[];

  comments: {
    id: string;
    content: string;
    postId: string;
    createdAt: string;
  }[];
};
