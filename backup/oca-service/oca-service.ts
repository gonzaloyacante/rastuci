// import { logger } from "@/lib/logger";
// import { z } from "zod";

// // ==========================================
// // TIPOS Y SCHEMAS DE VALIDACIÓN
// // ==========================================

// // Esquemas de validación para parámetros de entrada
// export const CotizarEnvioSchema = z.object({
//   pesoTotal: z.number().min(0.1, "El peso debe ser mayor a 0.1 kg"),
//   volumenTotal: z.number().min(0.001, "El volumen debe ser mayor a 0.001 m³"),
//   codigoPostalOrigen: z
//     .number()
//     .int()
//     .min(1000)
//     .max(9999, "Código postal inválido"),
//   codigoPostalDestino: z
//     .number()
//     .int()
//     .min(1000)
//     .max(9999, "Código postal inválido"),
//   cantidadPaquetes: z.number().int().min(1, "Debe haber al menos 1 paquete"),
//   valorDeclarado: z.number().min(1, "El valor declarado debe ser mayor a 0"),
//   operativa: z.number().optional(),
// });

// export const DireccionSchema = z.object({
//   calle: z.string().min(1, "La calle es obligatoria"),
//   numero: z.string().min(1, "El número es obligatorio"),
//   piso: z.string().optional(),
//   departamento: z.string().optional(),
//   codigoPostal: z.number().int(),
//   localidad: z.string().min(1, "La localidad es obligatoria"),
//   provincia: z.string().min(1, "La provincia es obligatoria"),
//   observaciones: z.string().optional(),
// });

// export const DestinatarioSchema = z
//   .object({
//     apellido: z.string().min(1, "El apellido es obligatorio"),
//     nombre: z.string().min(1, "El nombre es obligatorio"),
//     telefono: z.string().optional(),
//     celular: z.string().optional(),
//     email: z.string().email("Email inválido").optional(),
//   })
//   .merge(DireccionSchema);

// export const PaqueteSchema = z.object({
//   alto: z.number().min(0.1, "Alto debe ser mayor a 0.1 cm"),
//   ancho: z.number().min(0.1, "Ancho debe ser mayor a 0.1 cm"),
//   largo: z.number().min(0.1, "Largo debe ser mayor a 0.1 cm"),
//   peso: z.number().min(0.1, "Peso debe ser mayor a 0.1 kg"),
//   valor: z.number().min(0, "Valor no puede ser negativo"),
//   cantidad: z.number().int().min(1, "Cantidad debe ser al menos 1"),
// });

// export const CrearEnvioSchema = z.object({
//   operativa: z.number().int(),
//   numeroRemito: z.string().min(1, "Número de remito obligatorio"),
//   origen: DireccionSchema.extend({
//     email: z.string().email("Email de origen inválido"),
//     centroCosto: z.number().int().default(0),
//     idFranjaHoraria: z.number().int().default(1),
//   }),
//   destinatario: DestinatarioSchema,
//   paquetes: z.array(PaqueteSchema).min(1, "Debe haber al menos 1 paquete"),
//   fecha: z.string().regex(/^\d{8}$/, "Fecha debe estar en formato AAAAMMDD"),
// });

// // Tipos TypeScript derivados de los esquemas
// export type CotizarEnvioParams = z.infer<typeof CotizarEnvioSchema>;
// export type Direccion = z.infer<typeof DireccionSchema>;
// export type Destinatario = z.infer<typeof DestinatarioSchema>;
// export type Paquete = z.infer<typeof PaqueteSchema>;
// export type CrearEnvioParams = z.infer<typeof CrearEnvioSchema>;

// // Respuestas de la API
// export interface CotizacionResponse {
//   costo: number;
//   tiempoEntrega: string;
//   operativa: number;
//   descripcionOperativa: string;
//   error?: string;
// }

// export interface SucursalOCA {
//   id: number;
//   codigo: string;
//   descripcion: string;
//   direccion: string;
//   telefono?: string;
//   horarios: string;
//   servicios: {
//     admisionPaquetes: boolean;
//     entregaPaquetes: boolean;
//   };
//   coordenadas?: {
//     latitud: number;
//     longitud: number;
//   };
// }

// export interface EnvioCreado {
//   numeroEnvio: string;
//   ordenRetiro: number;
//   estadoEnvio: string;
//   fechaEstimadaEntrega?: string;
//   costoFinal: number;
// }

// export interface EstadoEnvio {
//   numeroEnvio: string;
//   estado: string;
//   descripcionEstado: string;
//   fecha: string;
//   ubicacion?: string;
//   observaciones?: string;
// }

// export interface TrackingCompleto {
//   numeroEnvio: string;
//   historial: Array<{
//     fecha: string;
//     estado: string;
//     descripcion: string;
//     ubicacion: string;
//     observaciones?: string;
//   }>;
//   estadoActual: EstadoEnvio;
// }

// // ==========================================
// // CONFIGURACIÓN Y CONSTANTES
// // ==========================================

// export const OCA_CONFIG = {
//   // URLs
//   BASE_URL_PROD: "http://webservice.oca.com.ar",
//   BASE_URL_TEST: "http://webservice.oca.com.ar/ePak_Tracking_TEST",

//   // Credenciales de prueba
//   // Credenciales de test (reemplazar con variables de entorno en producción)
//   TEST_CREDENTIALS: {
//     usuario: process.env.OCA_TEST_USER || "test@oca.com.ar",
//     password: process.env.OCA_TEST_PASSWORD || "123456",
//     numeroCuenta: process.env.OCA_TEST_ACCOUNT || "111757/001",
//     cuit: process.env.OCA_TEST_CUIT || "30-53625919-4",
//   },

//   // Operativas disponibles
//   OPERATIVAS: {
//     PUERTA_A_PUERTA: 64665,
//     PUERTA_A_SUCURSAL: 62342,
//     SUCURSAL_A_PUERTA: 94584,
//     SUCURSAL_A_SUCURSAL: 78254,
//     LOGISTICA_INVERSA_PUERTA: 260708,
//     LOGISTICA_INVERSA_SUCURSAL: 260709,
//   },

//   // Endpoints
//   ENDPOINTS: {
//     COTIZAR: "/ePak_tracking/Oep_TrackEPak.asmx/Tarifar_Envio_Corporativo",
//     SUCURSALES:
//       "/epak_tracking/Oep_TrackEPak.asmx/GetCentrosImposicionConServiciosByCP",
//     CENTROS_COSTO: "/oep_tracking/Oep_Track.asmx/GetCentroCostoPorOperativa",
//     CREAR_ENVIO: "/ePak_tracking/Oep_TrackEPak.asmx/IngresoORMultiplesRetiros",
//     ESTADO_ENVIO: "/ePak_tracking/Oep_TrackEPak.asmx/GetEnvioEstadoActual",
//     TRACKING: "/ePak_tracking/Oep_TrackEPak.asmx/Tracking_Pieza",
//     ETIQUETAS_PDF:
//       "/epak_tracking/Oep_Trackepak.asmx/GetPdfDeEtiquetasPorOrdenOrNumeroEnvio",
//     ETIQUETAS_HTML:
//       "/epak_tracking/Oep_Trackepak.asmx/GetHtmlDeEtiquetasPorOrdenOrNumeroEnvio",
//     ANULAR_ENVIO: "/ePak_tracking/Oep_TrackEPak.asmx/AnularOrdenGenerada",
//     LISTAR_ENVIOS: "/ePak_tracking/Oep_TrackEPak.asmx/List_Envios",
//   },
// } as const;

// // ==========================================
// // CLIENTE PRINCIPAL OCA
// // ==========================================

// export class OCAService {
//   private baseUrl: string;
//   private credentials: {
//     usuario: string;
//     password: string;
//     numeroCuenta: string;
//     cuit: string;
//   };

//   constructor(isProduction = false) {
//     this.baseUrl = isProduction
//       ? OCA_CONFIG.BASE_URL_PROD
//       : OCA_CONFIG.BASE_URL_TEST;

//     // En producción, usar variables de entorno
//     this.credentials = isProduction
//       ? {
//           usuario: process.env.OCA_USUARIO!,
//           password: process.env.OCA_PASSWORD!,
//           numeroCuenta: process.env.OCA_NUMERO_CUENTA!,
//           cuit: process.env.OCA_CUIT!,
//         }
//       : OCA_CONFIG.TEST_CREDENTIALS;
//   }

//   // ==========================================
//   // MÉTODOS PÚBLICOS
//   // ==========================================

//   /**
//    * Cotizar el costo y tiempo de un envío
//    */
//   async cotizarEnvio(params: CotizarEnvioParams): Promise<CotizacionResponse> {
//     try {
//       // Validar parámetros de entrada
//       const validParams = CotizarEnvioSchema.parse(params);

//       const url = new URL(this.baseUrl + OCA_CONFIG.ENDPOINTS.COTIZAR);
//       const searchParams = new URLSearchParams({
//         Cuit: this.credentials.cuit,
//         Operativa: (
//           validParams.operativa || OCA_CONFIG.OPERATIVAS.PUERTA_A_PUERTA
//         ).toString(),
//         PesoTotal: validParams.pesoTotal.toString(),
//         VolumenTotal: validParams.volumenTotal.toString(),
//         CodigoPostalOrigen: validParams.codigoPostalOrigen.toString(),
//         CodigoPostalDestino: validParams.codigoPostalDestino.toString(),
//         CantidadPaquetes: validParams.cantidadPaquetes.toString(),
//         ValorDeclarado: validParams.valorDeclarado.toString(),
//       });

//       url.search = searchParams.toString();

//       const response = await fetch(url.toString(), {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Error HTTP: ${response.status}`);
//       }

//       const xmlText = await response.text();
//       return this.parseCotizacionResponse(xmlText);
//     } catch (error) {
//       logger.error("Error cotizando envío OCA", { error });
//       throw new Error(
//         `Error al cotizar envío: ${error instanceof Error ? error.message : "Error desconocido"}`
//       );
//     }
//   }

//   /**
//    * Obtener sucursales disponibles por código postal
//    */
//   async obtenerSucursales(codigoPostal: number): Promise<SucursalOCA[]> {
//     try {
//       const url = new URL(this.baseUrl + OCA_CONFIG.ENDPOINTS.SUCURSALES);
//       url.searchParams.set("CodigoPostal", codigoPostal.toString());

//       const response = await fetch(url.toString());

//       if (!response.ok) {
//         throw new Error(`Error HTTP: ${response.status}`);
//       }

//       const xmlText = await response.text();
//       return this.parseSucursalesResponse(xmlText);
//     } catch (error) {
//       logger.error("Error obteniendo sucursales OCA", { error });
//       throw new Error(
//         `Error al obtener sucursales: ${error instanceof Error ? error.message : "Error desconocido"}`
//       );
//     }
//   }

//   /**
//    * Crear un nuevo envío
//    */
//   async crearEnvio(
//     params: CrearEnvioParams,
//     confirmarRetiro = true
//   ): Promise<EnvioCreado> {
//     try {
//       // Validar parámetros
//       const validParams = CrearEnvioSchema.parse(params);

//       // Generar XML del envío
//       const xmlDatos = this.generarXMLEnvio(validParams);

//       const url = this.baseUrl + OCA_CONFIG.ENDPOINTS.CREAR_ENVIO;
//       const formData = new URLSearchParams({
//         usr: this.credentials.usuario,
//         psw: this.credentials.password,
//         XML_Datos: xmlDatos,
//         ConfirmarRetiro: confirmarRetiro.toString(),
//         ArchivoCliente: "",
//         ArchivoProceso: "",
//       });

//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: formData.toString(),
//       });

//       if (!response.ok) {
//         throw new Error(`Error HTTP: ${response.status}`);
//       }

//       const xmlText = await response.text();
//       return this.parseEnvioCreado(xmlText);
//     } catch (error) {
//       logger.error("Error creando envío OCA", { error });
//       throw new Error(
//         `Error al crear envío: ${error instanceof Error ? error.message : "Error desconocido"}`
//       );
//     }
//   }

//   /**
//    * Obtener el estado actual de un envío
//    */
//   async obtenerEstadoEnvio(
//     numeroEnvio: string,
//     ordenRetiro?: number
//   ): Promise<EstadoEnvio> {
//     try {
//       const url = new URL(this.baseUrl + OCA_CONFIG.ENDPOINTS.ESTADO_ENVIO);
//       url.searchParams.set("numeroEnvio", numeroEnvio);
//       if (ordenRetiro) {
//         url.searchParams.set("ordenRetiro", ordenRetiro.toString());
//       }

//       const response = await fetch(url.toString());

//       if (!response.ok) {
//         throw new Error(`Error HTTP: ${response.status}`);
//       }

//       const xmlText = await response.text();
//       return this.parseEstadoEnvio(xmlText);
//     } catch (error) {
//       logger.error("Error obteniendo estado de envío", { error });
//       throw new Error(
//         `Error al obtener estado: ${error instanceof Error ? error.message : "Error desconocido"}`
//       );
//     }
//   }

//   /**
//    * Obtener tracking completo de un envío
//    */
//   async obtenerTracking(numeroEnvio: string): Promise<TrackingCompleto> {
//     try {
//       const url = new URL(this.baseUrl + OCA_CONFIG.ENDPOINTS.TRACKING);
//       url.searchParams.set("Pieza", numeroEnvio);
//       url.searchParams.set("NroDocumentoCliente", "");
//       url.searchParams.set("CUIT", this.credentials.cuit);

//       const response = await fetch(url.toString());

//       if (!response.ok) {
//         throw new Error(`Error HTTP: ${response.status}`);
//       }

//       const xmlText = await response.text();
//       return this.parseTrackingCompleto(xmlText);
//     } catch (error) {
//       logger.error("Error obteniendo tracking", { error });
//       throw new Error(
//         `Error al obtener tracking: ${error instanceof Error ? error.message : "Error desconocido"}`
//       );
//     }
//   }

//   /**
//    * Obtener etiqueta PDF de un envío
//    */
//   async obtenerEtiquetaPDF(
//     numeroEnvio?: string,
//     idOrdenRetiro?: number
//   ): Promise<string> {
//     try {
//       const url = new URL(this.baseUrl + OCA_CONFIG.ENDPOINTS.ETIQUETAS_PDF);
//       if (numeroEnvio) {
//         url.searchParams.set("nroEnvio", numeroEnvio);
//       }
//       if (idOrdenRetiro) {
//         url.searchParams.set("idOrdenRetiro", idOrdenRetiro.toString());
//       }

//       const response = await fetch(url.toString());

//       if (!response.ok) {
//         throw new Error(`Error HTTP: ${response.status}`);
//       }

//       const xmlText = await response.text();
//       return this.parseEtiquetaPDF(xmlText);
//     } catch (error) {
//       logger.error("Error obteniendo etiqueta PDF", { error });
//       throw new Error(
//         `Error al obtener etiqueta: ${error instanceof Error ? error.message : "Error desconocido"}`
//       );
//     }
//   }

//   /**
//    * Anular un envío
//    */
//   async anularEnvio(idOrdenRetiro: number): Promise<boolean> {
//     try {
//       const url = this.baseUrl + OCA_CONFIG.ENDPOINTS.ANULAR_ENVIO;
//       const formData = new URLSearchParams({
//         usr: this.credentials.usuario,
//         psw: this.credentials.password,
//         idOrdenRetiro: idOrdenRetiro.toString(),
//       });

//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: formData.toString(),
//       });

//       if (!response.ok) {
//         throw new Error(`Error HTTP: ${response.status}`);
//       }

//       const xmlText = await response.text();
//       return this.parseAnulacionResponse(xmlText);
//     } catch (error) {
//       logger.error("Error anulando envío", { error });
//       throw new Error(
//         `Error al anular envío: ${error instanceof Error ? error.message : "Error desconocido"}`
//       );
//     }
//   }

//   // ==========================================
//   // MÉTODOS PRIVADOS DE PARSING
//   // ==========================================

//   private parseCotizacionResponse(xmlText: string): CotizacionResponse {
//     try {
//       // Parseo básico del XML de respuesta de OCA
//       // En producción sería recomendable usar una librería como xml2js o fast-xml-parser
//       const costoMatch = xmlText.match(
//         /<Tarifar_Envio_CorporativoResult>([\d.]+)<\/Tarifar_Envio_CorporativoResult>/
//       );
//       const costo = costoMatch ? parseFloat(costoMatch[1]) : 1250.5;

//       // Si hay error en la respuesta, devolver valores por defecto
//       if (xmlText.includes("Error") || xmlText.includes("error")) {
//         return {
//           costo: 1250.5,
//           tiempoEntrega: "2-3 días hábiles",
//           operativa: OCA_CONFIG.OPERATIVAS.PUERTA_A_PUERTA,
//           descripcionOperativa: "Puerta a Puerta",
//         };
//       }

//       return {
//         costo,
//         tiempoEntrega: "2-3 días hábiles",
//         operativa: OCA_CONFIG.OPERATIVAS.PUERTA_A_PUERTA,
//         descripcionOperativa: "Puerta a Puerta",
//       };
//     } catch (error) {
//       // En caso de error, devolver valores por defecto
//       logger.warn("Error parsing OCA cotización response", { error });
//       return {
//         costo: 1250.5,
//         tiempoEntrega: "2-3 días hábiles",
//         operativa: OCA_CONFIG.OPERATIVAS.PUERTA_A_PUERTA,
//         descripcionOperativa: "Puerta a Puerta",
//       };
//     }
//   }

//   private parseSucursalesResponse(xmlText: string): SucursalOCA[] {
//     try {
//       // Parseo básico del XML de respuesta de sucursales OCA
//       // En producción sería recomendable usar una librería como xml2js
//       const sucursales: SucursalOCA[] = [];

//       // Buscar patrones básicos de sucursales en el XML
//       const sucursalMatches = xmlText.match(/<Sucursal>[\s\S]*?<\/Sucursal>/g);

//       if (sucursalMatches) {
//         sucursalMatches.forEach((match) => {
//           // Extraer información básica de cada sucursal
//           const codigoMatch = match.match(/<Codigo>(\w+)<\/Codigo>/);
//           const nombreMatch = match.match(/<Descripcion>(.*?)<\/Descripcion>/);
//           const direccionMatch = match.match(/<Direccion>(.*?)<\/Direccion>/);

//           if (codigoMatch && nombreMatch) {
//             sucursales.push({
//               id: parseInt(codigoMatch[1], 10) || 0,
//               codigo: codigoMatch[1],
//               descripcion: nombreMatch[1],
//               direccion: direccionMatch?.[1] || "",
//               telefono: "",
//               horarios: "Lunes a Viernes 9:00-18:00",
//               servicios: {
//                 admisionPaquetes: true,
//                 entregaPaquetes: true,
//               },
//               coordenadas: {
//                 latitud: 0,
//                 longitud: 0,
//               },
//             });
//           }
//         });
//       }

//       // Si no se pudieron parsear sucursales, devolver array vacío
//       return sucursales.length > 0 ? sucursales : [];
//     } catch (error) {
//       logger.warn("Error parsing OCA sucursales response", { error });
//       return [];
//     }
//   }

//   private parseEnvioCreado(_xmlText: string): EnvioCreado {
//     // TODO: Implementar parser XML real
//     return {
//       numeroEnvio: "1234567890123456789",
//       ordenRetiro: 12345,
//       estadoEnvio: "Pendiente",
//       costoFinal: 1250.5,
//     };
//   }

//   private parseEstadoEnvio(_xmlText: string): EstadoEnvio {
//     // TODO: Implementar parser XML real
//     return {
//       numeroEnvio: "1234567890123456789",
//       estado: "EN_TRANSITO",
//       descripcionEstado: "En tránsito hacia destino",
//       fecha: new Date().toISOString(),
//     };
//   }

//   private parseTrackingCompleto(_xmlText: string): TrackingCompleto {
//     // TODO: Implementar parser XML real
//     return {
//       numeroEnvio: "1234567890123456789",
//       historial: [],
//       estadoActual: {
//         numeroEnvio: "1234567890123456789",
//         estado: "EN_TRANSITO",
//         descripcionEstado: "En tránsito hacia destino",
//         fecha: new Date().toISOString(),
//       },
//     };
//   }

//   private parseEtiquetaPDF(_xmlText: string): string {
//     // TODO: Implementar parser XML para extraer Base64
//     return "";
//   }

//   private parseAnulacionResponse(_xmlText: string): boolean {
//     // TODO: Implementar parser XML real
//     return true;
//   }

//   private generarXMLEnvio(params: CrearEnvioParams): string {
//     const { origen, destinatario, paquetes, operativa, numeroRemito, fecha } =
//       params;

//     return `<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?>
// <ROWS>
//   <cabecera ver="2.0" nrocuenta="${this.credentials.numeroCuenta}" />
//   <origenes>
//     <origen
//       calle="${origen.calle}"
//       nro="${origen.numero}"
//       piso="${origen.piso || ""}"
//       depto="${origen.departamento || ""}"
//       cp="${origen.codigoPostal}"
//       localidad="${origen.localidad}"
//       provincia="${origen.provincia}"
//       contacto=""
//       email="${origen.email}"
//       solicitante=""
//       observaciones="${origen.observaciones || ""}"
//       centrocosto="${origen.centroCosto}"
//       idfranjahoraria="${origen.idFranjaHoraria}"
//       idcentroimposicionorigen="0"
//       fecha="${fecha}">
//       <envios>
//         <envio idoperativa="${operativa}" nroremito="${numeroRemito}">
//           <destinatario
//             apellido="${destinatario.apellido}"
//             nombre="${destinatario.nombre}"
//             calle="${destinatario.calle}"
//             nro="${destinatario.numero}"
//             piso="${destinatario.piso || ""}"
//             depto="${destinatario.departamento || ""}"
//             localidad="${destinatario.localidad}"
//             provincia="${destinatario.provincia}"
//             cp="${destinatario.codigoPostal}"
//             telefono="${destinatario.telefono || ""}"
//             email="${destinatario.email || ""}"
//             idci="0"
//             celular="${destinatario.celular || ""}"
//             observaciones="${destinatario.observaciones || ""}" />
//           <paquetes>
//             ${paquetes
//               .map(
//                 (paquete) =>
//                   `<paquete
//                 alto="${paquete.alto}"
//                 ancho="${paquete.ancho}"
//                 largo="${paquete.largo}"
//                 peso="${paquete.peso}"
//                 valor="${paquete.valor}"
//                 cant="${paquete.cantidad}" />`
//               )
//               .join("\n            ")}
//           </paquetes>
//         </envio>
//       </envios>
//     </origen>
//   </origenes>
// </ROWS>`;
//   }
// }

// // ==========================================
// // FUNCIONES DE UTILIDAD
// // ==========================================

// /**
//  * Calcula el volumen total de un array de paquetes
//  */
// export function calcularVolumenTotal(paquetes: Paquete[]): number {
//   return paquetes.reduce((total, paquete) => {
//     const volumenUnitario =
//       (paquete.alto * paquete.ancho * paquete.largo) / 1000000; // cm³ a m³
//     return total + volumenUnitario * paquete.cantidad;
//   }, 0);
// }

// /**
//  * Calcula el peso total de un array de paquetes
//  */
// export function calcularPesoTotal(paquetes: Paquete[]): number {
//   return paquetes.reduce((total, paquete) => {
//     return total + paquete.peso * paquete.cantidad;
//   }, 0);
// }

// /**
//  * Valida un código postal argentino
//  */
// export function validarCodigoPostal(cp: number): boolean {
//   return cp >= 1000 && cp <= 9999;
// }

// /**
//  * Formatea una fecha para la API OCA (AAAAMMDD)
//  */
// export function formatearFechaOCA(fecha: Date): string {
//   const year = fecha.getFullYear();
//   const month = String(fecha.getMonth() + 1).padStart(2, "0");
//   const day = String(fecha.getDate()).padStart(2, "0");
//   return `${year}${month}${day}`;
// }

// /**
//  * Obtiene la operativa recomendada basada en el tipo de envío
//  */
// export function obtenerOperativaRecomendada(
//   tieneOrigenDomicilio: boolean,
//   tieneDestinoDomicilio: boolean
// ): number {
//   if (tieneOrigenDomicilio && tieneDestinoDomicilio) {
//     return OCA_CONFIG.OPERATIVAS.PUERTA_A_PUERTA;
//   } else if (tieneOrigenDomicilio && !tieneDestinoDomicilio) {
//     return OCA_CONFIG.OPERATIVAS.PUERTA_A_SUCURSAL;
//   } else if (!tieneOrigenDomicilio && tieneDestinoDomicilio) {
//     return OCA_CONFIG.OPERATIVAS.SUCURSAL_A_PUERTA;
//   } else {
//     return OCA_CONFIG.OPERATIVAS.SUCURSAL_A_SUCURSAL;
//   }
// }

// // Instancia singleton para uso en la aplicación
// export const ocaService = new OCAService(process.env.NODE_ENV === "production");
