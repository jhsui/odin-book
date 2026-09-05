import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { authClient } from "../lib/auth-client.ts";

type ProfileData = {};

// this is for general user view
export default function UserProfile({ userId }: { userId: string }) {
  const { data: session } = authClient.useSession();

  const queryClient = useQueryClient();
  const currentUserId = session?.user.id;
  const queryKey = ["user-profile", userId] as const;

  const {
    data: profileData,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey,

    queryFn: async (): Promise<ProfileData> => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/profile/${userId}`,
        {
          credentials: "include",
        },
      );

      if (!res.ok) {
        throw new Error(`Could not retrieve user profile: ${res.status}`);
      }

      return res.json();
    },
  });

  return (
    <>
      <h1>User Profile</h1>
    </>
  );
}
