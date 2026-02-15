"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { ProductBulkUpdateItem } from "@/lib/validation/product";
import { CheckCircle, FileSpreadsheet, Upload } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParseResult {
  data: Record<string, unknown>[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: string[];
}

export function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkImportModalProps) {
  const { show } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProductBulkUpdateItem[] | null>(
    null
  );
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    setParsedData(null);
    setSummary(null);
    setUploadResult(null);

    if (selectedFile) {
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    setIsParsing(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
        setIsParsing(false);
        validateData(results.data);
      },
      error: (error: Error) => {
        setIsParsing(false);
        show({ type: "error", message: `Error parsing CSV: ${error.message}` });
      },
    });
  };

  const validateData = (rows: Record<string, unknown>[]) => {
    const validItems: ProductBulkUpdateItem[] = [];
    const warnings: string[] = [];
    let invalidCount = 0;

    // Check if ID column exists in the first row
    if (
      rows.length > 0 &&
      !Object.prototype.hasOwnProperty.call(rows[0], "ID")
    ) {
      setSummary({
        totalRows: rows.length,
        validRows: 0,
        invalidRows: rows.length,
        warnings: ["Missing required column: 'ID' (case-sensitive)"],
      });
      return;
    }

    rows.forEach((row) => {
      // Map CSV columns to Schema fields
      // CSV Headers from Export: ID, Name, Category, Price, Stock, OnSale, Active...
      // We only care about ID for matching, and updateable fields: Price, Stock, OnSale, Active.

      const id = row["ID"] as string | undefined;
      if (!id) {
        invalidCount++;
        return;
      }

      const item: ProductBulkUpdateItem = {
        id,
      };

      // Helper to parse numbers safely
      const parseNum = (val: unknown): number | undefined => {
        if (!val || val === "") return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      };

      // Helper to parse booleans safely (YES/NO from export)
      const parseBool = (val: unknown): boolean | undefined => {
        if (!val) return undefined;
        const s = String(val).toUpperCase();
        if (s === "SI" || s === "YES" || s === "TRUE" || s === "1") return true;
        if (s === "NO" || s === "NO" || s === "FALSE" || s === "0")
          return false;
        return undefined;
      };

      // Map optional fields if present in CSV
      if (row["Precio"] !== undefined) item.price = parseNum(row["Precio"]);
      if (row["Precio Oferta"] !== undefined)
        item.salePrice = parseNum(row["Precio Oferta"]);
      if (row["Stock Total"] !== undefined)
        item.stock = parseNum(row["Stock Total"]);
      if (row["En Oferta"] !== undefined)
        item.onSale = parseBool(row["En Oferta"]);
      if (row["Activo"] !== undefined) item.isActive = parseBool(row["Activo"]);

      validItems.push(item);
    });

    setParsedData(validItems);
    setSummary({
      totalRows: rows.length,
      validRows: validItems.length,
      invalidRows: invalidCount,
      warnings,
    });
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to import products");
      }

      setUploadResult({
        success: result.data.success,
        failed: result.data.failed,
      });

      show({
        type: "success",
        message: `Import successful: ${result.data.success} updated`,
      });

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Import error:", error);
      show({
        type: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setSummary(null);
    setUploadResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Productos (Actualización Masiva)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Seleccionar archivo CSV</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-center hover:bg-surface-secondary transition-colors cursor-pointer relative">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
              <p className="text-sm text-content-secondary">
                Arrastra tu archivo aquí o haz clic para buscar
              </p>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={isParsing || isUploading}
              />
            </div>
            {file && (
              <p className="text-sm text-content-primary font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          {/* Parsing Loading State */}
          {isParsing && (
            <div className="flex items-center gap-2 text-content-secondary">
              <Spinner size="sm" />
              <span className="text-sm">Analizando archivo...</span>
            </div>
          )}

          {/* Validation Summary */}
          {summary && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Resumen del Análisis</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-secondary p-3 rounded-md text-center">
                  <div className="text-2xl font-bold">{summary.totalRows}</div>
                  <div className="text-xs text-content-secondary">
                    Filas Totales
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-md text-center border border-emerald-100 dark:border-emerald-900/20">
                  <div className="text-2xl font-bold text-emerald-600">
                    {summary.validRows}
                  </div>
                  <div className="text-xs text-emerald-600/80">
                    Filas Válidas
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md text-center border border-amber-100 dark:border-amber-900/20">
                  <div className="text-2xl font-bold text-amber-600">
                    {summary.invalidRows}
                  </div>
                  <div className="text-xs text-amber-600/80">Ignoradas</div>
                </div>
              </div>

              {summary.warnings.length > 0 && (
                <Alert variant="warning" title="Advertencias">
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {summary.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </div>
          )}

          {/* Data Preview */}
          {parsedData && parsedData.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">
                Vista Previa (Primeros 5 items)
              </h3>
              <div className="border rounded-md overflow-hidden text-sm">
                <table className="w-full text-left">
                  <thead className="bg-surface-secondary text-content-secondary border-b">
                    <tr>
                      <th className="p-2 font-medium">ID</th>
                      <th className="p-2 font-medium">Precio</th>
                      <th className="p-2 font-medium">Stock</th>
                      <th className="p-2 font-medium">Oferta</th>
                      <th className="p-2 font-medium">Activo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 5).map((item, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-2 font-mono text-xs truncate max-w-[100px]">
                          {item.id}
                        </td>
                        <td className="p-2">
                          {item.price !== undefined ? `$${item.price}` : "-"}
                        </td>
                        <td className="p-2">
                          {item.stock !== undefined ? item.stock : "-"}
                        </td>
                        <td className="p-2">
                          {item.onSale !== undefined
                            ? item.onSale
                              ? "SI"
                              : "NO"
                            : "-"}
                        </td>
                        <td className="p-2">
                          {item.isActive !== undefined
                            ? item.isActive
                              ? "SI"
                              : "NO"
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-content-secondary text-center">
                ... y {Math.max(0, parsedData.length - 5)} más
              </p>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg flex items-center gap-3 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                  ¡Importación completada!
                </h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Se actualizaron {uploadResult.success} productos
                  correctamente.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={
              !parsedData || parsedData.length === 0 || isUploading || isParsing
            }
          >
            {isUploading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Procesando...
              </>
            ) : (
              "Confirmar Importación"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
