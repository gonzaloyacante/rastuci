"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

const shortcuts = [
  { key: "/", description: "Buscar productos" },
  { key: "Ctrl+K", description: "Abrir búsqueda rápida" },
  { key: "C", description: "Ir al carrito" },
  { key: "H", description: "Volver al inicio" },
  { key: "Esc", description: "Cerrar modales / menús" },
  { key: "?", description: "Mostrar atajos" },
];

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    window.addEventListener("open-shortcuts-modal", handleOpen);
    window.addEventListener("close-all-modals", handleClose);

    return () => {
      window.removeEventListener("open-shortcuts-modal", handleOpen);
      window.removeEventListener("close-all-modals", handleClose);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atajos de Teclado</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 border-b border-muted last:border-0"
            >
              <span className="text-sm font-medium text-foreground">
                {shortcut.description}
              </span>
              <div className="flex gap-1">
                {shortcut.key.split("+").map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-1 bg-muted rounded-md text-xs font-mono text-muted-foreground border border-border shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
