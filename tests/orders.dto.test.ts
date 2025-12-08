/// <reference types="jest" />
import { mapOrderToDTO } from "@/lib/orders";

describe("mapOrderToDTO", () => {
  it("maps prisma order with nested items/product/category to API DTO", () => {
    const prismaOrder = {
      id: "ord_1",
      customerName: "John Doe",
      customerPhone: "123456789",
      customerAddress: null,
      total: 100,
      status: "PENDING",
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-02T00:00:00Z"),
      order_items: [
        {
          id: "item_1",
          quantity: 2,
          price: 25,
          orderId: "ord_1",
          productId: "prod_1",
          products: {
            id: "prod_1",
            name: "Sample Product",
            description: null,
            price: 50,
            stock: 10,
            images: JSON.stringify(["/img1.jpg"]),
            categoryId: "cat_1",
            createdAt: new Date("2024-12-31T00:00:00Z"),
            updatedAt: new Date("2025-01-01T00:00:00Z"),
            categories: {
              id: "cat_1",
              name: "Cat",
              description: null,
              createdAt: new Date("2024-12-01T00:00:00Z"),
              updatedAt: new Date("2024-12-15T00:00:00Z"),
            },
          },
        },
      ],
    } as any;

    const dto = mapOrderToDTO(prismaOrder);

    expect(dto.id).toBe("ord_1");
    expect(dto.customerAddress).toBeUndefined();
    expect(Array.isArray(dto.items)).toBe(true);
    const first = dto.items![0]!;
    expect(first.product?.description).toBeUndefined();
    expect(Array.isArray(first.product?.images)).toBe(true);
    expect((first.product?.images as any[])?.[0]).toBe("/img1.jpg");
  });
});
