const express = require('express');
const RSSParser = require('rss-parser');
const parser = new RSSParser();
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Define your five feed URLs
const feeds = [
  { name: 'Anthropic Status', url: 'https://status.anthropic.com/history.atom' },
  { name: 'OpenAI Blog',    url: 'https://openai.com/blog/rss.xml' },
  { name: 'DeepMind Blog',   url: 'https://deepmind.com/blog/feed/basic' },
  { name: 'Google AI Blog',  url: 'https://blog.google/technology/ai/rss.xml' },
  { name: 'MS Research',     url: 'https://www.microsoft.com/en-us/research/blog/feed/' },
];

// 2. Fetch entries from all feeds
async function fetchAllEntries() {
  const allEntries = [];
  for (const feedInfo of feeds) {
    try {
      const feed = await parser.parseURL(feedInfo.url);
      const latest = feed.items.slice(0, 5).map(item => ({
        source: feedInfo.name,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate || item.isoDate,
      }));
      allEntries.push(...latest);
    } catch (err) {
      console.warn(`Failed to fetch ${feedInfo.name}:`, err.message);
    }
  }
  // Sort by publication date descending
  return allEntries.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

// 3. Render HTML
app.get('/', async (req, res) => {
  const entries = await fetchAllEntries();
  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>AI Blog Feed</title></head>
      <body>
        <h1>AI & LLM Blog Reader</h1>
        <ul>
          ${entries.map(e => `
            <li>
              <strong>[${e.source}]</strong>
              <a href="${e.link}" target="_blank">${e.title}</a>
              <em>(${new Date(e.pubDate).toLocaleString()})</em>
            </li>`).join('')}
        </ul>
      </body>
    </html>`;
  res.send(html);
});

// 4. Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
