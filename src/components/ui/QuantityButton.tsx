import { Minus, Plus } from "lucide-react";
import { Button } from "./Button";

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
      <Button
        onClick={onDecrement}
        disabled={quantity <= 1 || disabled}
        variant="ghost"
        className="p-2 rounded-full surface-secondary hover-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-auto min-h-0 min-w-0"
      >
        <Minus size={16} />
      </Button>
      <span className="font-semibold w-8 text-center">{quantity}</span>
      <Button
        onClick={onIncrement}
        disabled={disabled}
        variant="ghost"
        className="p-2 rounded-full surface-secondary hover-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-auto min-h-0 min-w-0"
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}
