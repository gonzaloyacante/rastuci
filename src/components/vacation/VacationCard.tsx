"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/Toast";

const SubscriberSchema = z.object({
  email: z.string().email("Email inválido"),
});

type SubscriberForm = z.infer<typeof SubscriberSchema>;

export default function VacationCard({
  condensed = false,
}: {
  condensed?: boolean;
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { show: toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriberForm>({
    resolver: zodResolver(SubscriberSchema),
  });

  const onSubmit = async (data: SubscriberForm) => {
    setIsLoading(true);
    try {
      // Get cart snapshot from local storage or context if needed?
      // For now, simpler implementation: just email.
      // If we want cart snapshot, we need access to CartContext.
      // Assuming we are in Cart page, parent could pass it.
      // But for simplicity, let's just send empty cart snapshot for now or enhance later.

      const res = await fetch("/api/settings/vacation/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Error al suscribirse");

      setIsSubmitted(true);
      toast({
        title: "¡Gracias!",
        message: "Te avisaremos apenas volvamos.",
        type: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast({
        type: "error",
        title: "Error",
        message: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-success-50 border-success-200">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
          <CheckCircle className="w-12 h-12 text-success-500 mb-2" />
          <h3 className="font-semibold text-lg text-success-900">¡Listo!</h3>
          <p className="text-success-800">
            Ya estás en nuestra lista prioritaria. Te enviaremos un email en
            cuanto abramos la tienda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warning-200 bg-warning-50/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-warning-900 text-lg">
          <Mail className="w-5 h-5" />
          {condensed ? "Avísame cuando vuelvan" : "Estamos tomando un descanso"}
        </CardTitle>
        {!condensed && (
          <CardDescription className="text-warning-800/80">
            Dejanos tu email y sé el primero en saber cuando volvamos a abrir.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                {...register("email")}
                placeholder="tu@email.com"
                className="bg-white border-warning-200 focus-visible:ring-warning-500"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-error-500 mt-1 pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-warning-600 hover:bg-warning-700 text-white shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Avisarme"
              )}
            </Button>
          </div>

          <Alert variant="warning" className="bg-warning-50 border-warning-200">
            <AlertTriangle className="h-4 w-4 text-warning-600" />
            <h5 className="font-medium text-warning-900 mb-1">Importante</h5>
            <AlertDescription className="text-warning-800 text-xs md:text-sm">
              Los productos en tu carrito no se reservan hasta el momento del
              pago.
            </AlertDescription>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
}
