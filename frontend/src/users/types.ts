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
};
