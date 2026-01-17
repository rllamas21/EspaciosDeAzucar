import React, { useState, useEffect } from 'react';
import { Plus, Heart, Image as ImageIcon } from 'lucide-react';
import { Product, ColorOption } from '../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, color?: ColorOption) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onOpenDetails?: (product: Product, color?: ColorOption) => void;
}

const normalize = (str?: string) => str ? str.toLowerCase().trim() : '';

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAdd,
  isWishlisted,
  onToggleWishlist,
  onOpenDetails
}) => {

  const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>();
  // baseImage puede ser string (URL) o null (No hay imagen)
  const [baseImage, setBaseImage] = useState<string | null>(product.image);
  const [hoverImage, setHoverImage] = useState<string | null>(
    product.images?.[1] ?? null
  );

  // Solo mostramos efecto hover si hay imagen base Y hay imagen de hover
  const showHoverEffect = baseImage && !!hoverImage;

  // 1. INICIALIZACIÓN INTELIGENTE
  useEffect(() => {
    // A. Determinamos el color inicial
    let initialColor: ColorOption | undefined = undefined;

    // Si el producto tiene colores, elegimos el PRIMERO por defecto
    if (product.colors && product.colors.length > 0) {
      initialColor = product.colors[0];
    }
    
    // Guardamos la selección (o undefined si es un zapato/sin color)
    setSelectedColor(initialColor);

    // B. Determinamos la imagen correspondiente a ese estado inicial
    if (initialColor) {
      // Si hay color seleccionado (ej. Remera Azul), buscamos su variante
      const variant = product.variants?.find(v => {
        const c = v.attributes['Color'] || v.attributes['Acabado'] || v.attributes['color'];
        return normalize(c) === normalize(initialColor.name);
      });

      if (variant?.images?.length) {
        // Variante tiene fotos -> Las usamos
        setBaseImage(variant.images[0]);
        setHoverImage(variant.images[1] ?? null);
      } else {
        // Variante NO tiene fotos -> Forzamos cuadro gris (NULL)
        setBaseImage(null);
        setHoverImage(null);
      }
    } else {
      // Si NO hay color (ej. Zapato), usamos la foto base del producto
      setBaseImage(product.image);
      setHoverImage(product.images?.[1] ?? null);
    }

  }, [product]);


  // 2. CAMBIO DE COLOR (Click manual)
  const handleColorClick = (e: React.MouseEvent, color: ColorOption) => {
    e.stopPropagation();
    setSelectedColor(color);

    const variant = product.variants?.find(v => {
      const c =
        v.attributes['Color'] ||
        v.attributes['Acabado'] ||
        v.attributes['color'];
      return normalize(c) === normalize(color.name);
    });

    if (variant?.images?.length) {
      // SI TIENE FOTOS: Las usamos
      setBaseImage(variant.images[0]);
      setHoverImage(variant.images[1] ?? null);
    } else {
      // SI NO TIENE FOTOS: Forzamos NULL para mostrar el diseño "Sin Imagen"
      setBaseImage(null);
      setHoverImage(null);
    }
  };

  const handleOpenDetails = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onOpenDetails?.(product, selectedColor);
  };

  const selectedVariant = selectedColor
  ? product.variants?.find(v => {
      const c =
        v.attributes['Color'] ||
        v.attributes['Acabado'] ||
        v.attributes['color'];
      return normalize(c) === normalize(selectedColor.name);
    })
  : product.variants?.[0];

const displayPrice = selectedVariant?.price ?? product.price;


  return (
    <div className="relative flex flex-col gap-3">

      {/* --- IMAGEN (SOLO AQUÍ ABRE MODAL) --- */}
      <div
        className="group relative aspect-[4/5] w-full overflow-hidden bg-stone-200 cursor-pointer rounded-sm"
        onClick={handleOpenDetails}
      >
        
        {/* LÓGICA DE RENDERIZADO */}
        {baseImage ? (
          // CASO A: HAY IMAGEN REAL
          <>
            <img
              src={baseImage}
              alt={product.name}
              className={`h-full w-full object-cover transition-transform duration-1000 ease-in-out ${
                !showHoverEffect ? 'group-hover:scale-110' : ''
              }`}
              loading="lazy"
            />

            {showHoverEffect && (
              <img
                src={hoverImage!}
                alt={`${product.name} vista secundaria`}
                className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-in-out scale-105"
                loading="lazy"
              />
            )}
          </>
        ) : (
          // CASO B: NO HAY IMAGEN (Estilo idéntico al Modal)
          <div className="flex flex-col items-center justify-center text-stone-400 gap-3 p-8 text-center select-none w-full h-full bg-stone-100">
            <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 opacity-50" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-sm text-stone-500">Imagen no disponible</span>
            </div>
          </div>
        )}

        {/* --- BOTONES FLOTANTES --- */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className="absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10 hover:scale-110 active:scale-95 group/heart"
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-300 drop-shadow-sm ${
                isWishlisted
                  ? 'fill-stone-900 text-stone-900'
                  : 'text-white group-hover/heart:text-stone-900'
              }`}
              strokeWidth={1.5}
            />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product, selectedColor);
          }}
          className="absolute bottom-3 right-3 h-10 w-10 md:h-12 md:w-12 bg-white/95 backdrop-blur flex items-center justify-center rounded-full text-stone-900 shadow-sm transition-all duration-300 md:opacity-0 md:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-stone-900 hover:text-white active:scale-95 z-10"
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
        </button>
      </div>

      {/* --- INFO --- */}
      <div className="flex flex-col gap-1">

        <div className="flex justify-between items-start gap-2">
          {/* NOMBRE */}
          <h3
            onClick={handleOpenDetails}
            className="text-sm md:text-base font-serif text-stone-900 leading-tight group-hover:underline decoration-stone-300 underline-offset-4 transition-all cursor-pointer"
          >
            {product.name}
          </h3>

          <span className="text-sm md:text-base font-semibold text-stone-900 tabular-nums">
            ${displayPrice.toLocaleString()}
          </span>
        </div>

        {/* CATEGORÍA */}
        <p className="text-[10px] md:text-xs text-stone-500 uppercase tracking-wider font-medium">
          {product.category}
        </p>

        {/* COLORES */}
        {product.colors?.length > 0 && (
          <div className="flex items-center gap-2 mt-2 h-6">
            <div className="flex items-center gap-2">
              {product.colors.map((color) => {
                const isSelected =
                  normalize(selectedColor?.name) === normalize(color.name);

                return (
                  <button
                    key={color.name}
                    onClick={(e) => handleColorClick(e, color)}
                    className={`w-5 h-5 rounded-full transition-all duration-200 ${
                      isSelected
                        ? 'ring-1 ring-offset-2 ring-stone-800 scale-110'
                        : 'ring-1 ring-stone-200 hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                );
              })}
            </div>

            <span className="text-xs text-stone-500 font-medium capitalize ml-1 h-4 inline-block">
              {selectedColor?.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;