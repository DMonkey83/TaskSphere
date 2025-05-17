import { Nav } from "@/components/nav";
import { LayoutSidebar } from "@/features/layout/sidebar";

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <LayoutSidebar>
      <main className="bg-neutral-200 min-h-screen">
        <div className="mx-auto max-w-screen-2xl p-4">
          <Nav />
          <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
            {children}
          </div>
        </div>
      </main>
    </LayoutSidebar>
  )
}

export default DashboardLayout;
