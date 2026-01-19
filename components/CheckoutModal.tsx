import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, CreditCard, Building2, Check, Loader2, MapPin, User, Phone, ArrowRight, AlertCircle, ShieldCheck, Copy, ArrowLeft } from 'lucide-react';
import PaymentBrick from '../pages/PaymentBrick'; 

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToShop: () => void;
  total: number;
  onClearCart: () => void;
  cart: any[];
}

type PaymentMethod = 'mercadopago' | 'transfer';
type CheckoutStep = 'data' | 'payment'; // Nuevo: Controla si estamos llenando datos o pagando

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onReturnToShop, total, onClearCart, cart }) => {
  const [method, setMethod] = useState<PaymentMethod>('transfer');
  const [step, setStep] = useState<CheckoutStep>('data'); // Empezamos en "datos"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTransfer, setSuccessTransfer] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Guardamos el ID de la orden creada para pasárselo al Brick
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [createdOrderTotal, setCreatedOrderTotal] = useState<number>(0);
  const [clientId, setClientId] = useState<number | string | null>(null);

  const [isMpActive, setIsMpActive] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Bloqueo de scroll y Carga de Configuración
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchStoreConfig();
    } else {
      document.body.style.overflow = 'unset';
      setStep('data'); // Reset al cerrar
      setCreatedOrderId(null);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const fetchStoreConfig = async () => {
    try {
      setLoadingConfig(true);
      const { data } = await api.get('/api/store/auth/config');
      setIsMpActive(data.mercadopago_active);
      if (data.mercadopago_active) {
        setMethod('mercadopago');
      } else {
        setMethod('transfer');
      }
      // Si el backend devuelve el clientId, guárdalo aquí también
      if (data.clientId) setClientId(data.clientId); 

    } catch (error) {
      console.error("Error cargando configuración", error);
      setIsMpActive(false);
      setMethod('transfer');
    } finally {
      setLoadingConfig(false);
    }
  };

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dni: '', phone: '',
    street: '', number: '', city: '', zip: '', province: 'Buenos Aires'
  });

  if (!isOpen) return null;

  const discount = method === 'transfer' ? total * 0.10 : 0;
  const finalTotal = total - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyCBU = () => {
      navigator.clipboard.writeText('0070089420000012345678');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // PASO 1: CREAR LA ORDEN (Para ambos métodos)
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.firstName || !formData.street || !formData.dni) {
       setError("Por favor completa los datos de envío obligatorios.");
       setLoading(false);
       return;
    }

    try {
      const itemsLimpios = cart.map(item => ({
          id: Number(item.id),
          productId: Number(item.id), 
          title: item.name,
          name: item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          price: Number(item.price),
          currency_id: "ARS",
          description: item.cartItemId,
          picture_url: item.image,
          selectedColor: item.selectedColor, 
          selectedSize: item.selectedSize
      }));

      const orderPayload = {
        shippingAddress: formData,
        billingAddress: formData,
        paymentMethod: method,
        shippingCost: 0,
        items: itemsLimpios 
      };
      
      const orderRes = await api.post('/api/store/checkout', orderPayload);
      const { orderId, clientId: respClientId } = orderRes.data; 
      
      setCreatedOrderId(orderId);
      setCreatedOrderTotal(finalTotal);
      if (respClientId) setClientId(respClientId);

      if (method === 'mercadopago') {
        // SI ES MP: Avanzamos al paso 2 (Mostrar Brick)
        setStep('payment');
      } else {
        // SI ES TRANSFERENCIA: Mostramos éxito directo
        setSuccessTransfer(true);
        onClearCart(); 
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Error al procesar la orden");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER: PANTALLA DE ÉXITO (TRANSFERENCIA) ---
  if (successTransfer) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4 bg-stone-900/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative bg-white w-full h-full md:h-auto md:max-w-md p-6 md:p-10 text-center md:rounded shadow-2xl animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300 flex flex-col justify-center overflow-y-auto">
           <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 flex-shrink-0">
             <Check className="w-8 h-8 text-green-700" />
           </div>
           <h2 className="font-serif text-2xl text-stone-900 mb-1">¡Orden #{createdOrderId} Creada!</h2>
           <p className="text-stone-500 mb-6 text-sm">
             Reserva confirmada. Para finalizar, transfiere <b>${finalTotal.toLocaleString()}</b> a:
           </p>
           {/* ... Datos de transferencia (igual que antes) ... */}
           <div className="bg-stone-50 p-4 rounded text-left space-y-3 mb-6 border border-stone-200 shadow-sm">
              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 block">CBU</span>
                    <p className="font-mono text-stone-800 font-medium text-sm sm:text-base break-all">0070089420000012345678</p>
                </div>
                <button onClick={handleCopyCBU} className="p-2 ml-2 hover:bg-stone-200 rounded transition-colors text-stone-500 bg-white border border-stone-100 shadow-sm">
                    {copied ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 block">Alias</span>
                    <p className="font-mono text-stone-800 font-medium text-sm">ESPACIOS.AZUCAR.AR</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 block">Banco</span>
                    <p className="text-stone-800 font-medium text-sm">Banco Galicia</p>
                  </div>
              </div>
           </div>
           
           <button onClick={onReturnToShop} className="bg-stone-900 text-white px-6 py-4 w-full hover:bg-stone-800 transition-colors uppercase tracking-widest text-xs font-bold md:rounded-sm shadow-lg">Volver a la Tienda</button>
        </div>
      </div>
    );
  }

  // --- RENDER: FORMULARIO PRINCIPAL ---
  return (
    <div className="fixed inset-0 z-[90] flex items-start md:items-center justify-center md:p-0 md:p-6">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-[#fafaf9] w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] overflow-hidden rounded-t-none md:rounded shadow-2xl flex flex-col md:flex-row animate-in slide-in-from-bottom-full duration-300">
        
        {/* COLUMNA IZQUIERDA: CONTENIDO CAMBIANTE (DATOS O BRICK) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white md:border-r border-stone-200">
            <div className="p-3 pt-2 md:p-6 border-b border-stone-100 flex justify-between items-center bg-white">
               <h2 className="font-serif text-xl text-stone-900">
                 {step === 'payment' ? 'Pago Seguro' : 'Finalizar Compra'}
               </h2>
               <button onClick={onClose} className="md:hidden p-1 -mr-1 text-stone-400 hover:bg-stone-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                
                {/* 🧱 PASO 2: FORMULARIO DE PAGO (BRICK) */}
                {step === 'payment' && createdOrderId ? (
                    <div className="animate-in fade-in slide-in-from-right duration-300">
                        <button onClick={() => setStep('data')} className="text-xs text-stone-500 hover:text-stone-800 mb-4 flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" /> Volver a mis datos
                        </button>
                        
                        {/* AQUÍ INCRUSTAMOS EL BRICK */}
                        <PaymentBrick 
                            orderTotal={createdOrderTotal} 
                            orderId={createdOrderId} 
                            clientId={clientId || 7} // Fallback a 7 si falla
                        />
                    </div>
                ) : (
                    /* 📝 PASO 1: DATOS PERSONALES Y MÉTODO */
                    <>
                        {loadingConfig ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-stone-400" /></div>
                        ) : (
                            <div className={`grid gap-3 md:gap-4 ${isMpActive ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {isMpActive && (
                                    <button 
                                        type="button" 
                                        onClick={() => setMethod('mercadopago')} 
                                        className={`p-3 md:p-4 border rounded flex flex-col items-center gap-2 transition-all ${method === 'mercadopago' ? 'bg-sky-50 border-sky-200 text-sky-800 ring-1 ring-sky-200 shadow-sm' : 'border-stone-200 text-stone-500 hover:border-stone-300'}`}
                                    >
                                        <CreditCard className="w-5 h-5 md:w-6 md:h-6" />
                                        <span className="text-[10px] md:text-xs font-bold uppercase text-center">Mercado Pago</span>
                                    </button>
                                )}
                                <button 
                                    type="button" 
                                    onClick={() => setMethod('transfer')} 
                                    className={`p-3 md:p-4 border rounded flex flex-col items-center gap-2 transition-all relative ${method === 'transfer' ? 'bg-green-50 border-green-200 text-green-800 ring-1 ring-green-200 shadow-sm' : 'border-stone-200 text-stone-500 hover:border-stone-300'}`}
                                >
                                    <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-green-200 text-green-800 text-[8px] md:text-[9px] font-bold px-1.5 rounded">-10%</div>
                                    <Building2 className="w-5 h-5 md:w-6 md:h-6" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase text-center">Transferencia</span>
                                </button>
                            </div>
                        )}

                        <form id="checkout-form" onSubmit={handleCreateOrder} className="space-y-5 pb-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-stone-900 font-medium text-sm border-b border-stone-100 pb-2"><User className="w-4 h-4 text-stone-400"/> Datos Personales</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input name="firstName" required placeholder="Nombre" className="input-base" onChange={handleInputChange} />
                                    <input name="lastName" required placeholder="Apellido" className="input-base" onChange={handleInputChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input name="dni" required placeholder="DNI / CUIT" className="input-base" onChange={handleInputChange} />
                                    <input name="phone" required placeholder="Teléfono" className="input-base" onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-stone-900 font-medium text-sm border-b border-stone-100 pb-2 mt-2"><MapPin className="w-4 h-4 text-stone-400"/> Dirección de Entrega</div>
                                <div className="grid grid-cols-3 gap-3">
                                    <input name="street" required placeholder="Calle" className="input-base col-span-2" onChange={handleInputChange} />
                                    <input name="number" required placeholder="Altura" className="input-base" onChange={handleInputChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input name="city" required placeholder="Ciudad" className="input-base" onChange={handleInputChange} />
                                    <input name="zip" required placeholder="C. Postal" className="input-base" onChange={handleInputChange} />
                                </div>
                                <select name="province" className="input-base bg-white" onChange={handleInputChange}>
                                    <option value="Buenos Aires">Buenos Aires</option>
                                    <option value="CABA">CABA</option>
                                    <option value="Cordoba">Córdoba</option>
                                    <option value="Santa Fe">Santa Fe</option>
                                </select>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN (Siempre visible) */}
        <div className="w-full md:w-80 bg-stone-50 flex flex-col border-t md:border-t-0 md:border-l border-stone-200 flex-shrink-0">
           <div className="p-4 md:p-6 border-b border-stone-200 hidden md:flex justify-between items-center"><span className="font-serif text-lg">Resumen</span><button onClick={onClose} className="p-1 hover:bg-stone-200 rounded-full"><X className="w-5 h-5 text-stone-500"/></button></div>
           
           <div className="flex-1 p-4 py-2 md:p-6 space-y-2 bg-white md:bg-transparent">
              {/* Items del carrito (Miniatura) opcional si quieres mostrar qué compra */}
              <div className="space-y-1 text-sm text-stone-600">
                  <div className="flex justify-between"><span>Subtotal</span><span>${total.toLocaleString()}</span></div>
                  {method === 'transfer' && (<div className="flex justify-between text-green-700 font-medium"><span>Descuento (10%)</span><span>-${discount.toLocaleString()}</span></div>)}
                  <div className="flex justify-between"><span>Envío</span><span className="text-stone-400 italic text-xs">A convenir</span></div>
              </div>
              <div className="border-t border-stone-200 pt-3 md:pt-4"><div className="flex justify-between items-end"><span className="font-serif text-base md:text-lg text-stone-900">Total</span><span className="font-bold text-xl text-stone-900">${finalTotal.toLocaleString()}</span></div></div>
              {error && (<div className="bg-red-50 text-red-600 p-3 rounded text-xs flex items-start gap-2 animate-pulse border border-red-100"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}</div>)}
           </div>

           {/* BOTÓN PRINCIPAL (Solo visible en Paso 1) */}
           {step === 'data' && (
               <div className="p-4 md:p-6 bg-white border-t border-stone-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none z-20">
                  <button onClick={handleCreateOrder} disabled={loading || loadingConfig} className={`w-full h-14 md:h-12 flex items-center justify-center gap-2 uppercase tracking-widest text-xs font-bold text-white transition-all md:rounded-sm ${loading ? 'bg-stone-400 cursor-wait' : 'bg-stone-900 hover:bg-stone-800 shadow-md active:scale-[0.98]'}`}>
                    {loading ? (<><Loader2 className="w-4 h-4 animate-spin"/> Procesando...</>) : (<>{method === 'mercadopago' ? 'Continuar al Pago' : 'Confirmar Reserva'} <ArrowRight className="w-4 h-4"/></>)}
                  </button>
                  {method === 'mercadopago' && (<p className="text-[10px] text-center text-stone-400 mt-3 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3"/> Pagarás en el siguiente paso</p>)}
               </div>
           )}
        </div>
      </div>
      <style>{`.input-base { width: 100%; padding: 12px; font-size: 16px; border: 1px solid #e7e5e4; border-radius: 4px; outline: none; transition: all 0.2s; background-color: #fff; } .input-base:focus { border-color: #1c1917; box-shadow: 0 0 0 1px #1c1917; } @media (min-width: 768px) { .input-base { padding: 10px; font-size: 0.875rem; border-radius: 2px; } }`}</style>
    </div>
  );
};

export default CheckoutModal;