export default {
  site: "https://dev.rastuci.com",
  outputPath: "./unlighthouse-report",
  scanner: {
    samples: 1,
    // Rutas extra no incluidas en el sitemap pero que son páginas públicas
    extraRoutes: [
      "/cart",
      "/checkout",
      "/favorites",
      "/tracking",
      "/legal/terms",
      "/legal/privacy",
      "/legal/consumer-defense",
      "/offline",
    ],
    // Solo excluir admin, API y rutas que requieren sesión específica
    exclude: [
      "/admin/*",
      "/api/*",
      "/orders/*",
      "/reviews/rate/*",
      "/wishlist/shared/*",
      "/cdn-cgi/*",
      "/checkout/success",
      "/checkout/failure",
      "/checkout/pending",
    ],
  },
  lighthouseOptions: {
    throttlingMethod: "simulate",
  },
  ci: {
    budget: {
      performance: 55,
      accessibility: 70,
      "best-practices": 70,
      seo: 70,
    },
  },
};
