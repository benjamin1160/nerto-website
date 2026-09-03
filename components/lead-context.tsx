"use client";

import { useSyncExternalStore } from "react";
import { attributionField } from "@/lib/attribution";
import { useSavedHomes } from "./saved-homes";

/**
 * Two hidden inputs that every lead form on the site carries: where the
 * visitor came from, and which homes they have hearted.
 *
 * Both are things the site already knows and the CRM otherwise never learns.
 * The shortlist in particular is worth more than most of the form above it —
 * a visitor who filled in one enquiry having saved four double-sections has
 * told you what to talk about.
 *
 * Neither value exists on the server, so both are read the way
 * `components/saved-homes.tsx` reads localStorage: an external store with an
 * empty server snapshot, which hydrates cleanly and needs no effect to swap
 * itself in. A form submitted in the same tick as it appeared simply carries
 * neither, which is the right failure — the lead still lands.
 */

/* The attribution is fixed for the session, so there is nothing to subscribe
   to; the snapshot changes only when the component itself re-renders on a new
   page, which is exactly when the conversion page has changed. */
const subscribeNever = () => () => {};
const serverSnapshot = () => "";

export function LeadContext() {
  const attribution = useSyncExternalStore(
    subscribeNever,
    attributionField,
    serverSnapshot,
  );
  const { saved, ready } = useSavedHomes();

  return (
    <>
      <input type="hidden" name="attribution" value={attribution} readOnly />
      <input
        type="hidden"
        name="savedHomes"
        value={ready ? saved.slice(0, 30).join(",") : ""}
        readOnly
      />
    </>
  );
}
