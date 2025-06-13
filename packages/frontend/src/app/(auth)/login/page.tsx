import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginCard } from "@/features/auth/components/login-card";

const LoginPage = async () => {
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get("access_token")?.value;

  if (refreshToken) {
    redirect("/dashboard");
  }
  return (
    <div>
      <LoginCard />
    </div>
  );
};

export default LoginPage;
