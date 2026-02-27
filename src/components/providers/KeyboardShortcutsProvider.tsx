"use client";

import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export default function KeyboardShortcutsProvider({
  children,
}: KeyboardShortcutsProviderProps) {
  useGlobalKeyboardShortcuts();

  return (
    <>
      <KeyboardShortcutsModal />
      {children}
    </>
  );
}
