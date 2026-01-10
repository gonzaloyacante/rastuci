import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Ruler } from "lucide-react";
import Image from "next/image";

interface SizeGuideProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Can be string (URL) or object (Table structure)
}

export function SizeGuide({ data }: SizeGuideProps) {
  if (!data) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-primary underline text-xs font-medium hover:no-underline"
        >
          <Ruler className="w-3 h-3 mr-1" />
          Ver guía de talles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Guía de Talles</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {typeof data === "string" && (
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={data}
                alt="Guía de talles"
                fill
                className="object-contain"
              />
            </div>
          )}

          {typeof data === "object" && data.columns && data.rows && (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    {data.columns.map((col: string, idx: number) => (
                      <th
                        key={idx}
                        className="p-3 text-left font-semibold text-muted-foreground border-b border-muted min-w-[100px]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row: string[], idx: number) => (
                    <tr
                      key={idx}
                      className="border-b border-muted/50 last:border-0 hover:bg-muted/10 transition-colors"
                    >
                      {row.map((cell: string, cellIdx: number) => (
                        <td
                          key={cellIdx}
                          className={`p-3 text-foreground ${cellIdx === 0 ? "font-semibold" : ""}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Fallback for simple key-value pairs */}
          {typeof data === "object" && !data.columns && (
            <div className="space-y-2">
              {Object.entries(data).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between border-b border-muted py-2"
                >
                  <span className="font-medium capitalize">{key}</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
