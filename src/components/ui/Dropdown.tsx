"use client";

import React, { createContext, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Accessible, headless Dropdown primitives
// Usage:
// <Dropdown>
//   <DropdownTrigger>Opciones</DropdownTrigger>
//   <DropdownMenu>
//     <DropdownItem onSelect={...}>Item</DropdownItem>
//   </DropdownMenu>
// </Dropdown>

type DropdownContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerId: string;
  menuId: string;
};

const DropdownContext = createContext<DropdownContextType | null>(null);

export function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) {throw new Error("useDropdown must be used within <Dropdown>");}
  return ctx;
}

export const Dropdown = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [open, setOpen] = useState(false);
  const triggerId = useId();
  const menuId = useId();
  const value = useMemo(() => ({ open, setOpen, triggerId, menuId }), [open, triggerId, menuId]);

  // close on escape / outside
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {setOpen(false);}
    };
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) {return;}
      if (!menuRef.current.contains(e.target as Node)) {setOpen(false);}
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={value}>
      <div className={cn("relative inline-block", className)} ref={menuRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, triggerId, menuId } = useDropdown();
    return (
      <button
        ref={ref}
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(e) => {
          props.onClick?.(e);
          setOpen(!open);
        }}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownTrigger.displayName = "DropdownTrigger";

export const DropdownMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, role = "menu", ...props }, ref) => {
    const { open, menuId, triggerId } = useDropdown();
    if (!open) {return null;}
    return (
      <div
        ref={ref}
        id={menuId}
        role={role}
        aria-labelledby={triggerId}
        className={cn(
          "absolute z-30 mt-2 min-w-[10rem] surface border border-muted rounded-lg shadow-lg p-1 focus:outline-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenu.displayName = "DropdownMenu";

type DropdownItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onSelect?: () => void;
};

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, children, onSelect, ...props }, ref) => {
    const { setOpen } = useDropdown();
    return (
      <button
        ref={ref}
        role="menuitem"
        onClick={(e) => {
          props.onClick?.(e);
          onSelect?.();
          setOpen(false);
        }}
        className={cn(
          "w-full text-left px-3 py-2 rounded-md text-sm cursor-pointer transition-colors duration-200",
          "hover:bg-primary hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownItem.displayName = "DropdownItem";

export default Dropdown;
