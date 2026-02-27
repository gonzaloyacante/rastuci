"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

import { AnalyticsHeader } from "@/components/admin/analytics/AnalyticsHeader";
import { DevicesCard } from "@/components/admin/analytics/DevicesCard";
import { KPIGrid } from "@/components/admin/analytics/KPIGrid";
import { RevenueChart } from "@/components/admin/analytics/RevenueChart";
import { TopLists } from "@/components/admin/analytics/TopLists";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { type DashboardData } from "@/services/analytics-service";

async function fetchAnalytics(range: string): Promise<DashboardData> {
  const res = await fetch(`/api/admin/analytics/dashboard?range=${range}`);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<string>("week");

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["analytics", range],
    queryFn: () => fetchAnalytics(range),
    staleTime: 60 * 1000, // 1 minute
  });

  const handleExport = () => {
    if (!data) return;

    const headers = ["Fecha", "Ingresos", "Ordenes"];
    const rows = data.chart.map((item) => [
      item.date,
      item.revenue.toFixed(2),
      item.orders.toString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `analytics_report_${range}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isError) {
    return (
      <div className="p-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar las analíticas. Por favor intente recargar la
            página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      <AnalyticsHeader
        range={range}
        setRange={setRange}
        isRefreshing={isRefetching || isLoading}
        onRefresh={refetch}
        onExport={handleExport}
      />

      {isLoading || !data ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* Row 1: Key Metrics */}
          <KPIGrid data={data.kpi} />

          {/* Row 2: Main Chart + Device Distro */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <RevenueChart data={data.chart} />
            <DevicesCard data={data.devices} />
          </div>

          {/* Row 3: Insights (Products + Customers) */}
          <TopLists products={data.topProducts} customers={data.topCustomers} />
        </>
      )}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[160px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Skeleton className="h-[400px] col-span-4 lg:col-span-3 rounded-xl" />
        <Skeleton className="h-[400px] col-span-4 lg:col-span-1 rounded-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  );
}
