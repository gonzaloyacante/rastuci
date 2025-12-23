import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const product = await prisma.products.findFirst({
    where: {
      colorImages: { not: Prisma.JsonNull },
    },
  });
  console.log(JSON.stringify(product, null, 2));
}
main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
