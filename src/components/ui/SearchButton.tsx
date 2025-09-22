interface SearchButtonProps {
  onClick: () => void;
  className?: string;
}

export default function SearchButton({
  onClick,
  className = "",
}: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Buscar productos"
      className={`absolute right-3 top-1/2 transform -translate-y-1/2 muted hover:text-primary p-1 h-auto bg-transparent border-0 cursor-pointer ${className}`}>
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  );
}
