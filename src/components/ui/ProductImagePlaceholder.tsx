import { ImageIcon } from "lucide-react";

interface ProductImagePlaceholderProps {
    className?: string;
}

export const ProductImagePlaceholder = ({
    className,
}: ProductImagePlaceholderProps) => (
    <div
        className={`surface-secondary rounded-lg flex items-center justify-center ${className || "w-full h-48"}`}
    >
        <div className="text-center opacity-60">
            <ImageIcon className="h-12 w-12 muted mx-auto mb-2" />
            <p className="text-sm muted font-medium">Sin imagen</p>
        </div>
    </div>
);
