"use client";

import Footer from "@/components/Footer";
import { useHomeData } from "@/hooks/useHomeData";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const { home } = useHomeData();

  return (
    <>
      <div className="flex-grow">{children}</div>
      <Footer home={home} />
    </>
  );
}
