interface ProductImagePlaceholderProps {
  className?: string;
  text?: string;
}

export const ProductImagePlaceholder = ({
  className,
  text = "Sin imagen",
}: ProductImagePlaceholderProps) => (
  <div
    className={`relative overflow-hidden flex flex-col items-center justify-center surface-secondary rounded-lg ${className || "w-full h-48"}`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-muted/50"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
    <span className="text-muted/50 text-sm mt-2">{text}</span>
  </div>
);
