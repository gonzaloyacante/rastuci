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
          rounded-lg transition-colors text-base font-medium cursor-pointer
          ${isActive ? "surface-secondary text-primary" : "hover:surface-secondary hover:text-primary"}`}
            >
                <Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`}
                />
                {isOpen && <span>{link.name}</span>}
            </Link>
        </li>
    );
};
