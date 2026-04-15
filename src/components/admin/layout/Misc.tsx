interface Message {
  id: string;
  content: string;
  sender: "customer" | "admin";
  senderName: string;
  timestamp: string;
  isInternal?: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  maxHeight?: string;
}

export function MessageThread({
  messages,
  maxHeight = "max-h-96",
}: MessageThreadProps) {
  return (
    <div className={`space-y-4 ${maxHeight} overflow-y-auto`}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-4 rounded-lg ${
            msg.sender === "admin" ? "surface-secondary ml-8" : "surface mr-8"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">{msg.senderName}</span>
            <span className="text-xs text-muted">
              {new Date(msg.timestamp).toLocaleString("es-AR")}
            </span>
          </div>
          <p className="text-sm">{msg.content}</p>
        </div>
      ))}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  size = "md",
}: RatingDisplayProps) {
  const fullStars = Math.floor(rating);
  const emptyStars = maxRating - fullStars;
  const sizeClass = { sm: "text-sm", md: "text-base", lg: "text-lg" };
  return (
    <span className={`text-warning ${sizeClass[size]}`}>
      {"★".repeat(fullStars)}
      {"☆".repeat(emptyStars)}
    </span>
  );
}
