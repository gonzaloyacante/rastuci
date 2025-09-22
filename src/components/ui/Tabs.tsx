import * as React from "react";

// Simplificación del componente Tabs sin dependencias externas
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  children: React.ReactNode;
}

function Tabs({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultValue,
  children,
  ...props
}: TabsProps) {
  return <div {...props}>{children}</div>;
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function TabsList({ children, ...props }: TabsListProps) {
  return (
    <div
      className="inline-flex h-10 items-center justify-center rounded-md surface-secondary p-1 muted"
      {...props}>
      {children}
    </div>
  );
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
  children: React.ReactNode;
}

function TabsTrigger({
  value,
  children,
  className = "",
  ...props
}: TabsTriggerProps) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      value={value}
      {...props}>
      {children}
    </button>
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

function TabsContent({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  value,
  children,
  ...props
}: TabsContentProps) {
  return <div {...props}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
