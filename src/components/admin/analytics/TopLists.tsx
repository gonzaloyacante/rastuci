"use client";

import { ArrowRight, Package, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { type DashboardData } from "@/services/analytics-service";

interface TopListsProps {
  products: DashboardData["topProducts"];
  customers: DashboardData["topCustomers"];
}

export function TopLists({ products, customers }: TopListsProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);

  // Calculate max quantity for progress bar scaling
  const maxProductQuantity = Math.max(...products.map((p) => p.quantity), 1);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Top Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Package className="w-5 h-5 text-primary" />
            Productos Estrella
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Sin datos de ventas aún.
            </p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Avatar className="h-10 w-10 rounded-md border border-border/50">
                    <AvatarImage src={product.image || ""} alt={product.name} />
                    <AvatarFallback className="rounded-md bg-muted">
                      <Package className="w-5 h-5 opacity-50" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm truncate"
                      title={product.name}
                    >
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress
                        value={(product.quantity / maxProductQuantity) * 100}
                        className="h-1.5 w-24 bg-muted"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {product.quantity} unids
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right font-bold text-sm tabular-nums ml-4">
                  {formatCurrency(product.revenue)}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <User className="w-5 h-5 text-primary" />
            Mejores Clientes
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"
          >
            VIP Insights
          </Badge>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="space-y-0 divide-y divide-border/40">
            {customers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Sin datos de clientes aún.
              </p>
            ) : (
              customers.map((customer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 first:pt-0 hover:bg-muted/30 px-2 -mx-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 border border-border/50">
                      <AvatarFallback className="bg-primary/5 text-primary font-medium text-xs">
                        {customer.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p
                        className="font-medium text-sm truncate max-w-[150px]"
                        title={customer.email}
                      >
                        {customer.name || customer.email}
                      </p>
                      <div className="flex gap-2 mt-0.5">
                        {customer.isVip && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 h-4 border-amber-500/30 text-amber-600 bg-amber-500/5"
                          >
                            VIP
                          </Badge>
                        )}
                        {customer.isNew && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 h-4"
                          >
                            Nuevo
                          </Badge>
                        )}
                        {!customer.isVip && !customer.isNew && (
                          <span className="text-xs text-muted-foreground">
                            {customer.count} órden
                            {customer.count !== 1 ? "es" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-primary tabular-nums">
                      {formatCurrency(customer.spent)}
                    </div>
                    {(customer.isVip || customer.isNew) && (
                      <p className="text-xs text-muted-foreground">
                        {customer.count} órden{customer.count !== 1 ? "es" : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {customers.length > 0 && (
            <Button
              variant="ghost"
              className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground group"
              disabled
            >
              Ver todos los clientes
              <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
