"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { show } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      show({ type: "error", message: "Por favor ingresa tu email" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setEmailSent(true);
        show({
          type: "success",
          message: "Email enviado. Revisa tu bandeja de entrada",
        });
      } else {
        show({
          type: "error",
          message: data.error || "Error al enviar el email",
        });
      }
    } catch (error) {
      logger.error("Error:", { error: error });
      show({ type: "error", message: "Error al procesar la solicitud" });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center surface p-4">
        <div className="max-w-md w-full space-y-6 surface-elevated p-8 rounded-xl border border-theme">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              ¡Email Enviado!
            </h1>
            <p className="text-muted">
              Si tu email está registrado, recibirás instrucciones para
              restablecer tu contraseña.
            </p>
          </div>

          <div className="bg-info/10 border border-info/20 rounded-lg p-4 text-sm text-info">
            <p className="font-medium mb-1">📧 Revisa tu email</p>
            <p>
              El enlace de recuperación expirará en 1 hora. Si no lo ves, revisa
              tu carpeta de spam.
            </p>
          </div>

          <Link href="/admin/auth/signin" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center surface p-4">
      <div className="max-w-md w-full space-y-6 surface-elevated p-8 rounded-xl border border-theme">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-muted">
            Ingresa tu email y te enviaremos un enlace para restablecerla
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rastuci.com"
              disabled={isLoading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Enviar enlace de recuperación
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/admin/auth/signin"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
