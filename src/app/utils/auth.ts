// hooks/use-signout.ts
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function useSignout() {
  const router = useRouter();

  return async (url: string = "/login") => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(url);
        },
      },
    });
  };
}
