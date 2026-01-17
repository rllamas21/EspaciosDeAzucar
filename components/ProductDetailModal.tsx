import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Minus, Plus, ChevronLeft, ChevronRight, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Product, ColorOption, Variant } from '../types';


interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color?: ColorOption, size?: string, quantity?: number, variant?: Variant) => void;
  initialColor?: ColorOption; 
}

// 🔧 FUNCIÓN DE NORMALIZACIÓN
const normalize = (str: string | undefined | null) => {
  return str ? String(str).toLowerCase().trim() : '';
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart, initialColor }) => {
  // Estados de selección
  const [selectedColor, setSelectedColor] = useState<ColorOption | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'care'>('description');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- LÓGICA DE NEGOCIO ROBUSTA ---
  const currentVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    
    return product.variants.find(v => {
      const colorAttr = v.attributes['Color'] || v.attributes['Acabado'] || v.attributes['color'];
      const colorMatch = selectedColor ? normalize(colorAttr) === normalize(selectedColor.name) : true;
      
      const sizeAttr = v.attributes['Talla'] || v.attributes['Tamaño'] || v.attributes['Size'] || v.attributes['Medida'];
      const sizeMatch = selectedSize ? normalize(sizeAttr) === normalize(selectedSize) : true;

      return colorMatch && sizeMatch;
    });
  }, [product, selectedColor, selectedSize]);

// --- 1. CONSTRUCCIÓN DE GALERÍA (ESTRICTA) ---
  const galleryImages = useMemo(() => {
    if (currentVariant) {
       if (currentVariant.images && currentVariant.images.length > 0) {
         return currentVariant.images;
       }
       return [];
    }
    return product?.images || [];
  }, [product, currentVariant]);

  // --- BLOQUEO DE SCROLL ---
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Resetear índice al cambiar galería
  useEffect(() => {
    setActiveImageIndex(0);
  }, [galleryImages]);

  // --- PRE-CARGA DE IMÁGENES ---
  useEffect(() => {
    if (galleryImages.length > 0) {
      galleryImages.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [galleryImages]);

 // --- 2. INICIALIZACIÓN INTELIGENTE ---
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setErrorMsg(null);

      // CASO A: Color inicial
      if (initialColor) {
        const colorObj = product.colors?.find(c => normalize(c.name) === normalize(initialColor.name));
        if (colorObj) {
          setSelectedColor(colorObj);
          setSelectedSize(undefined);
          return;
        }
      }
      
      // CASO B: Default por stock
      let targetVariant: Variant | undefined;
      if (product.variants && product.variants.length > 0) {
        targetVariant = product.variants.find(v => v.stock > 0) || product.variants[0];
      }

      if (targetVariant) {
        const variantColorName = targetVariant.attributes['Color'] || targetVariant.attributes['Acabado'] || targetVariant.attributes['color'];
        const colorObj = product.colors?.find(c => normalize(c.name) === normalize(variantColorName));
        setSelectedColor(colorObj); 
        setSelectedSize(undefined);
      } else {
        if (product.colors && product.colors.length > 0) setSelectedColor(product.colors[0]);
      }
    }
  }, [product, initialColor]);

  // Disponibilidad de tallas
  const availableSizesForColor = useMemo(() => {
    if (!product || !product.variants || !selectedColor) return product?.sizes || [];
    const sizes = new Set<string>();
    
    product.variants.forEach(v => {
      const colorAttr = v.attributes['Color'] || v.attributes['Acabado'] || v.attributes['color'];
      if (normalize(colorAttr) === normalize(selectedColor.name)) {
         const sizeAttr = v.attributes['Talla'] || v.attributes['Tamaño'] || v.attributes['Size'] || v.attributes['Medida'];
         if (sizeAttr) sizes.add(sizeAttr);
      }
    });
    
    return product.sizes ? product.sizes.filter(s => 
        Array.from(sizes).some(sizeFound => normalize(sizeFound) === normalize(s))
    ) : [];
  }, [product, selectedColor]);

  // Stock Check
  const isSizeOutOfStock = (sizeToCheck: string) => {
    if (!product || !product.variants || !selectedColor) return false;
    const variant = product.variants.find(v => {
      const colorAttr = v.attributes['Color'] || v.attributes['Acabado'] || v.attributes['color'];
      const sizeAttr = v.attributes['Talla'] || v.attributes['Tamaño'] || v.attributes['Size'] || v.attributes['Medida'];
      return normalize(colorAttr) === normalize(selectedColor.name) && normalize(sizeAttr) === normalize(sizeToCheck);
    });
    return variant ? variant.stock <= 0 : false;
  };

  const displayPrice = currentVariant ? Number(currentVariant.price) : product?.price || 0;
  const maxStock = currentVariant ? currentVariant.stock : (product?.stock || 0);
  const isOutOfStock = currentVariant ? currentVariant.stock === 0 : (product?.stock === 0);

  // --- CÁLCULO DE DESCUENTO ---
  const discountPrice = displayPrice * 0.90; // 10% de descuento

  const handleNextImage = () => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  const handlePrevImage = () => setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  // --- LÓGICA SWIPE ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNextImage();
    if (isRightSwipe) handlePrevImage();
  };

  const handleAddToCart = () => {
    setErrorMsg(null);
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setErrorMsg("Por favor selecciona una medida.");
      return;
    }
    if (isOutOfStock) return;
    if (quantity > maxStock) {
      setErrorMsg(`Solo quedan ${maxStock} unidades disponibles.`);
      return;
    }
    onAddToCart(product!, selectedColor, selectedSize, quantity, currentVariant || undefined);
    onClose();
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[80] flex md:items-center justify-center overflow-y-auto bg-stone-900/60 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose} />
      
      {/* 1. CONTENEDOR PRINCIPAL */}
      <div className="relative bg-[#fafaf9] w-full max-w-6xl h-full md:h-[70vh] md:rounded-lg shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300 pointer-events-auto overflow-y-auto md:overflow-hidden">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-white/50 backdrop-blur-md rounded-full text-stone-900 hover:bg-stone-900 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* IMAGEN */}
        <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-full relative bg-stone-200 flex-shrink-0 group overflow-hidden touch-pan-y">
           {galleryImages.length > 0 ? (
             <img 
               src={galleryImages[activeImageIndex]} 
               alt={product.name} 
               className="w-full h-full object-cover animate-in fade-in duration-500"
             />
           ) : (
             <div className="flex flex-col items-center justify-center text-stone-400 gap-3 p-8 text-center select-none w-full h-full">
               <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center">
                 <ImageIcon className="w-8 h-8 opacity-50" />
               </div>
               <div className="flex flex-col gap-1">
                 <span className="font-medium text-sm text-stone-500">Imagen no disponible</span>
                 <span className="text-xs text-stone-400">para esta variante seleccionada</span>
               </div>
             </div>
           )}
           
           {galleryImages.length > 1 && (
             <>
               <button onClick={handlePrevImage} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <button onClick={handleNextImage} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                 <ChevronRight className="w-5 h-5" />
               </button>
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                 {galleryImages.map((_, idx) => (
                   <button
                     key={idx}
                     onClick={() => setActiveImageIndex(idx)}
                     className={`w-2 h-2 rounded-full transition-all shadow-sm ${activeImageIndex === idx ? 'bg-white w-4' : 'bg-white/50'}`}
                   />
                 ))}
               </div>
             </>
           )}
        </div>

        {/* --- COLUMNA DERECHA: INFORMACIÓN --- */}
        <div className="w-full md:w-1/2 flex flex-col md:h-auto md:overflow-hidden bg-[#fafaf9]">
          <div className="p-6 md:p-10 pb-0 flex-shrink-0">
             <span className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium block mb-2">{product.category}</span>
             <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-2 leading-tight">{product.name}</h2>
             
             {/* PRECIO + TEXTO DESCUENTO (SOLO LETRAS) */}
             <div className="flex flex-wrap items-center gap-3 mb-6">
                <p className="text-xl font-medium text-stone-900">${displayPrice.toLocaleString()}</p>
                
                {/* Texto limpio sin recuadro */}
                <span className="text-green-700 text-[10px] font-bold uppercase tracking-widest">
                   10% OFF con Transferencia
                </span>
             </div>
             
             <div className="flex flex-col gap-6 pb-2 md:pb-0">
                
                {/* 1. SELECTOR COLOR */}
                {product.colors && product.colors.length > 0 && (
                  <div className="flex items-center gap-4 h-8">
                    <span className="text-xs uppercase tracking-widest text-stone-400 w-16 flex-shrink-0">Acabado:</span>
                    <div className="flex gap-3 items-center">
                      {product.colors.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => {
                              setSelectedColor(c);
                              setSelectedSize(undefined); 
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                              normalize(selectedColor?.name) === normalize(c.name)
                                ? 'ring-1 ring-stone-900 shadow-md' 
                                : 'ring-1 ring-stone-200 hover:ring-stone-300' 
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          >
                            {normalize(selectedColor?.name) === normalize(c.name) && (
                              <Check className={`w-3 h-3 ${['negro', 'carbón', 'black'].includes(normalize(c.name)) ? 'text-white' : 'text-stone-900'}`} strokeWidth={2} />
                            )}
                          </button>
                      ))}
                    </div>
                    <span className="text-sm text-stone-600 ml-2 animate-in fade-in">{selectedColor?.name}</span>
                  </div>
                )}

                {/* 2. SELECTOR TALLA */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 min-h-[2rem]">
                      <span className={`text-xs uppercase tracking-widest w-16 flex-shrink-0 ${errorMsg?.includes('medida') ? 'text-red-600 font-bold' : 'text-stone-400'}`}>
                      Medida:
                      </span>
                      <div className="flex flex-wrap gap-2 items-center">
                        {product.sizes.map((s) => {
                          const isAvailableForColor = availableSizesForColor.includes(s);
                          if (!isAvailableForColor) return null;

                          const outOfStock = isSizeOutOfStock(s);

                          return (
                            <button
                              key={s}
                              onClick={() => {
                                if (!outOfStock) {
                                  setSelectedSize(s);
                                  setErrorMsg(null);
                                }
                              }}
                              disabled={outOfStock}
                              className={`h-8 px-3 text-xs font-medium border rounded transition-all relative flex items-center justify-center uppercase ${
                                normalize(selectedSize) === normalize(s)
                                  ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                                  : outOfStock
                                    ? 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed decoration-stone-300'
                                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:shadow-sm'
                              }`}
                            >
                              {s}
                              {outOfStock && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-[1px] bg-stone-300 rotate-[-15deg]"></div>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 3. BOTÓN AGREGAR E INVENTARIO */}
                <div className="flex flex-col gap-2 mt-4">
                  <div className="text-xs">
                     {isOutOfStock ? (
                       <span className="text-red-700 font-medium">No disponible por el momento.</span>
                     ) : (
                       <span className="text-stone-500">
                         Stock disponible: <span className="font-bold text-stone-900">{maxStock}</span>
                       </span>
                     )}
                  </div>

                  <div className="flex items-stretch gap-3 h-12">
                      <div className={`flex items-center border border-stone-200 rounded w-32 flex-shrink-0 bg-white ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                         <button 
                           onClick={() => setQuantity(Math.max(1, quantity - 1))}
                           className="w-10 h-full flex items-center justify-center text-stone-500 hover:bg-stone-50"
                         >
                           <Minus className="w-4 h-4" />
                         </button>
                         <span className="flex-1 text-center font-medium text-stone-900 tabular-nums select-none">
                           {quantity}
                         </span>
                         <button 
                           onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                           className="w-10 h-full flex items-center justify-center text-stone-500 hover:bg-stone-50"
                         >
                           <Plus className="w-4 h-4" />
                         </button>
                      </div>

                      <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-1 rounded flex items-center justify-center uppercase tracking-widest text-xs font-bold transition-colors shadow-sm ${
                          isOutOfStock 
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : 'bg-stone-900 text-white hover:bg-stone-800'
                        }`}
                      >
                        {isOutOfStock 
                          ? 'AGOTADO' 
                          : `AGREGAR — $${(displayPrice * quantity).toLocaleString()}`
                        }
                      </button>
                   </div>
                   
                   {errorMsg && (
                     <div className="flex items-center gap-2 text-red-600 text-xs mt-1 font-medium animate-pulse">
                       <AlertCircle className="w-3 h-3" />
                       <span>{errorMsg}</span>
                     </div>
                   )}
                </div>
             </div> 
          </div> 
       
          {/* DESCRIPCIÓN */}
          <div className="flex-1 md:overflow-y-auto p-6 md:px-10 md:pb-10 md:pt-0 pt-0 pb-10">
              <div className="border-b border-stone-200 sticky top-0 bg-[#fafaf9] pt-2 md:pt-0 z-10 mb-4">
                  <h3 className="text-xs uppercase tracking-widest pb-3 border-b-2 border-stone-900 inline-block text-stone-900">
                    Descripción
                  </h3>
              </div>

              <div className="min-h-[100px]">
                <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
               {(currentVariant as any)?.description || product.description || "Sin descripción disponible para este producto."}
               </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;