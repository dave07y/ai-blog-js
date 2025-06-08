// feed.js  – client-side RSS reader

const FEEDS = [
  { name: "Anthropic Status", url: "https://status.anthropic.com/history.atom" },
  { name: "OpenAI Blog",      url: "https://openai.com/blog/rss.xml" },
  { name: "DeepMind Blog",    url: "https://deepmind.com/blog/feed/basic" },
  { name: "Google AI Blog",   url: "https://blog.google/technology/ai/rss.xml" },
  { name: "MS Research",      url: "https://www.microsoft.com/en-us/research/blog/feed/" },
];

// ⭐ optional: sign up for a (free) rss2json key and put it here:
const RSS2JSON_KEY = "";   // e.g. "abcd1234xzy"
const list = document.getElementById("feed");

(async function loadFeeds () {
  const all = [];
  for (const f of FEEDS) {
    try {
      const url = new URL("https://api.rss2json.com/v1/api.json");
      url.searchParams.set("rss_url", f.url);
      if (RSS2JSON_KEY) url.searchParams.set("api_key", RSS2JSON_KEY);

      const res   = await fetch(url);
      const json  = await res.json();
      const items = (json.items || []).slice(0, 5).map(it => ({
        source: f.name,
        title:  it.title,
        link:   it.link,
        date:   new Date(it.pubDate || it.isoDate || it.created)
      }));
      all.push(...items);
    } catch (err) {
      console.warn(`Feed ${f.name} failed:`, err);
    }
  }

  // newest first
  all.sort((a, b) => b.date - a.date);

  // inject into the page
  list.innerHTML = all.map(
    i => `<li><strong>[${i.source}]</strong> 
            <a href="${i.link}" target="_blank" rel="noopener">
              ${i.title}
            </a> 
            <em>(${i.date.toLocaleString()})</em>
          </li>`
  ).join("");
})();
