import { Facebook, Instagram, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import RepentanceButton from "@/components/legal/RepentanceButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { type ContactSettings } from "@/lib/validation/contact";
import { defaultHomeSettings, type HomeSettings } from "@/lib/validation/home";

interface FooterProps {
  home?: HomeSettings;
  contact?: ContactSettings;
}

export default function Footer({ home, contact }: FooterProps) {
  const footer = home?.footer || defaultHomeSettings.footer!;
  const logoUrl = footer.logoUrl;

  // OBLIGATORIO: Solo usar datos de contact settings (configurados por admin)
  // Sin fallbacks hardcodeados - si no hay datos, no se muestran
  const email = contact?.emails?.[0];
  const phone = contact?.phones?.[0];

  // Redes sociales SOLO desde contact settings
  const instagram = contact?.social?.instagram?.url;
  const facebook = contact?.social?.facebook?.url;
  const youtube = contact?.social?.youtube?.url;

  // Datos fiscales (Ley 24.240 - obligatorio para e-commerce en Argentina)
  const businessCuit = contact?.businessCuit;
  const razonSocial = contact?.razonSocial;

  return (
    <footer className="surface pt-10 pb-6 px-4 border-t border-muted overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-12">
        {/* Marca - Takes more space on desktop if needed, otherwise distinct */}
        <div className="lg:w-1/4">
          {(footer.showLogo ?? true) && logoUrl ? (
            <Link href="/" className="block mb-3">
              <Image
                src={logoUrl}
                alt={footer.brand}
                width={120}
                height={32}
                className="h-8 w-auto dark:invert"
              />
            </Link>
          ) : (footer.showBrand ?? true) ? (
            <h3 className="text-xl font-bold text-primary mb-3 font-heading">
              {footer.brand}
            </h3>
          ) : null}
          {(footer.showTagline ?? true) && (
            <p className="text-sm muted leading-relaxed">{footer.tagline}</p>
          )}
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
              <a
                href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
                target="_blank"
                rel="noopener noreferrer"
                className="muted hover:text-primary transition-colors"
              >
                Defensa del Consumidor
              </a>
            </li>
            <li>
              <RepentanceButton />
            </li>
          </ul>
        </div>

        {/* Contacto + Redes */}
        <div>
          <h4 className="font-semibold text-sm mb-3 font-heading">Contacto</h4>
          {email && <p className="text-sm muted mb-1">{email}</p>}
          {phone && <p className="text-sm muted mb-4">{phone}</p>}
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
      <div className="border-t border-muted mt-6 pt-4 text-center text-xs muted space-y-2">
        {/* Datos fiscales obligatorios - Ley 24.240 Argentina */}
        {(razonSocial || businessCuit) && (
          <p className="text-xs muted">
            {razonSocial && <span>{razonSocial}</span>}
            {razonSocial && businessCuit && <span> &mdash; </span>}
            {businessCuit && <span>CUIT: {businessCuit}</span>}
          </p>
        )}
        <p>
          &copy; {new Date().getFullYear()} Rastući. Todos los derechos
          reservados.
        </p>
        {/* Logo obligatorio Defensa del Consumidor - Resolución Secretaría de Comercio */}
        <div className="flex justify-center mt-2">
          <a
            href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs muted hover:text-primary transition-colors border border-muted rounded px-3 py-1.5"
          >
            <span className="text-base" aria-hidden="true">
              🛡️
            </span>
            <span>
              Defensa del Consumidor &mdash; Si no quedás satisfecho podés
              ingresar tu queja <span className="underline">aquí</span>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
