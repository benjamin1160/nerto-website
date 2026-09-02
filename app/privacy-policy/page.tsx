import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { privacy, privacyUpdated } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `What ${site.name} collects when you use this site, why, and what happens to it afterwards.`,
  robots: { index: true, follow: false },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      lede="What we collect, why we collect it, and what we do not do with it."
      updated={privacyUpdated}
      sections={privacy}
      breadcrumbLabel="Privacy"
      breadcrumbHref="/privacy-policy"
    />
  );
}
