import { Container, Icon } from "./ui";
import { site } from "@/lib/site";

const mapQuery = encodeURIComponent(
  `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`,
);

/**
 * Where the lot is, when it is open, and the number — three columns across
 * the foot of the landing page, above the legal footer.
 *
 * A dealership site that makes somebody hunt for the opening hours has failed
 * at the one job the visit depends on, so this repeats what `/address` says
 * rather than only linking to it. `site.hoursByDay` renders as a day-by-day
 * table when it is filled in; without it the column falls back to the
 * one-line `site.hours`, which every deployment has.
 */
export function LocationHours() {
  const days = site.hoursByDay;

  const heading = "mb-2 text-sm font-semibold uppercase tracking-wider text-ink";

  return (
    <section id="location" className="border-t border-line bg-paper">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex gap-3">
            <Icon.Pin className="mt-0.5 size-5 shrink-0 text-ember" />
            <div>
              <h2 className={heading}>Our location</h2>
              <address className="space-y-1 text-sm not-italic text-muted">
                <div>{site.address.street}</div>
                <div>
                  {site.address.city}, {site.address.region} {site.address.postalCode}
                </div>
              </address>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-ember hover:underline"
              >
                Get directions →
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <Icon.Clock className="mt-0.5 size-5 shrink-0 text-ember" />
            <div className="min-w-0 flex-1">
              <h2 className={heading}>Hours of operation</h2>
              {days ? (
                <dl className="space-y-1 text-sm">
                  {days.map((day) => (
                    <div key={day.day} className="flex justify-between gap-6">
                      <dt className="text-muted">{day.day.slice(0, 3)}</dt>
                      <dd className="text-ink">{day.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-muted">{site.hours}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Icon.Phone className="mt-0.5 size-5 shrink-0 text-ember" />
            <div>
              <h2 className={heading}>Contact us</h2>
              <a href={site.phoneHref} className="text-sm font-semibold text-ink hover:underline">
                {site.phone}
              </a>
              {site.email && (
                <a
                  href={`mailto:${site.email}`}
                  className="mt-1 block text-sm text-muted hover:underline"
                >
                  {site.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
