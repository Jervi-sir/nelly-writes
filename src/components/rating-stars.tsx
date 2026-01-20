import { Star } from "lucide-react";

interface RatingStarsProps {
  rating?: number;
  max?: number;
  onChange?: (rating: 1 | 2 | 3 | 4 | 5) => void;
  readOnly?: boolean;
  disabled?: boolean;
  size?: number;
}

export function RatingStars({ rating = 0, max = 5, onChange, readOnly = false, disabled = false, size = 16 }: RatingStarsProps) {
  return (
    <div className={`flex items-center gap-0.5 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= (rating || 0);

        return (
          <button
            key={i}
            type="button"
            className={`
              p-0.5 focus:outline-none focus:ring-2 focus:ring-ring rounded-sm transition-transform hover:scale-110
              ${readOnly || disabled ? "cursor-default hover:scale-100" : "cursor-pointer"}
              ${filled ? "text-yellow-400" : "text-muted-foreground/30"}
            `}
            onClick={() => {
              if (!readOnly && !disabled && onChange) {
                // Cast to 1-5
                onChange(starValue as 1 | 2 | 3 | 4 | 5);
              }
            }}
            disabled={disabled || readOnly}
          >
            <Star
              size={size}
              className={`${filled ? "fill-current" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
}
