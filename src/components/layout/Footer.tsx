import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { type HomeSettings, defaultHomeSettings } from "@/lib/validation/home";
import { type ContactSettings } from "@/lib/validation/contact";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  home?: HomeSettings;
  contact?: ContactSettings;
}

export default function Footer({ home, contact }: FooterProps) {
  const footer = home?.footer || defaultHomeSettings.footer!;
  const logoUrl = footer.logoUrl;

  // Prioritize global contact settings if available
  const email = contact?.emails?.[0] || footer.email;
  const phone = contact?.phones?.[0] || footer.phone;

  // Merge social links logic
  const instagram = contact?.social?.instagram?.url || footer.socialLinks?.instagram;
  const facebook = contact?.social?.facebook?.url || footer.socialLinks?.facebook;
  const twitter = footer.socialLinks?.twitter;
  const youtube = contact?.social?.youtube?.url;

  return (
    <footer className="surface pt-10 pb-6 px-4 border-t border-muted overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-12">
        {/* Marca - Takes more space on desktop if needed, otherwise distinct */}
        <div className="lg:w-1/4">
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

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-sm mb-3 font-heading">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/legal/terminos"
                className="muted hover:text-primary transition-colors"
              >
                Términos y Condiciones
              </Link>
            </li>
            <li>
              <Link
                href="/legal/privacidad"
                className="muted hover:text-primary transition-colors"
              >
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/contacto"
                className="muted hover:text-primary transition-colors"
              >
                Defensa del Consumidor
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacto + Redes */}
        <div>
          <h4 className="font-semibold text-sm mb-3 font-heading">Contacto</h4>
          <p className="text-sm muted mb-1">{email}</p>
          <p className="text-sm muted mb-4">{phone}</p>
          <div className="flex space-x-3">
            {instagram && instagram !== "#" && (
              <Link
                href={instagram}
                className="muted hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Instagram"
              >
                <Instagram size={18} aria-hidden="true" />
              </Link>
            )}
            {facebook && facebook !== "#" && (
              <Link
                href={facebook}
                className="muted hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Facebook"
              >
                <Facebook size={18} aria-hidden="true" />
              </Link>
            )}
            {twitter && twitter !== "#" && (
              <Link
                href={twitter}
                className="muted hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Twitter"
              >
                <Twitter size={18} aria-hidden="true" />
              </Link>
            )}
            {youtube && youtube !== "#" && (
              <Link
                href={youtube}
                className="muted hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en Youtube"
              >
                <Youtube size={18} aria-hidden="true" />
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
