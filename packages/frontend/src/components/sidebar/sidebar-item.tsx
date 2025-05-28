import Link from "next/link";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import React, { useState } from "react";
import { NavMainItem } from "./sidebar.types";
import { cn } from "@/lib/utils";

export const SidebarItem = ({
  label,
  href,
  icon,
  items,
  isCollapsed = false,
}: NavMainItem) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const hasChildren = items && items.length > 0;

  const toggleDropdown = () => {
    if (hasChildren) {
      console.log(isOpen);
      setIsOpen(!isOpen);
    }
  };

  return (
    <li className="mb-2">
      {href && !hasChildren ? (
        <Link
          href={href}
          className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          {icon && <span className={cn("mr-2")}>{icon} </span>}
          {!isCollapsed && (
            <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
              {label}
            </span>
          )}
        </Link>
      ) : (
        <>
          <button
            type="button"
            onClick={toggleDropdown}
            aria-controls="item-dropdown"
            data-collapse-toggle="item-dropdown"
            className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            {icon && <span className={cn("mr-2")}>{icon}</span>}
            {!isCollapsed && (
              <>
                <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">
                  {label}
                </span>
                {hasChildren ? (
                  isOpen ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )
                ) : (
                  ""
                )}
              </>
            )}
          </button>
          <ul
            id="item-dropdown"
            className={cn("py-2 space-y-2", isOpen ? "block" : "hidden")}
          >
            {items &&
              items.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </>
      )}
    </li>
  );
};
