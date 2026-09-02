/**
 * Bundle the built site into one self-contained HTML file.
 *
 *   npm run build && npm run preview     # → preview/index.html
 *
 * The result is the whole site — every route, the stylesheet, the fonts and
 * any photographs — in a single file that opens from disk, in a chat window,
 * or anywhere else that will render HTML but cannot run a server. Internal
 * links work: a small router swaps the prerendered pages in place.
 *
 * What survives: layout, type, colour, the generated artwork, both themes,
 * the accordions, and every link between pages.
 *
 * What does not: anything that needed React. The catalogue filters and sort,
 * the payment calculator, the enquiry form, the saved-homes shortlist and the
 * gallery lightbox all render but sit inert, and the page says so.
 *
 * Three details in Next's output have to be undone or the bundle looks wrong
 * rather than merely static:
 *
 *   - `next/font` declares its CSS variables on <html> and <body>. Only the
 *     body's children come across, so both class lists are re-applied to the
 *     wrapper or every face silently falls back to a system stack.
 *   - React serialises the attribute as `srcSet`, and a case-sensitive strip
 *     leaves it behind pointing at an image optimiser that is not here.
 *   - A blurred placeholder sits over each photograph until the client clears
 *     it on load. Nothing clears it here, so it is removed at build time.
 */
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const APP = ".next/server/app";
const STATIC = ".next/static";
const OUT = "preview/index.html";

/** Routes lead in nav order; everything else follows, sorted. */
const LEAD = [
  "/",
  "/listings",
  "/new-home",
  "/communities",
  "/land-deals",
  "/start-here",
  "/financing",
  "/prequalify",
  "/why-manufactured",
  "/faq",
  "/promotions",
  "/blog",
  "/address",
  "/about",
  "/contact",
  "/saved",
  "/privacy-policy",
  "/terms",
];

const MIME = {
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

if (!existsSync(APP)) {
  console.error(`No build found at ${APP}. Run \`npm run build\` first.`);
  process.exit(1);
}

/* ---------------------------------------------------------------- *
 * Assets
 * ---------------------------------------------------------------- */

const inlined = new Map();

/** A file as a data URI, read once however many times it is referenced. */
async function dataUri(file) {
  if (inlined.has(file)) return inlined.get(file);
  const mime = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  const uri = `data:${mime};base64,${(await readFile(file)).toString("base64")}`;
  inlined.set(file, uri);
  return uri;
}

/** Resolve a URL the built HTML points at back to a file on disk. */
function fileFor(url) {
  const clean = decodeURIComponent(url.replace(/&amp;/g, "&").split("?")[0]);
  if (clean.startsWith("/_next/static/")) return path.join(STATIC, clean.slice("/_next/static/".length));
  if (clean.startsWith("/")) return path.join("public", clean.slice(1));
  return null;
}

/* ---------------------------------------------------------------- *
 * Pages
 * ---------------------------------------------------------------- */

/** Every prerendered route, as [route, file]. Internals (_not-found and
 *  friends) are skipped: they are reachable only through a server. */
async function routes(dir = APP, prefix = "") {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith("_") || entry.name.startsWith("[")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await routes(full, `${prefix}/${entry.name}`)));
    } else if (entry.name.endsWith(".html")) {
      const base = entry.name.replace(/\.html$/, "");
      found.push([base === "index" ? prefix || "/" : `${prefix}/${base}`, full]);
    }
  }
  return found;
}

const all = await routes();
const order = (r) => (LEAD.indexOf(r) === -1 ? LEAD.length : LEAD.indexOf(r));
all.sort((a, b) => order(a[0]) - order(b[0]) || a[0].localeCompare(b[0]));

/* ---------------------------------------------------------------- *
 * Stylesheet
 * ---------------------------------------------------------------- */

const firstPage = await readFile(all[0][1], "utf8");
const sheets = [
  ...new Set(
    [...firstPage.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]),
  ),
];

let css = "";
for (const href of sheets) {
  const file = fileFor(href);
  let sheet = await readFile(file, "utf8");
  for (const m of [...sheet.matchAll(/url\((\.\.\/[^)"']+)\)/g)]) {
    const asset = path.join(path.dirname(file), m[1]);
    sheet = sheet.replaceAll(m[0], `url(${await dataUri(asset)})`);
  }
  css += sheet;
}

/* ---------------------------------------------------------------- *
 * Bundle
 * ---------------------------------------------------------------- */

const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

let rootClasses = "";
let siteName = "Site";
const sections = [];

for (const [route, file] of all) {
  const html = await readFile(file, "utf8");

  if (!rootClasses) {
    const htmlCls = (html.match(/<html[^>]*class="([^"]*)"/) || [, ""])[1];
    const bodyCls = (html.match(/<body[^>]*class="([^"]*)"/) || [, ""])[1];
    rootClasses = `${htmlCls} ${bodyCls}`.trim();
    siteName = (html.match(/<title>([^<]*)<\/title>/) || [, siteName])[1].split("—")[0].trim();
  }

  let body = html
    .match(/<body[^>]*>([\s\S]*)<\/body>/)[1]
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<template[\s\S]*?<\/template>/g, "")
    .replace(/\s(?:src|imagesrc)set="[^"]*"/gi, "")
    .replace(/background-image:url\(&quot;[\s\S]*?&quot;\)/g, "background-image:none");

  for (const m of [...body.matchAll(/src="([^"]*\/_next\/[^"]+)"/g)]) {
    const url = m[1].startsWith("/_next/image")
      ? new URLSearchParams(m[1].split("?")[1].replace(/&amp;/g, "&")).get("url")
      : m[1];
    const asset = fileFor(url);
    if (asset && existsSync(asset)) body = body.replaceAll(m[0], `src="${await dataUri(asset)}"`);
  }

  sections.push(`<div class="pv-page" data-route="${esc(route)}" hidden>${body}</div>`);
}

const page = `<meta charset="utf-8">
<title>${esc(siteName)} Site Preview</title>
<style>
${css}
</style>
<style>
  /* Everything above is the site's own stylesheet. This block only makes a
     multi-page site behave inside a single document. */
  body { margin: 0; background: var(--paper); color: var(--ink); }
  .pv-page[hidden] { display: none; }
  /* Scroll reveals wait on an observer that cannot run here. */
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  .pv-note {
    position: fixed; inset-inline: 0; bottom: 0; z-index: 60;
    display: flex; justify-content: center; padding: 0 1rem 1rem;
    pointer-events: none;
  }
  .pv-note > div {
    pointer-events: auto;
    display: flex; align-items: center; gap: 0.75rem;
    border-radius: 999px; border: 1px solid var(--line);
    background: var(--paper); color: var(--muted);
    padding: 0.55rem 0.65rem 0.55rem 1.1rem;
    font: 500 0.78rem/1.3 var(--font-geist-sans, system-ui, sans-serif);
    box-shadow: 0 12px 30px -18px rgb(0 0 0 / 0.55);
  }
  .pv-note b { color: var(--ink); font-weight: 600; }
  .pv-note button {
    border: 0; border-radius: 999px; cursor: pointer;
    background: var(--surface-2, var(--surface)); color: var(--ink-soft, var(--ink));
    padding: 0.3rem 0.7rem; font: inherit;
  }
  .pv-note button:hover { background: var(--ember); color: var(--on-ember); }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
</style>

<div id="pv-pages" class="${rootClasses}">
${sections.join("\n")}
</div>

<div class="pv-note" id="pv-note">
  <div>
    <span><b>Static preview.</b> Links work; filters, forms and anything that needed a server do not.</span>
    <button type="button" id="pv-note-x">Got it</button>
  </div>
</div>

<script>
(function () {
  var pages = {};
  document.querySelectorAll('.pv-page').forEach(function (el) { pages[el.dataset.route] = el; });

  function show(route, hash) {
    var el = pages[route] || pages['/'];
    Object.keys(pages).forEach(function (r) { pages[r].hidden = pages[r] !== el; });
    if (hash) {
      var target = el.querySelector('#' + CSS.escape(hash));
      if (target) { target.scrollIntoView({ behavior: 'smooth' }); return; }
    }
    window.scrollTo(0, 0);
  }

  function routeFromHash() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (h.charAt(0) !== '/') return ['/', ''];
    var i = h.indexOf('#');
    return i === -1 ? [h, ''] : [h.slice(0, i), h.slice(i + 1)];
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (a) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '/') {
        e.preventDefault();
        var parts = href.split('#');
        location.hash = '#' + (parts[0].split('?')[0] || '/') + (parts[1] ? '#' + parts[1] : '');
      } else if (href && href.charAt(0) === '#') {
        e.preventDefault();
        var t = document.querySelector('.pv-page:not([hidden]) ' + href);
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    /* The site's own theme toggle, re-wired without its React handler. */
    var themeBtn = e.target.closest('button[aria-label="Toggle colour theme"]');
    if (themeBtn) {
      var dark = !document.documentElement.classList.contains('dark');
      document.documentElement.classList.toggle('dark', dark);
      try { localStorage.setItem('hearthline:theme', dark ? 'dark' : 'light'); } catch (err) {}
      return;
    }

    /* Accordions already carry their wiring in the markup; only state is missing. */
    var acc = e.target.closest('button[aria-controls]');
    if (acc) {
      var panel = document.getElementById(acc.getAttribute('aria-controls'));
      if (!panel) return;
      var open = acc.getAttribute('aria-expanded') === 'true';
      acc.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    }
  });

  window.addEventListener('hashchange', function () {
    var r = routeFromHash();
    show(r[0], r[1]);
  });

  try {
    /* Three ways to a theme: an explicit stamp from the host, this page's own
       last toggle, or the operating system. */
    var stamp = document.documentElement.getAttribute('data-theme');
    var stored = localStorage.getItem('hearthline:theme');
    var dark = stored ? stored === 'dark'
      : stamp ? stamp === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (err) {}

  var start = routeFromHash();
  show(start[0], start[1]);

  var note = document.getElementById('pv-note');
  document.getElementById('pv-note-x').addEventListener('click', function () { note.remove(); });
  setTimeout(function () { if (note.isConnected) note.remove(); }, 12000);
})();
</script>
`;

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, page);

const mb = page.length / 1e6;
console.log(`${OUT} — ${all.length} routes, ${mb.toFixed(1)} MB`);
if (mb > 15) console.warn("Over 15 MB. Trim LEAD, or register fewer photographs.");
