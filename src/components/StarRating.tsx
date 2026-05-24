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
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const isFilled = star <= rating;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onRate && onRate(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} 
              focus:outline-none`}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              size={size}
              className={`${
                isFilled 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-transparent text-gray-300'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}
