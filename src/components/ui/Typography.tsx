interface TypographyProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
  children: React.ReactNode;
  className?: string;
}

export default function Typography({
  variant = "body",
  children,
  className = "",
}: TypographyProps) {
  const baseClasses = "font-semibold";

  const variantClasses = {
    h1: "text-3xl font-bold text-[#333333]",
    h2: "text-2xl font-bold text-[#333333]",
    h3: "text-lg font-bold text-[#333333]",
    body: "text-base text-[#666666]",
    caption: "text-sm text-[#757575]",
  };

  const fontFamily = variant.startsWith("h")
    ? "font-montserrat"
    : "font-poppins";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${fontFamily} ${className}`}
      style={{
        fontFamily: variant.startsWith("h")
          ? "'Montserrat', sans-serif"
          : "'Poppins', sans-serif",
      }}>
      {children}
    </div>
  );
}
