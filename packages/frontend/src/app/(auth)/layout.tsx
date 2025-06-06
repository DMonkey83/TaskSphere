import { Nav } from "@/components/nav";

export interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main className="bg-neutral-200 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <Nav useSidebar={false} />
        <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
          {children}
        </div>
      </div>
    </main>
  )
}

export default AuthLayout;
