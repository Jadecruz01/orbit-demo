// ORBIT client demos: one entry per client.
// A client's link is  https://jadecruz01.github.io/orbit-demo/?c=<slug>   (e.g. ?c=fallpro)
// Easiest way to add or change one: open setup.html, fill in the form, then upload the clients.js it gives you to js/.
// Fields: company, website, logo (image URL, optional), tagline, location, contact, title, email,
//         color (brand accent), currentSystem (what they use today), data ('fallpro' or 'machine'),
//         headline, note (personal message on the welcome screen), demoDate, active (false hides the link),
//         host (optional: a web address that opens straight to this client, e.g. demo.starsonn.com).

window.ORBIT_STARSONN = { name: 'Jade Cruz', role: 'Your Starsonn point of contact', email: 'jadecruz@starsonn.com', phone: '' };

// ---- clients start ----
window.ORBIT_CLIENTS = {
  'fallpro': {
    company: 'Fall Protection Demo',
    website: '',
    host: 'orbitdemo.starsonn.com',
    logo: '',
    logoDark: '',
    tagline: 'Personal fall protection',
    location: 'Cullman, Alabama',
    contact: 'Chase Clemmons',
    title: 'Representative',
    email: '',
    color: '#2F7CC4',
    currentSystem: 'Q-inmass',
    data: 'fallpro',
    headline: 'Inventory control built around how your shop works.',
    note: 'Chase, thanks for making time this week. This is a first look at ORBIT, set up for a fall-protection shop: webbing, forged hardware, sewn sub-assemblies, harnesses, lanyards and the distributors who sell them. Everything here is sample data, so click anything. When something is missing or Q-inmass does it better, hit the yellow Suggest button and it comes straight to me.',
    demoDate: 'Week of September 21, 2026',
    active: true
  }
};
// ---- clients end ----

// Work out which client (if any) this visit is for: ?c=slug, or ?w=<encoded entry> made by setup.html.
(function () {
  var p = new URLSearchParams(location.search), slug = (p.get('c') || p.get('client') || '').toLowerCase(), c = null;
  if (p.get('w')) {
    try { c = JSON.parse(decodeURIComponent(escape(atob(p.get('w').replace(/-/g, '+').replace(/_/g, '/'))))); slug = c.slug || 'preview'; } catch (e) { c = null; }
  }
  if (!c && !slug) { for (var k in window.ORBIT_CLIENTS) { if (window.ORBIT_CLIENTS[k].host && window.ORBIT_CLIENTS[k].host === location.hostname) { slug = k; break; } } }
  if (!c && slug && window.ORBIT_CLIENTS[slug]) c = window.ORBIT_CLIENTS[slug];
  if (c && c.active !== false) { c.slug = slug; window.ORBIT_CLIENT = c; }
})();
