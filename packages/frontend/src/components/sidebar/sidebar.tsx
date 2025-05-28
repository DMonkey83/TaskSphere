"use client";

import { MdOutlineDashboard, MdTask } from "react-icons/md";
import { AiOutlineTeam } from "react-icons/ai";
import { FcMenu } from "react-icons/fc";
import { FaProjectDiagram, FaSearch } from "react-icons/fa";
import { SidebarProps } from "./sidebar.types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./sidebar-item";
import { Button } from "../ui/button";
import { DottedSeparator } from "../dotted-separator";
import Link from "next/link";
import Image from "next/image";

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems: SidebarProps = {
    user: {
      avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
      email: "email",
      name: "John Doe",
    },
    teams: [{ label: "Team A", icon: <AiOutlineTeam /> }],
    navMain: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <MdOutlineDashboard />,
        isActive: true,
        items: [],
      },
      {
        label: "Tasks",
        href: "/tasks",
        icon: <MdTask />,
        items: [],
      },
      {
        label: "Projects",
        icon: <FaProjectDiagram />,
        items: [
          {
            label: "Project A",
            href: "/projects/project-a",
          }
        ],
      },
    ],
    projects: [
      {
        label: "Project B",
        href: "/projects/project-b",
        icon: <FaSearch />,
      },
    ],
  };
  return (
    <aside
      className={cn(
        "flex h-screen",
        isCollapsed ? "w-16" : "w-64",
        "transition-width duration-200 ease-in-out bg-gray-50 dark:gb-gray-800 dark:border-gray-700"
      )}
    >
      <div className="flex flex-col flex-grow h-full bg-neutral-100 p-4 w-full">
        <div className="flex item-center justify-between p-4">
          <Button
            disabled={false}
            size="icon"
            variant="secondary"
            onClick={toggleSidebar}
          >
            <FcMenu className="flex justify-center items-center size-5" />
          </Button>
        </div>
        <Link
          href="https://flowbite.com/"
          className="flex items-center ps-2.5 mb-5"
        >
          <Image
            src="/WorkSync.svg"
            className="h-6 me-3 sm:h-7"
            alt="Tasksphere Logo"
            width={80} 
            height={56}
          />
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            TaskSphere
          </span>
        </Link>
        <DottedSeparator />
        <ul className="flex-grow p-4">
          {menuItems?.navMain.map((item, index) => (
            <SidebarItem
              isCollapsed={isCollapsed}
              key={`${item.label}-${index}`}
              {...item}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};
