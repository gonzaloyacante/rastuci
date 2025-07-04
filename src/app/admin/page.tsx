"use client";

import { signIn } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

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
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toast.error("Credenciales incorrectas");
        setLoading(false);
      } else {
        toast.success("¡Bienvenido al panel de administración!");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
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
      // Por ahora, solo simulamos un éxito
      console.log("Enviando correo de recuperación a:", formData.email);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success(
        "Hemos enviado un enlace de recuperación a tu correo electrónico"
      );
      setResetEmailSent(true);
      resetForgotPasswordForm();
    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error);
      toast.error("No se pudo enviar el correo de recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* Logo de Rastuci */}
            <div className="h-20 w-20 bg-[#E91E63] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
              R
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {showForgotPassword
              ? "Recuperar Contraseña"
              : "Administración Rastući"}
          </h1>
          <p className="text-gray-600 mt-2">
            {showForgotPassword
              ? "Ingresa tu correo para recibir instrucciones"
              : "Accede al panel de administración"}
          </p>
        </div>

        {!showForgotPassword ? (
          <form
            onSubmit={handleLoginSubmit(onLoginSubmit)}
            className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              {...registerLogin("email")}
              error={loginErrors.email?.message}
              disabled={loading}
              icon="mail"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              {...registerLogin("password")}
              error={loginErrors.password?.message}
              disabled={loading}
              icon="lock"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#E91E63] focus:ring-[#E91E63] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-medium text-[#E91E63] hover:text-[#C2185B]">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#E91E63] hover:bg-[#C2185B]"
              disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                * El acceso está restringido solo a administradores.
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            {resetEmailSent ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Correo enviado
                </h3>
                <p className="text-gray-600 mt-2">
                  Revisa tu bandeja de entrada y sigue las instrucciones para
                  restablecer tu contraseña.
                </p>
                <Button
                  type="button"
                  className="mt-6 w-full bg-[#E91E63] hover:bg-[#C2185B]"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                  }}>
                  Volver al inicio de sesión
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleForgotPasswordSubmit(onForgotPasswordSubmit)}
                className="space-y-5">
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="tu@email.com"
                  {...registerForgotPassword("email")}
                  error={forgotPasswordErrors.email?.message}
                  disabled={loading}
                  icon="mail"
                />
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={loading}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#E91E63] hover:bg-[#C2185B]"
                    disabled={loading}>
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

      <footer className="mt-8 text-center text-gray-600 text-sm">
        <p>
          © {new Date().getFullYear()} Rastući. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
