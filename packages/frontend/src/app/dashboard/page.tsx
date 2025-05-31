import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserResponse, UserResponseSchema } from "@shared/dto/user.dto";
import { fetchServerData } from "@/lib/api.server";
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import ClientDashboard from "@/features/layout/client-dashboard";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get("refresh_token")?.value;
  const cookieString = (await cookieStore).toString();

  if (!refreshToken) {
    redirect("/login");
  }

  const user: UserResponse = await fetchServerData(
    "/users/me",
    cookieString,
    UserResponseSchema
  );

  console.log("User data fetched for dashboard:", user);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["user", user.id],
    queryFn: () => user,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientDashboard
        user={{
          id: user.id,
          email: user.email,
          role: user.role,
          accountId: user.account.id,
          lastName: user.lastName || "",
          firstName: user.firstName || "",
        }}
        account={{ name: user.account.name, industry: user.account.industry }}
      />
    </HydrationBoundary>
  );
}
