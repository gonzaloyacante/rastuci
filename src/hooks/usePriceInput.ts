import { useEffect, useState } from "react";
import { FieldValues, Path, UseFormSetValue } from "react-hook-form";

import { formatPriceARS } from "@/utils/formatters";

const ALLOWED_KEYS = [
  "Backspace",
  "Tab",
  "ArrowLeft",
  "ArrowRight",
  "Delete",
  "Home",
  "End",
];

// ==============================================================================
// usePriceInput — Maneja el estado y los handlers del campo de precio con
// formato ARS (puntos de miles + coma decimal).
// ==============================================================================
export function usePriceInput<T extends FieldValues>(
  watchPrice: number | undefined | null,
  setValue: UseFormSetValue<T>,
  fieldName: Path<T>
) {
  const [priceInput, setPriceInput] = useState<string>(
    watchPrice !== undefined && watchPrice !== null
      ? formatPriceARS(Number(watchPrice))
      : ""
  );

  useEffect(() => {
    if (watchPrice !== undefined && watchPrice !== null) {
      setPriceInput(formatPriceARS(Number(watchPrice)));
    }
  }, [watchPrice]);

  const handlePriceFocus = () => {
    if (watchPrice !== undefined && watchPrice !== null) {
      setPriceInput(String(Number(watchPrice)));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const filtered = String(raw).replace(/[^0-9.,]/g, "");
    setPriceInput(filtered);

    const noThousands = filtered.replace(/\./g, "");
    const normalized = noThousands.replace(/,/, ".");
    const parsed = parseFloat(normalized);

    if (!isNaN(parsed)) {
      setValue(fieldName, parsed as T[Path<T>], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else if (filtered.trim() === "") {
      setValue(fieldName, 0 as T[Path<T>], { shouldValidate: false });
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (ALLOWED_KEYS.includes(e.key)) return;
    if (!/^[0-9.,]$/.test(e.key)) e.preventDefault();
  };

  const handlePricePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData?.getData("text") || "";
    if (!/^[0-9.,\s]+$/.test(paste)) e.preventDefault();
  };

  const handlePriceBlur = () => {
    if (watchPrice !== undefined && watchPrice !== null) {
      setPriceInput(formatPriceARS(Number(watchPrice)));
    } else {
      setPriceInput("");
    }
  };

  return {
    priceInput,
    handlePriceFocus,
    handlePriceChange,
    handlePriceKeyDown,
    handlePricePaste,
    handlePriceBlur,
  };
}
