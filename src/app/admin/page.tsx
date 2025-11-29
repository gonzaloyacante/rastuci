"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { logger } from "@/lib/logger";

// Esquema para validación del formulario de login
const loginSchema = z.object({
  email: z.string().email("Por favor, introduce un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// Esquema para validación del formulario de recuperación de contraseña
const forgotPasswordSchema = z.object({
  email: z.string().email("Por favor, introduce un email válido"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function AdminLoginPage() {
  useDocumentTitle({ title: "Iniciar Sesión" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [_authError, setAuthError] = useState<string | null>(null);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Verificar si hay sesión activa al montar (sin usar useSession para evitar dependencia del provider)
  useEffect(() => {
    // Verificar sesión mediante API call
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data?.user) {
          router.push("/admin/dashboard");
        }
      } catch {
        // Si hay error, simplemente no redirigir
      }
    };
    checkSession();
  }, [router]);

  // Form para login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Form para recuperación de contraseña
  const {
    register: registerForgotPassword,
    handleSubmit: handleForgotPasswordSubmit,
    formState: { errors: forgotPasswordErrors },
    reset: resetForgotPasswordForm,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Manejo de inicio de sesión
  const onLoginSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setLoading(true);
    setAuthError(null);

    try {
      // Usar NextAuth para iniciar sesión (Credentials Provider).
      // Pedimos a NextAuth que redirija (redirect: true) y especificamos
      // `callbackUrl` para que la cookie de sesión se escriba correctamente
      // por el servidor y evitemos condiciones de carrera cliente/servidor.
      await signIn("credentials", {
        redirect: true,
        callbackUrl: "/admin/dashboard",
        email: data.email,
        password: data.password,
        remember: rememberMe,
      });

      // Nota: al usar `redirect: true` NextAuth hace la navegación, así
      // que no llegaremos aquí en el flujo normal. Dejamos el setLoading
      // por si hay errores inesperados.
    } catch (error) {
      logger.error("Error de inicio de sesión", { error });
      toast.error("Ha ocurrido un error al iniciar sesión");
      setLoading(false);
    }
  };

  // Manejo de recuperación de contraseña
  const onForgotPasswordSubmit: SubmitHandler<
    ForgotPasswordFormValues
  > = async (formData) => {
    setLoading(true);
    try {
      // Aquí implementarías la lógica real para enviar el correo de recuperación
      logger.info("Enviando correo de recuperación", { email: formData.email });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        "Hemos enviado un enlace de recuperación a tu correo electrónico"
      );
      setResetEmailSent(true);
      resetForgotPasswordForm();
    } catch (error) {
      logger.error("Error al enviar correo de recuperación", { error });
      toast.error("No se pudo enviar el correo de recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen surface-secondary">
      {/* Toaster para notificaciones */}
      <Toaster position="top-right" />
      <div className="w-full max-w-md p-8 space-y-6 surface rounded-xl shadow-lg border border-muted">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* Logo de Rastući */}
            <div className="h-20 w-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
              R
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary">
            {showForgotPassword
              ? "Recuperar Contraseña"
              : "Administración Rastući"}
          </h1>
          <p className="muted mt-2">
            {showForgotPassword
              ? "Ingresa tu correo para recibir instrucciones"
              : "Accede al panel de administración"}
          </p>
        </div>

        {!showForgotPassword ? (
          <form
            onSubmit={handleLoginSubmit(onLoginSubmit)}
            className="space-y-5"
          >
            <Input
              label="Correo electrónico"
              id="admin-email"
              type="email"
              placeholder="tu@email.com"
              {...registerLogin("email")}
              error={loginErrors.email?.message}
              disabled={loading}
              icon="mail"
              autoComplete="username"
              autoFocus
              aria-invalid={!!loginErrors.email}
            />
            <Input
              label="Contraseña"
              id="admin-password"
              type="password"
              placeholder="••••••••"
              {...registerLogin("password")}
              error={loginErrors.password?.message}
              disabled={loading}
              icon="lock"
              autoComplete="current-password"
              allowPasswordToggle
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                const caps =
                  e.getModifierState && e.getModifierState("CapsLock");
                if (typeof caps === "boolean") {
                  setCapsLockOn(caps);
                }
              }}
              onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                const caps =
                  e.getModifierState && e.getModifierState("CapsLock");
                if (typeof caps === "boolean") {
                  setCapsLockOn(caps);
                }
              }}
              aria-invalid={!!loginErrors.password}
              helpText={capsLockOn ? "Bloq Mayús está activado" : undefined}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-muted rounded cursor-pointer"
                  tabIndex={0}
                  aria-checked={rememberMe}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm muted cursor-pointer"
                >
                  Recordarme por 30 días
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:brightness-90"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-sm muted">
                * El acceso está restringido solo a administradores.
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            {resetEmailSent ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full surface text-success border border-success mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-primary">
                  Correo enviado
                </h3>
                <p className="muted mt-2">
                  Revisa tu bandeja de entrada y sigue las instrucciones para
                  restablecer tu contraseña.
                </p>
                <Button
                  type="button"
                  className="mt-6 w-full bg-primary hover:brightness-90"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                  }}
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleForgotPasswordSubmit(onForgotPasswordSubmit)}
                className="space-y-5"
              >
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="tu@email.com"
                  {...registerForgotPassword("email")}
                  error={forgotPasswordErrors.email?.message}
                  disabled={loading}
                  icon="mail"
                  autoComplete="email"
                />
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:brightness-90"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      "Enviar enlace"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <footer className="mt-8 text-center muted text-sm">
        <p>
          © {new Date().getFullYear()} Rastući. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
