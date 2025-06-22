import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ClientProjects from "@/features/layout/client-projects";

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    redirect("/login");
  }

  return (
    <HydrationBoundary state={dehydrate(new QueryClient())}>
      <ClientProjects />
    </HydrationBoundary>
  );
}
