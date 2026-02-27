"use client";

import Footer from "@/components/layout/Footer";
import { ContactSettings } from "@/lib/validation/contact";
import { HomeSettings } from "@/lib/validation/home";

export default function SiteChrome({
  children,
  home,
  contact,
}: {
  children: React.ReactNode;
  home?: HomeSettings;
  contact?: ContactSettings;
}) {
  return (
    <>
      <div className="grow">{children}</div>
      <Footer home={home} contact={contact} />
    </>
  );
}
