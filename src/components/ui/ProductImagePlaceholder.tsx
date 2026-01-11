import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import Image from "next/image";

interface ProductImagePlaceholderProps {
  className?: string;
  text?: string;
}

export const ProductImagePlaceholder = ({
  className,
  text = "Sin imagen",
}: ProductImagePlaceholderProps) => (
  <div
    className={`relative overflow-hidden surface-secondary rounded-lg ${className || "w-full h-48"}`}
  >
    <Image
      src={PLACEHOLDER_IMAGE}
      alt={text}
      fill
      className="object-cover opacity-80"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>
);
