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
    data: any; // Can be string (URL) or object (Table structure)
}

export function SizeGuide({ data }: SizeGuideProps) {
    if (!data) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-primary underline text-xs font-medium hover:no-underline">
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
                            <Image src={data} alt="Guía de talles" fill className="object-contain" />
                        </div>
                    )}

                    {typeof data === "object" && data.columns && data.rows && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        {data.columns.map((col: string, idx: number) => (
                                            <th key={idx} className="border border-muted p-2 text-left font-medium">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.rows.map((row: string[], idx: number) => (
                                        <tr key={idx} className="even:bg-muted/20">
                                            {row.map((cell: string, cellIdx: number) => (
                                                <td key={cellIdx} className="border border-muted p-2">{cell}</td>
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
                                <div key={key} className="flex justify-between border-b border-muted py-2">
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
