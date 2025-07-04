import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#333333] text-white pt-12 pb-8 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3
            className="text-2xl font-bold text-[#FCE4EC] mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Rastući
          </h3>
          <p className="text-sm text-[#BDBDBD]">
            Ropa con amor para los más peques.
          </p>
        </div>
        <div>
          <h4
            className="font-bold text-lg mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Navegación
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-[#BDBDBD] hover:text-white transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/productos"
                className="text-[#BDBDBD] hover:text-white transition-colors">
                Productos
              </Link>
            </li>
            <li>
              <Link
                href="/contacto"
                className="text-[#BDBDBD] hover:text-white transition-colors">
                Contacto
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4
            className="font-bold text-lg mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Contacto
          </h4>
          <p className="text-sm text-[#BDBDBD]">Email: contacto@rastući.com</p>
          <p className="text-sm text-[#BDBDBD]">Tel: +54 9 11 1234-5678</p>
        </div>
        <div>
          <h4
            className="font-bold text-lg mb-4"
            style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Seguinos
          </h4>
          <div className="flex space-x-4">
            <Link
              href="#"
              className="text-[#BDBDBD] hover:text-white transition-colors">
              <Instagram size={20} />
            </Link>
            <Link
              href="#"
              className="text-[#BDBDBD] hover:text-white transition-colors">
              <Facebook size={20} />
            </Link>
            <Link
              href="#"
              className="text-[#BDBDBD] hover:text-white transition-colors">
              <Twitter size={20} />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-[#BDBDBD]">
        <p>
          &copy; {new Date().getFullYear()} Rastući. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
