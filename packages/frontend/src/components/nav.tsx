import Image from "next/image"
import { Button } from "./ui/button"
import Link from "next/link"

export const Nav = () => {
  return (
    <nav className="flex justify-between items-center">
      <Image src="/WorkSync.svg" width={80} height={56} alt="TaskSphere" />
      <Button variant="secondary">
        <Link href="/register">Sign Up</Link>
      </Button>
    </nav>
  )
}
