import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  home?: HomeSettings;
}

export default function Footer({ home }: FooterProps) {
  const footer = home?.footer || defaultHomeSettings.footer!;
  const logoUrl = footer.logoUrl;

  return (
    <footer className="surface pt-10 pb-6 px-4 border-t border-muted overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Marca */}
        <div className="col-span-2 md:col-span-1">
          {logoUrl ? (
            <Link href="/" className="block mb-3">
              <Image
                src={logoUrl}
                alt={footer.brand}
                width={120}
                height={32}
                className="h-8 w-auto dark:invert"
              />
            </Link>
          ) : (
            <h3 className="text-xl font-bold text-primary mb-3 font-heading">
              {footer.brand}
            </h3>
          )}
          <p className="text-sm muted leading-relaxed">{footer.tagline}</p>
        </div>

        {/* Navegación */}
        <div>
          <h4 className="font-semibold text-sm mb-3 font-heading">
            Navegación
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/"
                className="muted hover:text-primary transition-colors"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/productos"
                className="muted hover:text-primary transition-colors"
              >
                Productos
              </Link>
            </li>
            <li>
              <Link
                href="/contacto"
                className="muted hover:text-primary transition-colors"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacto + Redes */}
        <div>
          <h4 className="font-semibold text-sm mb-3 font-heading">Contacto</h4>
          <p className="text-sm muted mb-1">{footer.email}</p>
          <p className="text-sm muted mb-4">{footer.phone}</p>
          <div className="flex space-x-3">
            {footer.socialLinks.instagram && (
              <Link
                href={footer.socialLinks.instagram}
                className="muted hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Instagram"
              >
                <Instagram size={18} aria-hidden="true" />
              </Link>
            )}
            {footer.socialLinks.facebook && (
              <Link
                href={footer.socialLinks.facebook}
                className="muted hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Facebook"
              >
                <Facebook size={18} aria-hidden="true" />
              </Link>
            )}
            {footer.socialLinks.twitter && (
              <Link
                href={footer.socialLinks.twitter}
                className="muted hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Twitter"
              >
                <Twitter size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Tema */}
        <div>
          <h4 className="font-semibold text-sm mb-3 font-heading">Tema</h4>
          <ThemeToggle variant="full" />
        </div>
      </div>
      <div className="border-t border-muted mt-6 pt-4 text-center text-xs muted">
        <p>
          &copy; {new Date().getFullYear()} Rastući. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
