"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";

export interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarLinkProps {
  link: NavLink;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}

export const SidebarLink = ({
  link,
  isOpen,
  isActive,
  onClick,
}: SidebarLinkProps) => {
  const Icon = link.icon;
  return (
    <li className={isOpen ? "w-full" : "flex justify-center"}>
      <Link
        href={link.href}
        onClick={onClick}
        className={`flex items-center ${isOpen ? "gap-3 px-4 py-3" : "justify-center p-3"}
          rounded-lg transition-all duration-200 text-base font-medium cursor-pointer group
          ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted hover:bg-surface-secondary hover:text-primary hover:shadow-sm"
          }`}
      >
        <Icon
          className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-primary" : "group-hover:text-primary"}`}
        />
        {isOpen && <span>{link.name}</span>}
      </Link>
    </li>
  );
};
