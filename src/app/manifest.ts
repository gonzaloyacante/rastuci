import { MetadataRoute } from "next";

import { logger } from "@/lib/logger";
import {
  MANIFEST_SCREENSHOTS,
  MANIFEST_SHORTCUTS,
  MANIFEST_STATIC,
} from "@/lib/manifest-constants";
import { prisma } from "@/lib/prisma";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let brandName = "Rastuci";
  let description =
    "Discover premium fashion and lifestyle products at Rastuci. Shop the latest trends with fast shipping and excellent customer service.";

  try {
    const homeSettings = await prisma.home_settings.findUnique({
      where: { id: "default" },
    });

    if (homeSettings) {
      brandName = homeSettings.footerBrand || brandName;
      description = homeSettings.heroSubtitle || description;
    }
  } catch (error) {
    logger.error("Failed to fetch manifest settings", { error: error });
  }

  return {
    ...MANIFEST_STATIC,
    name: `${brandName} - Premium Fashion & Lifestyle`,
    short_name: brandName,
    description,
    shortcuts: MANIFEST_SHORTCUTS,
    screenshots: MANIFEST_SCREENSHOTS,
  };
}
