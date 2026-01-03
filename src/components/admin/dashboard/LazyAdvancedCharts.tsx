"use client";

import { createLazyComponent } from "@/components/ui/LazyWrapper";
import { Skeleton } from "@/components/ui/Skeleton";

// Fallback específico para AdvancedCharts
const ChartsFallback = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="surface rounded-lg shadow-sm border muted p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <Skeleton className="h-48 lg:h-64 w-full rounded" />
                </div>
            ))}
        </div>
    </div>
);

// Lazy component - reduces initial bundle by ~50KB (chart.js + react-chartjs-2)
export const LazyAdvancedCharts = createLazyComponent(
    () => import("./AdvancedCharts"),
    <ChartsFallback />
);

export default LazyAdvancedCharts;
