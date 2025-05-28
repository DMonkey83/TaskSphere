import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"
import { SidebarTrigger } from "./ui/sidebar"
import { Separator } from "./ui/separator"

interface NavProps {
  useSidebar: boolean
}

export const Nav = ({ useSidebar }: NavProps) => {
  return (
    <header className="pt-4 pb-4 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
      <div className="flex items-center w-full gap-2 px-4">
        {useSidebar && (
          <>
            <SidebarTrigger className="ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </>
        )}
        <div className="flex justify-between w-full items-center gap-2 px-4">
          <Image src="/WorkSync.svg" width={80} height={56} alt="TaskSphere" />
          <Button variant="secondary">
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
