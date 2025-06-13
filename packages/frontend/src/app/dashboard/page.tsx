import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ClientDashboard from "@/features/layout/client-dashboard";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    redirect("/login");
  }

  return (
    <HydrationBoundary state={dehydrate(new QueryClient())}>
      <ClientDashboard />
    </HydrationBoundary>
  );
}
