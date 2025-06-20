"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface PopoverProps {
  children: React.ReactNode;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}

const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

const Popover = ({ children }: PopoverProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = ({ children, asChild }: PopoverTriggerProps) => {
  const { open, setOpen } = React.useContext(PopoverContext);

  if (asChild) {
    if (!React.isValidElement(children)) {
      throw new Error(
        "PopoverTrigger with asChild expects a single React element as children."
      );
    }
    
    const element = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    
    return React.cloneElement(element, {
      onClick: (e: React.MouseEvent) => {
        if (element.props.onClick) {
          element.props.onClick(e);
        }
        setOpen(!open);
      },
    });
  }

  return (
    <button type="button" onClick={() => setOpen(!open)}>
      {children}
    </button>
  );
};

const PopoverContent = ({
  children,
  className,
  align = "center",
}: PopoverContentProps) => {
  const { open, setOpen } = React.useContext(PopoverContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full mt-2 z-50 rounded-md border bg-white p-4 shadow-md",
        alignmentClasses[align],
        className
      )}
    >
      {children}
    </div>
  );
};

export { Popover, PopoverTrigger, PopoverContent };
