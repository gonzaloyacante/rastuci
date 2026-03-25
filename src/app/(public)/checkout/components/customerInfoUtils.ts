import type { CustomerInfo } from "@/context/CartContext";

export type FormErrors = Partial<Record<keyof CustomerInfo, string>>;

const PHONE_SEGMENT_LENGTHS: Record<number, [number, number]> = {
  2: [2, 4],
  3: [3, 4],
};

/** Aplica el formato visual de área + grupos a un string de dígitos */
function applyPhoneGroupFormat(n: string, areaLen: number): string {
  const parts = PHONE_SEGMENT_LENGTHS[areaLen] ?? [areaLen, 4];
  const a = n.slice(0, parts[0]);
  const b = n.slice(parts[0], parts[0] + parts[1]);
  const c = n.slice(parts[0] + parts[1]);
  return [a, b, c].filter(Boolean).join(" ");
}

/** Formatea un número de teléfono argentino visualmente mientras el usuario escribe */
export function formatArgPhone(value: string): string {
  const n = value.replace(/\D/g, "").slice(0, 11);
  if (!n.length) return "";
  const areaLen = n.startsWith("11") ? 2 : 3;
  return applyPhoneGroupFormat(n, areaLen).slice(0, 15);
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "El email es obligatorio";
  return /\S+@\S+\.\S+/.test(email) ? undefined : "El email no es válido";
}

function validatePhone(phone: string): string | undefined {
  if (!phone.trim()) return "El teléfono es obligatorio";
  return /^[\d\s\-+()]{8,20}$/.test(phone.replace(/\s/g, ""))
    ? undefined
    : "Formato de teléfono inválido";
}

function validatePostalCode(postalCode: string): string | undefined {
  if (!postalCode.trim()) return "El código postal es obligatorio";
  return /^[A-Z]?\d{4}$/i.test(postalCode)
    ? undefined
    : "Código postal inválido. Debe tener 4 dígitos, o una letra seguida de 4 dígitos.";
}

/** Valida los campos del formulario de información del cliente */
export function validateCustomerInfo(fd: CustomerInfo): FormErrors {
  const e: FormErrors = {};
  const req = (k: keyof CustomerInfo, label: string) => {
    if (!(fd[k] as string).trim()) e[k] = `${label} es obligatorio/a`;
  };
  req("name", "El nombre");
  req("address", "La dirección");
  req("city", "La ciudad");
  req("province", "La provincia");
  const setIfMsg = (k: keyof CustomerInfo, msg: string | undefined) => {
    if (msg) e[k] = msg;
  };
  setIfMsg("email", validateEmail(fd.email));
  setIfMsg("phone", validatePhone(fd.phone));
  setIfMsg("postalCode", validatePostalCode(fd.postalCode));
  return e;
}
