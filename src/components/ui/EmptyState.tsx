import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <Icon size={64} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">{title}</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>

      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button className="bg-pink-600 text-white hover:bg-pink-700 cursor-pointer">
            {actionText}
          </Button>
        </Link>
      )}

      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-pink-600 text-white hover:bg-pink-700 cursor-pointer">
          {actionText}
        </Button>
      )}
    </div>
  );
}
