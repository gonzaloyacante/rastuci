import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  home?: HomeSettings;
}

export default function Footer({ home }: FooterProps) {
  const footer = home?.footer || defaultHomeSettings.footer!;
  return (
    <footer className="surface pt-12 pb-8 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3
            className="text-2xl font-bold text-primary mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {footer.brand}
          </h3>
          <p className="text-sm muted">{footer.tagline}</p>
        </div>
        <div>
          <h4
            className="font-bold text-lg mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
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
        <div>
          <h4
            className="font-bold text-lg mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Contacto
          </h4>
          <p className="text-sm muted">Email: {footer.email}</p>
          <p className="text-sm muted">Tel: {footer.phone}</p>
        </div>
        <div>
          <h4
            className="font-bold text-lg mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Seguinos
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {footer.socialLinks.instagram && (
                <Link
                  href={footer.socialLinks.instagram}
                  className="muted hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} />
                </Link>
              )}
              {footer.socialLinks.facebook && (
                <Link
                  href={footer.socialLinks.facebook}
                  className="muted hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook size={20} />
                </Link>
              )}
              {footer.socialLinks.twitter && (
                <Link
                  href={footer.socialLinks.twitter}
                  className="muted hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter size={20} />
                </Link>
              )}
            </div>
            <ThemeToggle />
          </div>
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
