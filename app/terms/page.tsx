import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { terms, termsUpdated } from "@/lib/legal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: `The terms you accept by using the ${site.name} website — what the listings are, what the prices cover, and what a payment estimate is not.`,
  robots: { index: true, follow: false },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & conditions"
      lede="What the listings are, what the prices cover, and what a payment estimate on this site is not."
      updated={termsUpdated}
      sections={terms}
      breadcrumbLabel="Terms"
      breadcrumbHref="/terms"
    />
  );
}
