interface SelectionButtonProps {
  value: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  variant?: "square" | "rounded";
  className?: string;
}

export default function SelectionButton({
  value,
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
    ? "border-[#E91E63] bg-[#E91E63] text-white"
    : "border-[#E0E0E0] hover:border-[#E91E63] text-[#333333]";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${stateClasses} ${className}`}>
      {label}
    </button>
  );
}
