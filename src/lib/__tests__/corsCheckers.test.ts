import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  parseRSSTitles,
  parseRobotsUrls,
  parseXMLSitemapUrls,
} from "../corsCheckers";

describe("CORS Checkers Utilities", () => {
  describe("escapeHtml", () => {
    it("escapes special HTML characters", () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
      );
      expect(escapeHtml("Cats & Dogs 'Quotes'")).toBe(
        "Cats &amp; Dogs &#039;Quotes&#039;"
      );
    });
  });

  describe("parseRSSTitles", () => {
    it("parses titles from RSS xml items", () => {
      const xml = `
        <rss version="2.0">
          <channel>
            <item><title>News Title 1</title></item>
            <item><title>News Title 2</title></item>
          </channel>
        </rss>
      `;
      const titles = parseRSSTitles(xml);
      expect(titles).toEqual(["News Title 1", "News Title 2"]);
    });

    it("parses titles from Atom feed entries", () => {
      const xml = `
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry><title>Atom Article 1</title></entry>
        </feed>
      `;
      const titles = parseRSSTitles(xml);
      expect(titles).toEqual(["Atom Article 1"]);
    });

    it("handles CDATA sections or regex fallback", () => {
      const xml = `<item><title><![CDATA[Headline with CDATA]]></title></item>`;
      const titles = parseRSSTitles(xml);
      expect(titles).toContain("Headline with CDATA");
    });
  });

  describe("parseRobotsUrls", () => {
    it("extracts and sanitizes URLs from robots.txt content", () => {
      const robots = `
        User-agent: *
        Disallow: /admin
        Disallow: /private/ secret
        Allow: /public/
        Sitemap: https://example.com/sitemap.xml
        # A comment line
      `;
      const baseUrl = "https://example.com";
      const urls = parseRobotsUrls(robots, baseUrl);

      expect(urls).toContain("https://example.com/admin");
      expect(urls).toContain("https://example.com/public/");
      expect(urls).toContain("https://example.com/sitemap.xml");
      expect(urls.every((u) => u.startsWith("http"))).toBe(true);
    });
  });

  describe("parseXMLSitemapUrls", () => {
    it("extracts loc URLs from XML sitemaps", () => {
      const xml = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
            <loc>https://example.com/page1</loc>
          </url>
          <url>
            <loc>https://example.com/page2</loc>
          </url>
        </urlset>
      `;
      const baseUrl = "https://example.com";
      const urls = parseXMLSitemapUrls(xml, baseUrl);

      expect(urls).toEqual([
        "https://example.com/page1",
        "https://example.com/page2",
      ]);
    });
  });
});
