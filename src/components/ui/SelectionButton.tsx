import { Button } from "./Button";

interface SelectionButtonProps {
  value: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  variant?: "square" | "rounded";
  className?: string;
}

export default function SelectionButton({
  value: _value,
  label,
  isSelected,
  onClick,
  variant = "rounded",
  className = "",
}: SelectionButtonProps) {
  const baseClasses = "font-semibold transition-all cursor-pointer";

  const variantClasses = {
    square: "w-12 h-12 rounded-lg border-2",
    rounded: "px-4 py-2 rounded-lg border-2",
  };

  const stateClasses = isSelected
    ? "border-primary bg-primary text-white"
    : "border-muted hover:border-primary";

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`${baseClasses} ${variantClasses[variant]} ${stateClasses} ${className} hover:bg-transparent h-auto p-0 min-h-0 min-w-0 flex items-center justify-center`}
    >
      {label}
    </Button>
  );
}
