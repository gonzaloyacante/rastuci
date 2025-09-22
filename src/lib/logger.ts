type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = Record<string, unknown> | undefined;

function format(level: LogLevel, msg: string, ctx?: LogContext) {
  const ts = new Date().toISOString();
  const base = { ts, level, msg } as Record<string, unknown>;
  const merged = ctx ? { ...base, ...ctx } : base;
  // Keep it line-oriented JSON for easy ingestion
  return JSON.stringify(merged);
}

// ---- PII masking helpers ----
const EMAIL_RE = /([A-Z0-9._%+-]+)@([A-Z0-9.-]+\.[A-Z]{2,})/gi;
const PHONE_RE = /\b\+?\d[\d\s().-]{6,}\b/g; // crude phone matcher

function redactEmail(val: string): string {
  return val.replace(EMAIL_RE, (_m, user, host) => `${String(user).slice(0, 2)}***@${host}`);
}

function redactPhone(val: string): string {
  return val.replace(PHONE_RE, (m) => `${m.slice(0, 2)}***${m.slice(-2)}`);
}

function maskValue(v: unknown): unknown {
  if (typeof v === "string") {
    let s = v;
    s = redactEmail(s);
    s = redactPhone(s);
    return s;
  }
  if (Array.isArray(v)) return v.map(maskValue);
  if (v && typeof v === "object") return maskObject(v as Record<string, unknown>);
  return v;
}

function maskObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    // If explicit sensitive keys, always redact fully
    if (["email", "customerEmail", "phone", "customerPhone"].includes(k)) {
      out[k] = typeof v === "string" ? "***redacted***" : null;
    } else {
      out[k] = maskValue(v);
    }
  }
  return out;
}

export function safeCtx(ctx?: LogContext): LogContext {
  if (!ctx) return ctx;
  try {
    return maskObject(ctx as Record<string, unknown>);
  } catch {
    return { error: "ctx_mask_failed" };
  }
}

export const logger = {
  debug(msg: string, ctx?: LogContext) {
    console.debug(format("debug", msg, safeCtx(ctx)));
  },
  info(msg: string, ctx?: LogContext) {
    console.info(format("info", msg, safeCtx(ctx)));
  },
  warn(msg: string, ctx?: LogContext) {
    console.warn(format("warn", msg, safeCtx(ctx)));
  },
  error(msg: string, ctx?: LogContext) {
    console.error(format("error", msg, safeCtx(ctx)));
  },
};

export function getRequestId(headers: Headers): string {
  // Prefer existing header (from proxy/edge), else generate
  const existing = headers.get("x-request-id") || headers.get("x-correlation-id");
  if (existing) return existing;
  // Node/Edge has crypto.randomUUID
  try {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}
