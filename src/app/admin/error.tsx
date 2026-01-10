"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Admin Error Boundary caught:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
            <Card className="w-full max-w-md border-destructive/20 shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <CardTitle className="text-xl text-destructive">
                        Algo salió mal
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">
                        Ha ocurrido un error inesperado en el panel de administración.
                        Nuestros desarrolladores han sido notificados.
                    </p>
                    <div className="p-3 bg-muted/50 rounded-md text-sm font-mono text-left overflow-auto max-h-32">
                        {error.message || "Error desconocido"}
                    </div>
                    <Button onClick={reset} className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Intentar nuevamente
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
