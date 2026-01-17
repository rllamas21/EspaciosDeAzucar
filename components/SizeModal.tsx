import React, { useMemo, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product, ColorOption } from '../types';

interface SizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  preSelectedColor: ColorOption | null;
  onConfirm: (size: string) => void;
}

const normalize = (str: string | undefined | null) => str ? String(str).toLowerCase().trim() : '';

const SizeModal: React.FC<SizeModalProps> = ({ isOpen, onClose, product, preSelectedColor, onConfirm }) => {
  
  const [tempSelectedSize, setTempSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTempSelectedSize(null);
    }
  }, [isOpen, product]);

  const availableSizes = useMemo(() => {
    if (!product) return [];
    if (!preSelectedColor) return product.sizes || [];

    const sizesForThisColor = new Set<string>();

    if (product.variants) {
      product.variants.forEach(variant => {
        const colorAttr = variant.attributes['Color'] || variant.attributes['Acabado'] || variant.attributes['color'];
        
        if (normalize(colorAttr) === normalize(preSelectedColor.name)) {
          const sizeAttr = variant.attributes['Talla'] || variant.attributes['Tamaño'] || variant.attributes['Size'] || variant.attributes['Medida'];
          if (sizeAttr) sizesForThisColor.add(sizeAttr);
        }
      });
    }

    return (product.sizes || []).filter(size => 
      Array.from(sizesForThisColor).some(s => normalize(s) === normalize(size))
    );
  }, [product, preSelectedColor]);

  const handleConfirm = () => {
    if (tempSelectedSize) {
      onConfirm(tempSelectedSize);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[#fafaf9] w-full max-w-sm rounded-xl shadow-2xl p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="font-serif text-xl text-stone-900 mb-4">Selecciona Tamaño</h3>
          
          {/* Cabecera del Producto */}
          <div className="flex items-center justify-center gap-3 text-stone-700 font-medium pb-6 border-b border-stone-200 mb-6">
            <span>{product.name}</span>
            {preSelectedColor && (
              <div 
                title={preSelectedColor.name}
                className={`w-5 h-5 rounded-full ring-1 ring-stone-900/10 shadow-sm flex-shrink-0 ${
                   ['blanco', 'white'].includes(normalize(preSelectedColor.name)) ? 'bg-white' : ''
                }`}
                style={{ backgroundColor: preSelectedColor.hex }}
              />
            )}
          </div>

          {/* LISTA DE TALLAS - DISEÑO SUAVE */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {availableSizes.length > 0 ? (
              availableSizes.map((size) => {
                const isSelected = tempSelectedSize === size;
                
                return (
                  <button
                    key={size}
                    onClick={() => setTempSelectedSize(size)}
                    // AQUÍ ESTÁ EL CAMBIO: Agregué 'uppercase' para que siempre salga XXL
                    className={`
                      h-12 w-full rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 uppercase
                      ${isSelected 
                        ? 'bg-stone-200 text-stone-900 ring-1 ring-stone-300 shadow-inner scale-[0.98]' 
                        : 'bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700 ring-1 ring-stone-100 shadow-sm'
                      }
                    `}
                  >
                    {size}
                  </button>
                );
              })
            ) : (
              <div className="col-span-2 py-6 text-stone-400 text-sm flex flex-col items-center gap-2 bg-stone-50 rounded border border-dashed border-stone-200">
                <span>No hay tallas disponibles.</span>
              </div>
            )}
          </div>

          {/* BOTÓN DE CONFIRMACIÓN */}
          <button
            onClick={handleConfirm}
            disabled={!tempSelectedSize}
            className={`w-full py-4 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg
              ${tempSelectedSize 
                ? 'bg-stone-900 text-white hover:bg-stone-800 hover:shadow-xl transform hover:-translate-y-0.5' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
              }
            `}
          >
            Agregar al Carrito
          </button>

        </div>
      </div>
    </div>
  );
};

export default SizeModal;