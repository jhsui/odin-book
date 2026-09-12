export type UserListItem = {
  id: string;
  name: string;
  image: string | null;
  createdAt: string;
  isFollowing: boolean;
  isAnonymous: boolean;
};

export type FollowUser = Pick<UserListItem, "id" | "name" | "image">;

export type User = {
  id: string;
  name: string;
  image: string;
  intro: string;

  followers: { follower: FollowUser }[];
  following: { following: FollowUser }[];

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
