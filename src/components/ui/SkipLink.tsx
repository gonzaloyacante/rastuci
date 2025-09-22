"use client";

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 surface text-primary px-4 py-2 rounded-md focus:ring-2 focus:ring-primary focus:outline-none z-50"
    >
      {children}
    </a>
  );
}
