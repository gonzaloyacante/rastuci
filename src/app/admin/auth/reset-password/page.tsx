"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token no válido");
      return;
    }

    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        toast.success("Contraseña actualizada exitosamente");
        setTimeout(() => {
          router.push("/admin/auth/signin");
        }, 2000);
      } else {
        toast.error(data.error || "Error al actualizar la contraseña");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center surface p-4">
        <div className="max-w-md w-full space-y-6 surface-elevated p-8 rounded-xl border border-theme text-center">
          <h1 className="text-2xl font-bold text-error mb-2">Token Inválido</h1>
          <p className="text-muted">
            El enlace de recuperación no es válido o ha expirado.
          </p>
          <Link href="/admin/auth/forgot-password">
            <Button>Solicitar nuevo enlace</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center surface p-4">
        <div className="max-w-md w-full space-y-6 surface-elevated p-8 rounded-xl border border-theme">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              ¡Contraseña Actualizada!
            </h1>
            <p className="text-muted">
              Tu contraseña ha sido restablecida exitosamente. Serás redirigido
              al inicio de sesión...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center surface p-4">
      <div className="max-w-md w-full space-y-6 surface-elevated p-8 rounded-xl border border-theme">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-muted">Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Nueva Contraseña
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                disabled={isLoading}
                required
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary p-0 h-auto hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirmar Contraseña
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              disabled={isLoading}
              required
            />
          </div>

          {password && password.length < 8 && (
            <p className="text-sm text-error">
              La contraseña debe tener al menos 8 caracteres
            </p>
          )}

          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-sm text-error">Las contraseñas no coinciden</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading || password.length < 8 || password !== confirmPassword
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Restablecer Contraseña
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center surface">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
