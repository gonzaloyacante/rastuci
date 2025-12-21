import type { Meta, StoryObj } from "@storybook/nextjs";
import ReviewSystem from "../../../components/reviews/ReviewSystem";

const meta: Meta<typeof ReviewSystem> = {
  title: "Public/Reviews/ReviewSystem",
  component: ReviewSystem,
  tags: ["autodocs"],
  argTypes: {
    onReviewSubmit: { action: "submitted" },
    onReviewHelpful: { action: "helpful" },
    onReviewReport: { action: "reported" },
  },
};

export default meta;
type Story = StoryObj<typeof ReviewSystem>;

const mockReviews = [
  {
    id: "r1",
    userId: "u1",
    userName: "Sofia Martinez",
    rating: 5,
    title: "Excelente calidad",
    comment:
      "La tela es muy suave y el talle es perfecto. Muy recomendable para bebés.",
    verified: true,
    helpful: 12,
    notHelpful: 0,
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
  },
  {
    id: "r2",
    userId: "u2",
    userName: "Juan Perez",
    rating: 4,
    title: "Buen producto",
    comment:
      "Llegó rápido, pero el color es un poco más oscuro que en la foto.",
    verified: true,
    helpful: 2,
    notHelpful: 1,
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-10"),
  },
  {
    id: "r3",
    userId: "u3",
    userName: "Anonimo",
    rating: 1,
    title: "No me gustó",
    comment: "La calidad no es lo que esperaba por el precio.",
    verified: false,
    helpful: 0,
    notHelpful: 5,
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-03-05"),
  },
];

export const Default: Story = {
  args: {
    productId: "p1",
    reviews: mockReviews,
    averageRating: 3.3,
    totalReviews: 3,
    currentUserId: "u_logged_in",
  },
};

export const Empty: Story = {
  args: {
    productId: "p2",
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    currentUserId: "u_logged_in",
  },
};

export const NotLoggedIn: Story = {
  args: {
    productId: "p1",
    reviews: mockReviews,
    averageRating: 3.3,
    totalReviews: 3,
    currentUserId: undefined,
  },
};
