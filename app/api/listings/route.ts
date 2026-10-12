import { listings } from "@/lib/homes";
import { photoFor } from "@/lib/photos";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = 300;

type ApiStatus = "available" | "pending" | "coming-soon" | "to-order" | "sold";
type ApiSections = "single" | "double" | "triple";
type SourceListing = (typeof listings)[number] & {
  onLot?: boolean;
  lotModel?: boolean;
  builder?: string;
  construction?: "manufactured" | "modular";
  widthFt?: number;
  tagline?: string;
  story?: string[];
  tourUrl?: string;
};

const statusLabels: Record<ApiStatus, string> = {
  available: "Available",
  pending: "Pending",
  "coming-soon": "Coming soon",
  "to-order": "To order",
  sold: "Sold",
};

// Only treat `available` as physically on-lot where this source explicitly uses it that way.
const availableImpliesOnLot = false;
const featuredImpliesOnLot = false;

function absolute(value: string): string {
  return new URL(value, `${site.url.replace(/\/+$/, "")}/`).toString();
}

function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function sectionsOf(listing: SourceListing): ApiSections {
  if (listing.sections) return listing.sections;
  if ((listing.widthFt ?? 0) >= 40) return "triple";
  if ((listing.widthFt ?? 0) >= 24) return "double";
  return "single";
}

function availabilityOf(listing: SourceListing): { onLot: boolean; status: ApiStatus } {
  const sourceStatus = String(listing.status);
  let onLot = listing.onLot ?? listing.lotModel;
  if (onLot === undefined && featuredImpliesOnLot && listing.featured) onLot = true;
  if (onLot === undefined) {
    onLot = sourceStatus === "pending" ||
      (availableImpliesOnLot && sourceStatus === "available");
  }

  if (sourceStatus === "sold") return { onLot: false, status: "sold" };
  if (sourceStatus === "pending") return { onLot: true, status: "pending" };
  if (sourceStatus === "coming-soon") return { onLot: false, status: "coming-soon" };
  if (onLot) return { onLot: true, status: "available" };
  return { onLot: false, status: "to-order" };
}

export async function GET() {
  const apiListings = (listings as SourceListing[]).map((listing) => {
    const availability = availabilityOf(listing);
    const photoPath = photoFor(`${listing.slug}/${listing.scenes?.[0]?.kind ?? "exterior"}`);
    const description = plainText(
      listing.tagline ?? listing.story?.join(" ") ?? `${listing.name} home`,
    );

    return {
      slug: listing.slug,
      url: absolute(`/listings/${listing.slug}`),
      name: listing.name,
      status: availability.status,
      statusLabel: statusLabels[availability.status],
      onLot: availability.onLot,
      price: listing.price ?? null,
      beds: listing.beds,
      baths: listing.baths,
      sqft: listing.sqft ?? 0,
      sections: sectionsOf(listing),
      builder: listing.builder ?? null,
      model: listing.model ?? null,
      series: listing.series ?? null,
      construction: listing.construction ?? null,
      description,
      photo: photoPath ? absolute(photoPath) : null,
      tourUrl: listing.tourUrl ? absolute(listing.tourUrl) : null,
    };
  });

  return Response.json({ version: 1, listings: apiListings });
}
