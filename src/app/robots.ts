import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://rastuci.com").replace(/\/$/, "");
  
  return {
    rules: [
      // General crawlers
      {
        userAgent: "*",
        allow: [
          "/",
          "/productos",
          "/productos/*",
          "/contacto",
          "/sitemap.xml",
          "/_next/static/",
          "/manifest.json",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/",
          "/api/*",
          "/carrito",
          "/checkout",
          "/checkout/*",
          "/favoritos",
          "/offline",
          "/_next/",
          "/uploads/temp/",
          "*.json$",
          "*?*", // Query parameters
        ],
        crawlDelay: 1, // 1 second between requests
      },
      // Google-specific rules
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/productos",
          "/productos/*", 
          "/contacto",
          "/sitemap.xml",
          "/_next/static/",
        ],
        disallow: [
          "/admin",
          "/api/",
          "/carrito",
          "/checkout",
          "/favoritos",
          "/offline",
        ],
      },
      // Bing-specific rules
      {
        userAgent: "Bingbot", 
        allow: [
          "/",
          "/productos",
          "/productos/*",
          "/contacto",
        ],
        disallow: [
          "/admin",
          "/api/",
          "/carrito", 
          "/checkout",
          "/favoritos",
          "/offline",
        ],
        crawlDelay: 2,
      },
      // Social media crawlers
      {
        userAgent: ["facebookexternalhit", "Twitterbot", "LinkedInBot"],
        allow: [
          "/",
          "/productos",
          "/productos/*",
          "/contacto",
        ],
        disallow: [
          "/admin",
          "/api/",
        ],
      },
      // Aggressive crawlers - block them
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot", 
          "MJ12bot",
          "DotBot",
          "BLEXBot",
          "DataForSeoBot",
        ],
        disallow: "/",
      },
      // AI training crawlers - block them
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
          "OpenAI",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
