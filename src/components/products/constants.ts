export interface ColorOption {
  name: string;
  hex: string;
}

export interface ColorCategory {
  label: string;
  colors: ColorOption[];
}

export const COLOR_CATEGORIES: Record<string, ColorCategory> = {
  basicos: {
    label: "Básicos",
    colors: [
      { name: "Negro", hex: "#000000" },
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Gris Oscuro", hex: "#333333" },
      { name: "Gris", hex: "#808080" },
      { name: "Gris Claro", hex: "#D3D3D3" },
      { name: "Plata", hex: "#C0C0C0" },
    ],
  },
  rojos: {
    label: "Rojos y Rosas",
    colors: [
      { name: "Rojo", hex: "#FF0000" },
      { name: "Rojo Oscuro", hex: "#8B0000" },
      { name: "Carmesí", hex: "#DC143C" },
      { name: "Coral", hex: "#FF7F50" },
      { name: "Salmón", hex: "#FA8072" },
      { name: "Rosa", hex: "#FFC0CB" },
      { name: "Rosa Fuerte", hex: "#FF69B4" },
      { name: "Magenta", hex: "#FF00FF" },
      { name: "Fucsia", hex: "#FF1493" },
      { name: "Borgoña", hex: "#800020" },
    ],
  },
  naranjas: {
    label: "Naranjas y Marrones",
    colors: [
      { name: "Naranja", hex: "#FFA500" },
      { name: "Naranja Oscuro", hex: "#FF8C00" },
      { name: "Durazno", hex: "#FFCBA4" },
      { name: "Terracota", hex: "#E2725B" },
      { name: "Marrón", hex: "#8B4513" },
      { name: "Chocolate", hex: "#D2691E" },
      { name: "Camel", hex: "#C19A6B" },
      { name: "Beige", hex: "#F5F5DC" },
      { name: "Crema", hex: "#FFFDD0" },
      { name: "Canela", hex: "#D2691E" },
    ],
  },
  amarillos: {
    label: "Amarillos y Dorados",
    colors: [
      { name: "Amarillo", hex: "#FFFF00" },
      { name: "Amarillo Claro", hex: "#FFFFE0" },
      { name: "Limón", hex: "#FFF44F" },
      { name: "Dorado", hex: "#FFD700" },
      { name: "Mostaza", hex: "#FFDB58" },
      { name: "Ámbar", hex: "#FFBF00" },
      { name: "Oro Viejo", hex: "#CFB53B" },
    ],
  },
  verdes: {
    label: "Verdes",
    colors: [
      { name: "Verde", hex: "#008000" },
      { name: "Verde Lima", hex: "#32CD32" },
      { name: "Verde Menta", hex: "#98FF98" },
      { name: "Verde Oliva", hex: "#808000" },
      { name: "Verde Militar", hex: "#4B5320" },
      { name: "Verde Esmeralda", hex: "#50C878" },
      { name: "Verde Bosque", hex: "#228B22" },
      { name: "Turquesa", hex: "#40E0D0" },
      { name: "Aqua", hex: "#00FFFF" },
      { name: "Verde Agua", hex: "#7FFFD4" },
    ],
  },
  azules: {
    label: "Azules",
    colors: [
      { name: "Azul", hex: "#0000FF" },
      { name: "Azul Marino", hex: "#000080" },
      { name: "Azul Rey", hex: "#4169E1" },
      { name: "Celeste", hex: "#87CEEB" },
      { name: "Azul Cielo", hex: "#87CEEB" },
      { name: "Azul Bebé", hex: "#89CFF0" },
      { name: "Azul Petróleo", hex: "#006064" },
      { name: "Índigo", hex: "#4B0082" },
      { name: "Cian", hex: "#00FFFF" },
      { name: "Azul Acero", hex: "#4682B4" },
    ],
  },
  violetas: {
    label: "Violetas y Púrpuras",
    colors: [
      { name: "Morado", hex: "#800080" },
      { name: "Púrpura", hex: "#9B30FF" },
      { name: "Violeta", hex: "#EE82EE" },
      { name: "Lavanda", hex: "#E6E6FA" },
      { name: "Lila", hex: "#C8A2C8" },
      { name: "Ciruela", hex: "#8E4585" },
      { name: "Uva", hex: "#6F2DA8" },
      { name: "Malva", hex: "#E0B0FF" },
    ],
  },
  pasteles: {
    label: "🎨 Pasteles",
    colors: [
      { name: "Rosa Pastel", hex: "#FFD1DC" },
      { name: "Melocotón Pastel", hex: "#FFDAB9" },
      { name: "Amarillo Pastel", hex: "#FDFD96" },
      { name: "Verde Pastel", hex: "#77DD77" },
      { name: "Menta Pastel", hex: "#B4F0C2" },
      { name: "Celeste Pastel", hex: "#AEC6CF" },
      { name: "Azul Pastel", hex: "#A2D2FF" },
      { name: "Lavanda Pastel", hex: "#E6E6FA" },
      { name: "Lila Pastel", hex: "#DDA0DD" },
      { name: "Coral Pastel", hex: "#FFB7B2" },
      { name: "Durazno Pastel", hex: "#FFE5B4" },
      { name: "Crema Pastel", hex: "#FFFDD0" },
      { name: "Gris Perla", hex: "#E5E4E2" },
      { name: "Turquesa Pastel", hex: "#AFEEEE" },
      { name: "Salmón Pastel", hex: "#FFA07A" },
    ],
  },
  tierra: {
    label: "Tonos Tierra",
    colors: [
      { name: "Café", hex: "#6F4E37" },
      { name: "Tostado", hex: "#B87333" },
      { name: "Arena", hex: "#C2B280" },
      { name: "Ocre", hex: "#CC7722" },
      { name: "Siena", hex: "#A0522D" },
      { name: "Terracota", hex: "#E2725B" },
      { name: "Arcilla", hex: "#B66A50" },
      { name: "Óxido", hex: "#B7410E" },
    ],
  },
  metalicos: {
    label: "✨ Metálicos",
    colors: [
      { name: "Oro", hex: "#FFD700" },
      { name: "Plata", hex: "#C0C0C0" },
      { name: "Bronce", hex: "#CD7F32" },
      { name: "Cobre", hex: "#B87333" },
      { name: "Platino", hex: "#E5E4E2" },
      { name: "Oro Rosa", hex: "#E0BFB8" },
      { name: "Champagne", hex: "#F7E7CE" },
    ],
  },
};

export const COMMON_COLORS = Object.values(COLOR_CATEGORIES).flatMap(
  (cat) => cat.colors
);

export const COMMON_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
] as const;

export const FEATURE_CATEGORIES = {
  material: {
    label: "Material",
    help: "Composición y tipo de tela del producto",
    items: [
      "100% Algodón",
      "100% Algodón orgánico",
      "Mezcla de algodón",
      "Poliéster",
      "Lana",
      "Seda",
      "Denim",
      "Jersey",
    ],
  },
  cuidado: {
    label: "Cuidado",
    help: "Instrucciones de lavado y mantenimiento",
    items: [
      "Lavable en máquina",
      "Lavar a mano",
      "No usar blanqueador",
      "Secar al aire",
      "Planchar a baja temperatura",
      "Lavar con colores similares",
    ],
  },
  diseño: {
    label: "Diseño",
    help: "Características del diseño y estilo",
    items: [
      "Diseño cómodo y fresco",
      "Diseño moderno",
      "Estampado de calidad",
      "Estampado que no se destiñe",
      "Botones de seguridad",
      "Cierre invisible",
      "Bolsillos funcionales",
    ],
  },
  caracteristicas: {
    label: "Características",
    help: "Propiedades adicionales del producto",
    items: [
      "Transpirable",
      "Resistente al agua",
      "Protección UV",
      "Antibacterial",
      "Hipoalergénico",
      "Elástico",
      "Forrado",
    ],
  },
} as const;
