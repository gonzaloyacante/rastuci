"use client";

import Footer from "@/components/layout/Footer";
import { HomeSettings } from "@/lib/validation/home";

export default function SiteChrome({
  children,
  home,
}: {
  children: React.ReactNode;
  home?: HomeSettings;
}) {
  return (
    <>
      <div className="grow">{children}</div>
      <Footer home={home} />
    </>
  );
}
