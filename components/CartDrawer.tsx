import React, { useMemo, useState, useEffect } from 'react'; 
import { X, Minus, Plus, ArrowRight, Trash2, Image as ImageIcon, Tag } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  t: (key: string) => string;
  onCheckout?: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, t, onCheckout }) => {
  
  // --- LÓGICA DE CUPÓN ---
  const [showCouponInput, setShowCouponInput] = useState(false); // Nuevo estado para ocultar/mostrar
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';  
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]); 

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  
  // LÓGICA DE ENVÍO (Muestra 'A calcular' por defecto si no es gratis por monto)
  // Puedes cambiar 50000 por tu monto mínimo para envío gratis
  const isFreeShipping = subtotal > 50000; 
  const shippingCost = isFreeShipping ? 0 : null; // null significa "A calcular"

  // Si aplicaron cupón de ENVIO gratis
  let finalShipping = shippingCost;
  if (couponCode.toUpperCase() === 'ENVIO' && discountAmount > 0) {
      finalShipping = 0;
  }

  // El total solo suma envío si es un número (si es null/'A calcular', no lo suma aún)
  const finalTotal = Math.max(0, subtotal + (typeof finalShipping === 'number' ? finalShipping : 0) - discountAmount);

  const handleApplyCoupon = () => {
    setCouponMessage(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    // SIMULACIÓN (ESTO LUEGO VENDRÁ DEL BACKEND)
    if (code === 'PROMO10') {
        const discount = subtotal * 0.10; 
        setDiscountAmount(discount);
        setCouponMessage({ type: 'success', text: '¡10% OFF aplicado!' });
    } else if (code === 'ENVIO') {
        setDiscountAmount(1); // Marcador simbólico para activar envío gratis
        setCouponMessage({ type: 'success', text: '¡Envío gratis aplicado!' });
    } else {
        setDiscountAmount(0);
        setCouponMessage({ type: 'error', text: 'Cupón no válido' });
    }
  };
  // ----------------------

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[70] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white z-[80] shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-serif text-stone-900">{t('cart_title')} ({cart.reduce((a,c) => a + c.quantity, 0)})</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
              <span className="text-4xl opacity-20 font-serif">{t('cart_empty')}</span>
              <p className="text-sm uppercase tracking-widest">{t('cart_empty_sub')}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="flex gap-4 group/item">
                
                {/* 1. IMAGEN + CÍRCULO EN ESQUINA (DISEÑO ORIGINAL) */}
                <div className="relative w-20 h-24 bg-stone-100 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-50">
                        <ImageIcon className="w-6 h-6 text-stone-300 opacity-50"/>
                    </div>
                  )}
                  
                  {/* Círculo de color flotante */}
                  {item.selectedColor && (
                    <div 
                      className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm z-10" 
                      style={{ backgroundColor: item.selectedColor.hex }}
                      title={item.selectedColor.name}
                    />
                  )}
                </div>

                {/* 2. INFO */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-stone-900 font-serif leading-tight pr-2">{item.name}</h3>
                      <div className="flex flex-col items-end">
                        <p className="text-sm tabular-nums font-semibold">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Variantes (Talla/Medida) - Sin Categoría */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.selectedSize && (
                        <span className="text-[10px] text-stone-600 font-medium border border-stone-200 px-1 rounded bg-stone-50 uppercase">{item.selectedSize}</span>
                      )}
                      {/* El color ya está en la foto, pero si quieres texto también, descomenta esto:
                      {item.selectedColor && (
                          <span className="text-[10px] text-stone-400 capitalize">{item.selectedColor.name}</span>
                      )} 
                      */}
                    </div>
                  </div>

                  {/* Controles Cantidad y Eliminar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-stone-200 rounded-full px-2 h-7">
                      <button 
                        onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                        className="p-1 hover:text-stone-900 text-stone-400"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-medium w-6 text-center tabular-nums">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                        className="p-1 hover:text-stone-900 text-stone-400"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="p-1.5 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title={t('cart_remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="bg-stone-50 p-6 space-y-6 border-t border-stone-200">
            
            {/* --- SECCIÓN CUPÓN (PREGUNTA OCULTA) --- */}
            <div>
                {!showCouponInput && discountAmount === 0 ? (
                    <button 
                        onClick={() => setShowCouponInput(true)}
                        className="text-xs font-bold text-stone-500 hover:text-stone-900 underline decoration-stone-300 underline-offset-4 transition-colors flex items-center gap-2"
                    >
                        <Tag className="w-3 h-3" />
                        ¿Tenés un cupón de descuento?
                    </button>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-[10px] uppercase tracking-widest text-stone-500 font-bold flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Cupón
                            </label>
                            {discountAmount === 0 && (
                                <button onClick={() => setShowCouponInput(false)} className="text-[10px] text-stone-400 hover:text-stone-600 underline">
                                    Cancelar
                                </button>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="CÓDIGO"
                                className="flex-1 border border-stone-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-stone-900 uppercase placeholder:normal-case font-medium"
                                disabled={discountAmount > 0}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            />
                            <button 
                                onClick={handleApplyCoupon}
                                disabled={!couponCode.trim() || discountAmount > 0}
                                className="px-4 py-2 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm transition-colors"
                            >
                                {discountAmount > 0 ? 'LISTO' : 'APLICAR'}
                            </button>
                        </div>
                        {couponMessage && (
                            <p className={`text-[10px] mt-2 font-medium animate-pulse ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {couponMessage.text}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-4 border-t border-stone-200/50">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              
              {/* Descuento */}
              {discountAmount > 0 && (
                 <div className="flex justify-between text-sm text-green-700 font-medium">
                   <span>Descuento</span>
                   <span>-${discountAmount.toLocaleString()}</span>
                 </div>
              )}

              {/* Envío EN ESPAÑOL */}
              <div className="flex justify-between text-sm text-stone-500">
                <span>Envío</span>
                {/* Lógica: Si es 0 -> Gratis. Si es null -> A consultar. Si es numero -> Precio */}
                <span>
                    {finalShipping === 0 
                        ? 'Gratis' 
                        : finalShipping === null 
                            ? 'A consultar' 
                            : `$${finalShipping}`
                    }
                </span>
              </div>
              
              {/* Total EN ESPAÑOL */}
              <div className="flex justify-between text-lg font-serif font-medium text-stone-900 pt-3 border-t border-stone-200">
                <span>Total</span>
                <span className="tabular-nums">${finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Botón Checkout EN ESPAÑOL */}
            <button 
              onClick={onCheckout}
              className="w-full bg-stone-900 text-white h-14 flex items-center justify-between px-6 hover:bg-stone-800 transition-colors group shadow-lg"
            >
              <span className="font-medium tracking-wide text-xs uppercase">FINALIZAR COMPRA</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;