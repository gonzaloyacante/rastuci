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
    <footer className="surface pt-12 pb-8 px-6 border-t border-muted">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
        <div>
          {logoUrl ? (
            <Link href="/" className="block mb-4">
              <Image
                src={logoUrl}
                alt={footer.brand}
                width={150}
                height={40}
                className="h-10 w-auto dark:invert"
              />
            </Link>
          ) : (
            <h3 className="text-2xl font-bold text-primary mb-4 font-heading">
              {footer.brand}
            </h3>
          )}
          <p className="text-sm muted">{footer.tagline}</p>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-4 font-heading">Navegación</h4>
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
        <div>
          <h4 className="font-bold text-lg mb-4 font-heading">Contacto</h4>
          <p className="text-sm muted">{footer.email}</p>
          <p className="text-sm muted">{footer.phone}</p>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-4 font-heading">Seguinos</h4>
          <div className="flex space-x-4">
            {footer.socialLinks.instagram && (
              <Link
                href={footer.socialLinks.instagram}
                className="muted hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Instagram"
              >
                <Instagram size={20} aria-hidden="true" />
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
                <Facebook size={20} aria-hidden="true" />
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
                <Twitter size={20} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-4 font-heading">Tema</h4>
          <ThemeToggle variant="full" />
        </div>
      </div>
      <div className="border-t border-muted mt-8 pt-6 text-center text-sm muted">
        <p>
          &copy; {new Date().getFullYear()} Rastući. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
