import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({ rating, onRate, readonly = true, size = 20 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const isFilled = star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onRate && onRate(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none p-0`}
            aria-label={`Valorar ${star} estrellas`}
          >
            <Star
              size={size}
              strokeWidth={1.6}
              className={`transition-colors ${
                isFilled
                  ? 'fill-yellow text-yellow'
                  : 'fill-transparent text-ink/25'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
