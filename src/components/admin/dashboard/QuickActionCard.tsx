import { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface QuickAction {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: "blue" | "emerald" | "amber" | "purple" | "cyan" | "rose";
}

const colorMap = {
  blue: "from-blue-500 to-blue-600",
  emerald: "from-emerald-500 to-emerald-600",
  amber: "from-amber-500 to-amber-600",
  purple: "from-purple-500 to-purple-600",
  cyan: "from-cyan-500 to-cyan-600",
  rose: "from-rose-500 to-rose-600",
} as const;

const hoverColorMap = {
  blue: "from-blue-500/5 to-blue-600/5",
  emerald: "from-emerald-500/5 to-emerald-600/5",
  amber: "from-amber-500/5 to-amber-600/5",
  purple: "from-purple-500/5 to-purple-600/5",
  cyan: "from-cyan-500/5 to-cyan-600/5",
  rose: "from-rose-500/5 to-rose-600/5",
} as const;

export function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon;

  return (
    <Link href={action.href}>
      <div className="group relative overflow-hidden rounded-lg sm:rounded-xl surface border muted p-3 sm:p-4 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
        <div
          className={`absolute inset-0 bg-linear-to-br ${hoverColorMap[action.color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />
        <div className="relative flex items-start space-x-3">
          <div
            className={`shrink-0 w-10 h-10 rounded-lg bg-linear-to-br ${colorMap[action.color]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
              {action.title}
            </h3>
            <p className="text-[10px] sm:text-xs muted mt-0.5 sm:mt-1">
              {action.description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function QuickActionsGrid({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {actions.map((action) => (
        <QuickActionCard key={action.href} action={action} />
      ))}
    </div>
  );
}
