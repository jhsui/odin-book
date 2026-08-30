import { useQuery } from "@tanstack/react-query";
import FollowButton from "./partials/FollowButton";
import { authClient } from "./lib/auth-client.ts";

type User = {
  id: string;
  createdAt: string;
  name: string;
};

export default function UserIndex() {
  const { data: session } = authClient.useSession();

  const { data, isError, isLoading, error } = useQuery<User[]>({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/users/all");

      if (!res.ok) throw new Error("Failed to get user data");

      const { users } = await res.json();
      return users;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <>
      <h1>User Index</h1>

      <ul>
        {data?.map((user) => (
          <li key={user.id}>
            <span>{user.name}</span>

            {session ? (
              session.user.id === user.id ? (
                <span>You</span>
              ) : (
                <FollowButton userId={user.id} />
              )
            ) : (
              <button onClick={() => alert("Please sign in first.")}>
                Follow
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
