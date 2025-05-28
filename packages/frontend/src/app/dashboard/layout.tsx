import Sidebar from "@/components/sidebar";
import { LayoutProps } from "@/types/layout-props.types";

const DashboardLayout = ({ children }: LayoutProps) => {
  return (
    <div className="bg-neutral-200 min-h-screen">
      <div className="flex w-full h-full">
        <div className="fixed left-0 top-0 hidden lg:block lg-w-[264px] h-full overflow-y-auto">
          <Sidebar />
        </div>
        <div className="lg:pl-[264px]">
          <div className="mx-auto max-w-screen-2xl h-full">
            <main className="h-full py-8 px-6 flex flex-col">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
