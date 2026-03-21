// Internationalization utilities and configuration
import { logger } from "@/lib/logger";

export interface Translation {
  [key: string]: string | Translation;
}

export interface Locale {
  code: string;
  name: string;
  flag: string;
  rtl?: boolean;
}

export const SUPPORTED_LOCALES: Locale[] = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
];

export const DEFAULT_LOCALE = "es";

// Translation keys and default Spanish translations
export const TRANSLATIONS: Record<string, Translation> = {
  es: {
    common: {
      loading: "Cargando...",
      error: "Error",
      success: "Éxito",
      cancel: "Cancelar",
      confirm: "Confirmar",
      save: "Guardar",
      edit: "Editar",
      delete: "Eliminar",
      search: "Buscar",
      filter: "Filtrar",
      sort: "Ordenar",
      clear: "Limpiar",
      apply: "Aplicar",
      close: "Cerrar",
      next: "Siguiente",
      previous: "Anterior",
      home: "Inicio",
      about: "Acerca de",
      contact: "Contacto",
      privacy: "Privacidad",
      terms: "Términos",
      help: "Ayuda",
    },
    navigation: {
      products: "Productos",
      categories: "Categorías",
      cart: "Carrito",
      wishlist: "Favoritos",
      account: "Cuenta",
      orders: "Pedidos",
      admin: "Administración",
      logout: "Cerrar Sesión",
      login: "Iniciar Sesión",
      register: "Registrarse",
    },
    products: {
      title: "Productos",
      addToCart: "Añadir al Carrito",
      addToWishlist: "Añadir a Favoritos",
      removeFromWishlist: "Quitar de Favoritos",
      compare: "Comparar",
      quickView: "Vista Rápida",
      outOfStock: "Agotado",
      inStock: "En Stock",
      onSale: "En Oferta",
      price: "Precio",
      originalPrice: "Precio Original",
      discount: "Descuento",
      size: "Talla",
      color: "Color",
      quantity: "Cantidad",
      description: "Descripción",
      specifications: "Especificaciones",
      reviews: "Reseñas",
      rating: "Valoración",
      brand: "Marca",
      category: "Categoría",
      sku: "SKU",
      availability: "Disponibilidad",
    },
    cart: {
      title: "Carrito de Compras",
      empty: "Tu carrito está vacío",
      subtotal: "Subtotal",
      shipping: "Envío",
      tax: "Impuestos",
      total: "Total",
      checkout: "Finalizar Compra",
      continueShopping: "Continuar Comprando",
      removeItem: "Eliminar Producto",
      updateQuantity: "Actualizar Cantidad",
      itemAdded: "Producto añadido al carrito",
      itemRemoved: "Producto eliminado del carrito",
      itemUpdated: "Carrito actualizado",
    },
    checkout: {
      title: "Finalizar Compra",
      shippingAddress: "Dirección de Envío",
      billingAddress: "Dirección de Facturación",
      paymentMethod: "Método de Pago",
      orderSummary: "Resumen del Pedido",
      placeOrder: "Realizar Pedido",
      processing: "Procesando...",
      success: "Pedido realizado con éxito",
      error: "Error al procesar el pedido",
      cardNumber: "Número de Tarjeta",
      expiryDate: "Fecha de Vencimiento",
      cvv: "CVV",
      cardholderName: "Nombre del Titular",
      sameAsBilling: "Igual que la dirección de facturación",
    },
    orders: {
      title: "Mis Pedidos",
      orderNumber: "Número de Pedido",
      orderDate: "Fecha del Pedido",
      status: "Estado",
      total: "Total",
      viewDetails: "Ver Detalles",
      trackOrder: "Seguir Pedido",
      reorder: "Volver a Pedir",
      cancelOrder: "Cancelar Pedido",
      returnOrder: "Devolver Pedido",
      pending: "Pendiente",
      confirmed: "Confirmado",
      processing: "Procesando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
      returned: "Devuelto",
    },
    account: {
      title: "Mi Cuenta",
      profile: "Perfil",
      addresses: "Direcciones",
      paymentMethods: "Métodos de Pago",
      preferences: "Preferencias",
      security: "Seguridad",
      notifications: "Notificaciones",
      firstName: "Nombre",
      lastName: "Apellidos",
      email: "Correo Electrónico",
      phone: "Teléfono",
      dateOfBirth: "Fecha de Nacimiento",
      gender: "Género",
      language: "Idioma",
      currency: "Moneda",
      timezone: "Zona Horaria",
      newsletter: "Boletín de Noticias",
      promotions: "Promociones",
      orderUpdates: "Actualizaciones de Pedidos",
    },
    admin: {
      dashboard: "Panel de Control",
      products: "Productos",
      categories: "Categorías",
      orders: "Pedidos",
      customers: "Clientes",
      inventory: "Inventario",
      analytics: "Analíticas",
      settings: "Configuración",
      reports: "Informes",
      users: "Usuarios",
      roles: "Roles",
      permissions: "Permisos",
      addProduct: "Añadir Producto",
      editProduct: "Editar Producto",
      deleteProduct: "Eliminar Producto",
      productName: "Nombre del Producto",
      productDescription: "Descripción del Producto",
      productPrice: "Precio del Producto",
      productStock: "Stock del Producto",
      productCategory: "Categoría del Producto",
      productImages: "Imágenes del Producto",
      productStatus: "Estado del Producto",
      active: "Activo",
      inactive: "Inactivo",
      draft: "Borrador",
      published: "Publicado",
    },
    reviews: {
      title: "Reseñas",
      writeReview: "Escribir Reseña",
      rating: "Calificación",
      reviewTitle: "Título de la Reseña",
      reviewComment: "Comentario",
      submitReview: "Enviar Reseña",
      helpful: "Útil",
      notHelpful: "No Útil",
      report: "Reportar",
      verified: "Compra Verificada",
      anonymous: "Anónimo",
      sortBy: "Ordenar por",
      newest: "Más Recientes",
      oldest: "Más Antiguos",
      highestRated: "Mejor Valorados",
      lowestRated: "Peor Valorados",
      mostHelpful: "Más Útiles",
    },
    search: {
      placeholder: "Buscar productos...",
      results: "Resultados de búsqueda",
      noResults: "No se encontraron resultados",
      suggestions: "Sugerencias",
      popular: "Búsquedas Populares",
      recent: "Búsquedas Recientes",
      filters: "Filtros",
      priceRange: "Rango de Precio",
      brand: "Marca",
      category: "Categoría",
      rating: "Valoración",
      availability: "Disponibilidad",
      sortBy: "Ordenar por",
      relevance: "Relevancia",
      priceAsc: "Precio: Menor a Mayor",
      priceDesc: "Precio: Mayor a Menor",
      newest: "Más Recientes",
      popularity: "Popularidad",
      bestRated: "Mejor Valorados",
    },
    errors: {
      general: "Ha ocurrido un error inesperado",
      network: "Error de conexión",
      notFound: "Página no encontrada",
      unauthorized: "No autorizado",
      forbidden: "Acceso denegado",
      validation: "Error de validación",
      required: "Este campo es obligatorio",
      email: "Introduce un email válido",
      password: "La contraseña debe tener al menos 8 caracteres",
      passwordMatch: "Las contraseñas no coinciden",
      phone: "Introduce un número de teléfono válido",
      minLength: "Debe tener al menos {min} caracteres",
      maxLength: "No puede tener más de {max} caracteres",
      min: "El valor mínimo es {min}",
      max: "El valor máximo es {max}",
    },
    messages: {
      welcome: "Bienvenido a Rastuci",
      loginSuccess: "Sesión iniciada correctamente",
      logoutSuccess: "Sesión cerrada correctamente",
      registerSuccess: "Registro completado correctamente",
      profileUpdated: "Perfil actualizado correctamente",
      passwordChanged: "Contraseña cambiada correctamente",
      emailSent: "Email enviado correctamente",
      orderPlaced: "Pedido realizado correctamente",
      orderCancelled: "Pedido cancelado correctamente",
      itemAddedToCart: "Producto añadido al carrito",
      itemRemovedFromCart: "Producto eliminado del carrito",
      itemAddedToWishlist: "Producto añadido a favoritos",
      itemRemovedFromWishlist: "Producto eliminado de favoritos",
      reviewSubmitted: "Reseña enviada correctamente",
      subscribed: "Suscrito al boletín de noticias",
      unsubscribed: "Desuscrito del boletín de noticias",
    },
  },
  en: {
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
      cancel: "Cancel",
      confirm: "Confirm",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      clear: "Clear",
      apply: "Apply",
      close: "Close",
      next: "Next",
      previous: "Previous",
      home: "Home",
      about: "About",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      help: "Help",
    },
    navigation: {
      products: "Products",
      categories: "Categories",
      cart: "Cart",
      wishlist: "Wishlist",
      account: "Account",
      orders: "Orders",
      admin: "Admin",
      logout: "Logout",
      login: "Login",
      register: "Register",
    },
    products: {
      title: "Products",
      addToCart: "Add to Cart",
      addToWishlist: "Add to Wishlist",
      removeFromWishlist: "Remove from Wishlist",
      compare: "Compare",
      quickView: "Quick View",
      outOfStock: "Out of Stock",
      inStock: "In Stock",
      onSale: "On Sale",
      price: "Price",
      originalPrice: "Original Price",
      discount: "Discount",
      size: "Size",
      color: "Color",
      quantity: "Quantity",
      description: "Description",
      specifications: "Specifications",
      reviews: "Reviews",
      rating: "Rating",
      brand: "Brand",
      category: "Category",
      sku: "SKU",
      availability: "Availability",
    },
    // ... more English translations
  },
  // ... other languages would be added here
};

class I18nManager {
  private currentLocale: string = DEFAULT_LOCALE;
  private translations: Record<string, Translation> = TRANSLATIONS;
  private fallbackLocale: string = DEFAULT_LOCALE;

  constructor() {
    this.loadLocaleFromStorage();
  }

  private loadLocaleFromStorage(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("locale");
      if (stored && this.isValidLocale(stored)) {
        this.currentLocale = stored;
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split("-")[0];
        if (this.isValidLocale(browserLang)) {
          this.currentLocale = browserLang;
        }
      }
    }
  }

  private isValidLocale(locale: string): boolean {
    return SUPPORTED_LOCALES.some((l) => l.code === locale);
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }

  setLocale(locale: string): void {
    if (!this.isValidLocale(locale)) {
      logger.warn(`Locale ${locale} is not supported`);
      return;
    }

    this.currentLocale = locale;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("locale", locale);
      } catch {
        /* noop — QuotaExceededError */
      }
      document.documentElement.lang = locale;

      // Update RTL direction if needed
      const localeConfig = SUPPORTED_LOCALES.find((l) => l.code === locale);
      if (localeConfig?.rtl) {
        document.documentElement.dir = "rtl";
      } else {
        document.documentElement.dir = "ltr";
      }
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split(".");
    let value: unknown = this.translations[this.currentLocale];

    // Navigate through the nested object
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to default locale
        value = this.translations[this.fallbackLocale];
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = (value as Record<string, unknown>)[fallbackKey];
          } else {
            // Return the key if translation not found
            return key;
          }
        }
        break;
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  }

  // Pluralization helper
  plural(
    key: string,
    count: number,
    params?: Record<string, string | number>
  ): string {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    return this.t(pluralKey, { count, ...params });
  }

  // Format number according to locale
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(number);
  }

  // Format currency according to locale
  formatCurrency(amount: number, currency = "EUR"): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: "currency",
      currency,
    }).format(amount);
  }

  // Format date according to locale
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
  }

  // Format relative time
  formatRelativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLocale, {
      numeric: "auto",
    });
    const diff = date.getTime() - Date.now();
    const diffInDays = Math.round(diff / (1000 * 60 * 60 * 24));

    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.round(diff / (1000 * 60 * 60));
      if (Math.abs(diffInHours) < 1) {
        const diffInMinutes = Math.round(diff / (1000 * 60));
        return rtf.format(diffInMinutes, "minute");
      }
      return rtf.format(diffInHours, "hour");
    }

    if (Math.abs(diffInDays) < 7) {
      return rtf.format(diffInDays, "day");
    }

    if (Math.abs(diffInDays) < 30) {
      const diffInWeeks = Math.round(diffInDays / 7);
      return rtf.format(diffInWeeks, "week");
    }

    const diffInMonths = Math.round(diffInDays / 30);
    return rtf.format(diffInMonths, "month");
  }

  // Get available locales
  getAvailableLocales(): Locale[] {
    return SUPPORTED_LOCALES;
  }

  // Check if current locale is RTL
  isRTL(): boolean {
    const locale = SUPPORTED_LOCALES.find((l) => l.code === this.currentLocale);
    return locale?.rtl || false;
  }

  // Load translations dynamically (for code splitting)
  async loadTranslations(locale: string): Promise<void> {
    if (this.translations[locale]) {
      return; // Already loaded
    }

    try {
      const translations = await import(`../locales/${locale}.json`);
      this.translations[locale] = translations.default;
    } catch {
      logger.warn(`Failed to load translations for locale: ${locale}`);
    }
  }
}

// Global i18n instance
export const i18n = new I18nManager();

// React hook for using translations
export function useTranslation() {
  return {
    t: i18n.t.bind(i18n),
    locale: i18n.getCurrentLocale(),
    setLocale: i18n.setLocale.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatRelativeTime: i18n.formatRelativeTime.bind(i18n),
    isRTL: i18n.isRTL(),
    availableLocales: i18n.getAvailableLocales(),
  };
}

// Helper function for server-side translations
export function getServerTranslation(locale: string = DEFAULT_LOCALE) {
  const tempI18n = new I18nManager();
  tempI18n.setLocale(locale);
  return tempI18n.t.bind(tempI18n);
}
