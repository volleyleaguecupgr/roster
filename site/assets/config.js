/* Site settings: edit this file only. */
window.SITE = {
  api: "https://national-mc.terzis-spy.workers.dev/",   // the Cloudflare Worker address (step 3 of README)
  title: "National MatchCenter",
  subtitle: "Εθνικές κατηγορίες · Live · Αποτελέσματα · Στατιστικά",
  accent: "#0A5CD6",          // brand colour
  competitions: [],           // extra client-side filter; leave empty (the main filter is in worker.js)
  refreshSeconds: 30,         // live refresh (30 s keeps the free plan's 100,000 requests/day safe)
  strip: true,                // today's scores across the top of every page
};
