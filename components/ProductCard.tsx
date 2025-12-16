import React, { useState, useEffect } from 'react';
import { Plus, Heart } from 'lucide-react';
import { Product, ColorOption } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, color?: ColorOption, finish?: any) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onOpenDetails?: (product: Product, color?: ColorOption, finish?: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAdd,
  isWishlisted,
  onToggleWishlist,
  onOpenDetails,
}) => {
  /* =========================
     COLOR (SILLÓN) — NO TOCAR
  ========================= */
  const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>(
    product.colors?.[0]
  );

  /* =========================
     FINISH (MANIJA) — NUEVO
  ========================= */
  const [selectedFinish, setSelectedFinish] = useState(
    product.finishes?.[0]
  );

  const [isHovered, setIsHovered] = useState(false);

  /* =========================
     IMÁGENES — NO TOCAR
  ========================= */
  const primaryImage = selectedColor?.image || product.image;

  const secondaryImage =
    selectedColor?.hoverImage ||
    (product.images && product.images.length > 1
      ? product.images[1]
      : null);

  /* =========================
     RESET AL CAMBIAR PRODUCTO
  ========================= */
  useEffect(() => {
    if (product.colors?.length) {
      setSelectedColor(product.colors[0]);
    }
    if (product.finishes?.length) {
      setSelectedFinish(product.finishes[0]);
    }
  }, [product]);

  return (
    <div className="group relative flex flex-col gap-3">
      {/* IMAGE */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden bg-stone-200 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() =>
          onOpenDetails?.(product, selectedColor, selectedFinish)
        }
      >
        {/* PRIMARY IMAGE */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
            isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* SECONDARY IMAGE */}
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} packshot`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Wishlist */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className="absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10 hover:scale-110 active:scale-95 bg-white/80 hover:bg-white"
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-300 drop-shadow-sm ${
                isWishlisted
                  ? 'fill-stone-900 text-stone-900'
                  : 'text-stone-600'
              }`}
              strokeWidth={1.5}
            />
          </button>
        )}

        {/* Quick add */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product, selectedColor, selectedFinish);
          }}
          className="absolute bottom-3 right-3 h-10 w-10 md:h-12 md:w-12 bg-white/95 backdrop-blur flex items-center justify-center rounded-full text-stone-900 shadow-sm transition-all duration-300 md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-stone-900 hover:text-white active:scale-95 z-10"
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* INFO */}
      <div
        className="flex flex-col gap-1 cursor-pointer"
        onClick={() =>
          onOpenDetails?.(product, selectedColor, selectedFinish)
        }
      >
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm md:text-base font-serif text-stone-900 leading-tight group-hover:underline decoration-stone-300 underline-offset-4 transition-all">
            {product.name}
          </h3>
          <span className="text-sm md:text-base font-semibold text-stone-900 tabular-nums">
            ${product.price.toLocaleString()}
          </span>
        </div>

        {/* CATEGORY */}
        <p
          className="text-[10px] md:text-xs text-stone-500 uppercase tracking-wider font-medium cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {product.category}
        </p>

        {/* COLOR SWATCHES (SILLÓN) */}
        {product.colors && (
          <div className="flex items-center gap-2 mt-2 h-6">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={`w-4 h-4 rounded-full transition-all ${
                  selectedColor?.name === color.name
                    ? 'ring-1 ring-offset-2 ring-stone-800 scale-110'
                    : 'hover:scale-110'
                }`}
                style={{
                  backgroundColor: color.hex,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                }}
                aria-label={`Color ${color.name}`}
              />
            ))}
            <span className="text-[10px] text-stone-400 ml-1 cursor-default">
              {selectedColor?.name}
            </span>
          </div>
        )}

        {/* FINISH SWATCHES (MANIJA) */}
        {product.finishes && (
          <div className="flex items-center gap-2 mt-1 h-6">
            {product.finishes.map((finish: any) => (
              <button
                key={finish.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFinish(finish);
                }}
                className={`w-4 h-4 rounded-full transition-all ${
                  selectedFinish?.name === finish.name
                    ? 'ring-1 ring-offset-2 ring-stone-800 scale-110'
                    : 'hover:scale-110'
                }`}
                style={{
                  backgroundColor: finish.hex,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
                }}
                aria-label={`Manija ${finish.name}`}
              />
            ))}
            <span className="text-[10px] text-stone-400 ml-1 cursor-default">
              {selectedFinish?.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
