export type Event = {
  slug: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  address: string;
  image: string;
  summary: string;
  highlights: string[];
  offer?: string;
  externalHref?: string;
};

export const events: Event[] = [
  {
    slug: "trunk-or-treat-2026",
    title: "Trunk or Treat",
    startsAt: "2026-10-17T09:00:00-04:00",
    endsAt: "2026-10-17T17:00:00-04:00",
    location: "NERTO Homes",
    address: "65 River Road, Chelsea, ME 04330",
    image: "/events/trunk-or-treat-2026.jpg",
    summary:
      "Bring the family for Halloween fun, tour our model homes, and meet the NERTO team.",
    highlights: [
      "Trunk or Treat",
      "Haunted model home",
      "Model home tours",
      "Light refreshments",
      "Meet the NERTO team",
    ],
    offer:
      "Place a home deposit during the event and receive a portable generator at closing.",
    externalHref: "https://fb.me/e/525BY52Hj",
  },
];

export const currentEvents = (now = new Date()) =>
  events.filter((event) => new Date(event.endsAt).getTime() >= now.getTime());

