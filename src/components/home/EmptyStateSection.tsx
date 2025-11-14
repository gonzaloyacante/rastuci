import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface EmptyStateSectionProps {
  showProducts: boolean;
  showCategories: boolean;
}

export function EmptyStateSection({ showProducts, showCategories }: EmptyStateSectionProps) {
  if (showProducts || showCategories) {
    return null;
  }

  return (
    <section className="py-16 px-6 max-w-[1200px] mx-auto">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 surface rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 font-montserrat">
            Próximamente
          </h2>
          <p className="muted text-lg max-w-md mx-auto">
            Estamos preparando nuestra colección de productos. ¡Vuelve
            pronto para descubrir nuestra ropa infantil!
          </p>
        </div>
        <Link href="/contacto">
          <Button variant="hero">Contactanos</Button>
        </Link>
      </div>
    </section>
  );
}