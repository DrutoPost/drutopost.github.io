export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function parseRSSTitles(xmlString: string): string[] {
  const titles: string[] = [];

  if (typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const itemTitles = xmlDoc.querySelectorAll("item > title, entry > title");
      itemTitles.forEach((node) => {
        const txt = node.textContent?.trim();
        if (txt) titles.push(txt);
      });
    } catch (e) {}
  }

  if (titles.length === 0) {
    const matches = xmlString.match(/<title>(.*?)<\/title>/gi);
    if (matches) {
      matches.forEach((m) => {
        let clean = m.replace(/<\/?title>/gi, "").trim();
        clean = clean
          .replace(/<!\[CDATA\[/gi, "")
          .replace(/\]\]>/gi, "")
          .trim();
        if (clean) titles.push(clean);
      });
    }
  }

  return [...new Set(titles)];
}

export function parseRobotsUrls(robotsText: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const lines = robotsText.split(/\r?\n/);

  for (let line of lines) {
    const hashIdx = line.indexOf("#");
    if (hashIdx !== -1) {
      line = line.substring(0, hashIdx);
    }
    line = line.trim();
    if (!line) continue;

    let val = line;
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      val = line.substring(colonIdx + 1).trim();
    }

    if (!val || val === "*" || val === "$") continue;

    try {
      let fullUrl = "";
      if (val.startsWith("http://") || val.startsWith("https://")) {
        fullUrl = new URL(val).href;
      } else if (val.startsWith("/")) {
        const cleanPath = val.replace(/[\*\$].*$/, "");
        if (cleanPath) {
          fullUrl = new URL(cleanPath, baseUrl).href;
        }
      }

      if (fullUrl) {
        const parsed = new URL(fullUrl);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          urls.push(parsed.href);
        }
      }
    } catch (e) {}
  }

  return [...new Set(urls)];
}

export function parseXMLSitemapUrls(xmlString: string, baseUrl: string): string[] {
  const urls: string[] = [];

  if (typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const locNodes = xmlDoc.querySelectorAll("loc");
      locNodes.forEach((node) => {
        const val = node.textContent?.trim();
        if (val) {
          try {
            const parsed = new URL(
              val.startsWith("http") ? val : new URL(val, baseUrl).href
            );
            if (parsed.protocol === "http:" || parsed.protocol === "https:") {
              urls.push(parsed.href);
            }
          } catch (e) {}
        }
      });
    } catch (e) {}
  }

  if (urls.length === 0) {
    const matches = xmlString.match(/<loc>(.*?)<\/loc>/gi);
    if (matches) {
      matches.forEach((m) => {
        const val = m.replace(/<\/?loc>/gi, "").trim();
        if (val) {
          try {
            const parsed = new URL(
              val.startsWith("http") ? val : new URL(val, baseUrl).href
            );
            if (parsed.protocol === "http:" || parsed.protocol === "https:") {
              urls.push(parsed.href);
            }
          } catch (e) {}
        }
      });
    }
  }

  return [...new Set(urls)];
}
