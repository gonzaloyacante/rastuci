"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Download } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { useToast } from "@/components/ui/Toast";

interface VacationPeriod extends Record<string, unknown> {
  id: string;
  startAt: string;
  endAt: string | null;
  plannedEndAt: string | null;
  _count: {
    subscribers: number;
  };
}

export default function VacationHistory() {
  const [periods, setPeriods] = useState<VacationPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { show: toast } = useToast();

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const res = await fetch("/api/settings/vacation/periods");
      if (res.ok) {
        const data = await res.json();
        setPeriods(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = async (period: VacationPeriod) => {
    try {
      const res = await fetch(
        `/api/settings/vacation/subscribers?periodId=${period.id}`
      );
      if (!res.ok) throw new Error("Error fetching data");

      interface Subscriber {
        id: string;
        email: string;
        createdAt: string | Date;
        notified: boolean;
      }

      // ... inside downloadCSV ...
      const subscribers: Subscriber[] = await res.json();

      if (subscribers.length === 0) {
        toast({
          title: "Sin datos",
          message: "No hay suscriptores para exportar.",
          type: "info",
        });
        return;
      }

      // Generate CSV
      const headers = ["Email", "Fecha Suscripcion", "Notificado"];
      const rows = subscribers.map((sub) => [
        sub.email,
        new Date(sub.createdAt).toISOString(),
        sub.notified ? "Si" : "No",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = format(new Date(period.startAt), "yyyy-MM-dd");
      link.setAttribute("href", url);
      link.setAttribute("download", `suscriptores_vacaciones_${dateStr}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (_error) {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo exportar el archivo.",
      });
    } finally {
    }
  };

  return (
    <div className="mt-8">
      <AdminTable<VacationPeriod>
        title="Historial de Periodos"
        data={periods}
        loading={isLoading}
        emptyMessage="No hay historial registrado."
        columns={[
          {
            key: "startAt",
            label: "Inicio",
            render: (val) =>
              format(new Date(val as string), "dd/MM/yyyy", { locale: es }),
          },
          {
            key: "endAt",
            label: "Fin",
            render: (val) =>
              val ? (
                format(new Date(val as string), "dd/MM/yyyy", { locale: es })
              ) : (
                <span className="text-success font-medium">En curso</span>
              ),
          },
          {
            key: "subscribers",
            label: "Suscriptores",
            render: (_, row) => row._count.subscribers,
          },
        ]}
        actions={[
          {
            label: "CSV",
            icon: <Download className="w-4 h-4" />,
            onClick: (row) => downloadCSV(row),
            condition: (row) => row._count.subscribers > 0,
            className: "flex items-center gap-2",
          },
        ]}
      />
    </div>
  );
}
