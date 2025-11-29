import { Spinner } from "@/components/ui/Spinner";
import React from "react";

interface AdminLoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullPage?: boolean;
}

export const AdminLoading: React.FC<AdminLoadingProps> = ({
  size = "md",
  text = "Cargando...",
  className = "",
  fullPage = false,
}) => {
  const getContainerClasses = () => {
    if (fullPage) {
      return "fixed inset-0 surface bg-opacity-75 flex justify-center items-center z-50";
    }
    return "flex justify-center items-center";
  };

  const getMinHeight = () => {
    if (fullPage) {
      return "";
    }
    switch (size) {
      case "sm":
        return "h-32";
      case "md":
        return "h-64";
      case "lg":
        return "h-96";
      default:
        return "h-64";
    }
  };

  return (
    <div className={`${getContainerClasses()} ${getMinHeight()} ${className}`}>
      <div className="text-center">
        <Spinner size={size} className="mx-auto" />
        {text && <p className="text-content-secondary mt-2 text-sm">{text}</p>}
      </div>
    </div>
  );
};
