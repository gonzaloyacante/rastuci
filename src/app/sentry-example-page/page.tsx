"use client";

import { Button } from "@/components/ui/Button";
import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  const recordBreadcrumb = () => {
    Sentry.addBreadcrumb({
      category: "ui.action",
      message: "User clicked the breadcrumb button",
      level: "info",
    });
    alert("Breadcrumb recorded! Now throw an error to see it in the trail.");
  };

  const startTransaction = () => {
    Sentry.startSpan(
      {
        name: "Example Transaction",
        op: "test.transaction",
      },
      (span) => {
        // Simulate work
        setTimeout(() => {
          span.setAttribute("custom.attribute", "test-value");
          span.end();
          alert("Transaction recorded!");
        }, 500);
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gray-50 dark:bg-gray-900 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Sentry Observability Lab
        </h1>
        <p className="max-w-xl text-muted-foreground mx-auto">
          Use the controls below to verify different aspects of your Sentry
          integration. Check your Sentry dashboard after each action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Test 1: Exception */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-semibold text-lg">1. Exception Capture</h3>
          <p className="text-sm text-muted-foreground">
            Sends an error to Sentry immediately without crashing the app.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              fullWidth
              onClick={() => {
                const errorId = Sentry.captureException(
                  new Error(
                    "Sentry Test Error (Manual): " + new Date().toISOString()
                  )
                );
                alert(
                  `Error enviado a Sentry!\nID: ${errorId}\nRevisa tu dashboard.`
                );
              }}
            >
              Enviar Error (Sin Crash)
            </Button>

            <Button
              variant="outline"
              fullWidth
              className="text-red-500 hover:text-red-600 border-red-200"
              onClick={() => {
                throw new Error(
                  "Sentry Crash Test: " + new Date().toISOString()
                );
              }}
            >
              Crash App (Pantalla Roja)
            </Button>
          </div>
        </div>

        {/* Test 2: Breadcrumbs */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-semibold text-lg">2. Breadcrumbs</h3>
          <p className="text-sm text-muted-foreground">
            Records user actions (clicks) leading up to an error.
          </p>
          <Button variant="secondary" fullWidth onClick={recordBreadcrumb}>
            Leaf Breadcrumb
          </Button>
        </div>

        {/* Test 3: Performance */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-semibold text-lg">3. Performance Span</h3>
          <p className="text-sm text-muted-foreground">
            Starts a custom transaction to measure operation latency.
          </p>
          <Button variant="outline" fullWidth onClick={startTransaction}>
            Start Transaction
          </Button>
        </div>
      </div>
    </div>
  );
}
