import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  /**
   * Voto propio del usuario, si lo hay. Se usa para poder retirarlo: pulsar la
   * estrella que ya tenías marcada emite 0. Sin este dato no se podría, porque
   * `rating` puede ser la media de todos y no tu voto.
   */
  votoPropio?: number | null;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({ rating, votoPropio, onRate, readonly = true, size = 20 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (star: number) => {
    if (!onRate) return;
    onRate(votoPropio === star ? 0 : star);
  };

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const isFilled = star <= rating;
        const quitaria = !readonly && votoPropio === star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none p-0`}
            aria-label={quitaria ? 'Quitar mi voto' : `Valorar ${star} estrellas`}
            title={quitaria ? 'Pulsa otra vez para quitar tu voto' : undefined}
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
