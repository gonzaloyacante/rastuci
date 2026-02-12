"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/components/ui/Toast";
import { Copy, Link as LinkIcon, Share2, Loader2, Check } from "lucide-react";
import { useState } from "react";

export function ShareWishlistModal() {
  const { shareWishlist, wishlistItems } = useWishlist();
  const { show } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (wishlistItems.length === 0) {
      show({ type: "error", message: "Tu lista está vacía" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await shareWishlist();
      if (result?.url) {
        setSharedUrl(result.url);
      } else {
        show({ type: "error", message: "Error al generar el enlace" });
      }
    } catch {
      show({ type: "error", message: "Error inesperado" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!sharedUrl) return;
    navigator.clipboard.writeText(sharedUrl);
    setIsCopied(true);
    show({ type: "success", message: "Enlace copiado al portapapeles" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenMain = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSharedUrl(null); // Reset on close
      setIsCopied(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenMain}>
      <DialogTrigger asChild>
        <Button variant="hero" className="w-full sm:w-auto">
          <Share2 className="w-4 h-4 mr-2" />
          Compartir Lista
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Compartir Lista de Deseos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!sharedUrl ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                Se generará un enlace público con tus {wishlistItems.length}{" "}
                productos favoritos. Cualquiera con el enlace podrá verlos.
              </p>
              <Button
                onClick={handleShare}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando enlace...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Generar Enlace Público
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <div className="flex items-center border rounded-md px-3 py-2 bg-gray-50">
                    <input
                      className="flex-1 bg-transparent outline-none text-sm text-gray-600 truncate"
                      value={sharedUrl}
                      readOnly
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className={`px-3 ${isCopied ? "border-green-500 text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700" : ""}`}
                  variant="outline"
                  onClick={copyToClipboard}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-center text-gray-500">
                Este enlace es válido por 30 días.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
