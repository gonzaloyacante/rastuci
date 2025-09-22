import { Minus, Plus } from "lucide-react";

interface QuantityButtonProps {
  onIncrement: () => void;
  onDecrement: () => void;
  quantity: number;
  disabled?: boolean;
}

export default function QuantityButton({
  onIncrement,
  onDecrement,
  quantity,
  disabled = false,
}: QuantityButtonProps) {
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onDecrement}
        disabled={quantity <= 1 || disabled}
        className="p-2 rounded-full surface-secondary hover-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <Minus size={16} />
      </button>
      <span className="font-semibold w-8 text-center">{quantity}</span>
      <button
        onClick={onIncrement}
        disabled={disabled}
        className="p-2 rounded-full surface-secondary hover-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <Plus size={16} />
      </button>
    </div>
  );
}
