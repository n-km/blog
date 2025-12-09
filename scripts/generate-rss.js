 const fs = require('fs');

// Passe den Pfad ggf. an
const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

function escapeXml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dateToRFC822(d) {
  // Versucht verschiedene Formate, sonst jetzt
  if (!d) return new Date().toUTCString();
  // Versucht RFC822, sonst "dd. MMMM yyyy"
  const m = d.match(/(\d{2})\. (\w+) (\d{4})/);
  if (m) {
    const months = {
      "Januar": "01","Februar": "02","März": "03","April": "04","Mai": "05","Juni": "06",
      "Juli": "07","August": "08","September": "09","Oktober": "10","November": "11","Dezember": "12"
    };
    const [_, day, monthName, year] = m;
    const month = months[monthName] || "01";
    return new Date(`${year}-${month}-${day}T08:00:00+02:00`).toUTCString();
  }
  return new Date(d).toUTCString();
}

const items = data.map(post => {
  if (!post.title) return '';
  return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://n-km.github.io/blog/#${encodeURIComponent(post.title.replace(/\s+/g, '-').toLowerCase())}</link>
      <description><![CDATA[${post.text || ""}${post.image ? `<br><img src="${post.image}">` : ""}]]></description>
      <pubDate>${dateToRFC822(post.date)}</pubDate>
      <category>${escapeXml(post.category || "")}</category>
      <author>${escapeXml(post.author || "")}</author>
    </item>
  `.trim();
}).join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Minimal Blog | n-km</title>
    <link>https://n-km.github.io/blog/</link>
    <description>RSS-Feed aus data.json</description>
    <language>de-de</language>
    <generator>generate-rss.js</generator>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

fs.writeFileSync('rss.xml', rss, 'utf-8');
console.log('rss.xml wurde generiert!');
