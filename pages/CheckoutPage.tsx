import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, Loader2, AlertCircle, Copy, Check, UploadCloud, Building2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import AddressSelector from '../components/AddressSelector';
// ELIMINADO: import PaymentBrick... (Ya no se usa)
import api from '../lib/api';
import { CartItem, Address } from '../types';

interface CheckoutPageProps {
  cart: CartItem[];
  total: number;
  onReturnToShop: () => void;
}

type CheckoutStep = 'shipping' | 'payment';
type PaymentMethodType = 'mercadopago' | 'transfer' | null;

// DATOS BANCARIOS MOCK
const BANK_DETAILS = {
  bank: "Banco Santander",
  owner: "Espacios de Azúcar S.A.",
  cbu: "0720000000000000000022",
  alias: "ESPACIOS.AZUCAR.MP",
  cuit: "30-12345678-9"
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, total, onReturnToShop }) => {
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  
  // UX Móvil: Mostrar/Ocultar resumen
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Estados de Pago
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // NUEVO ESTADO PARA REDIRECCIÓN
  
  // Datos tras crear la orden (MP)
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | string | null>(null);
  
  // Estados Transferencia
  const [transferFile, setTransferFile] = useState<File | null>(null);
  const [isTransferSuccess, setIsTransferSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Lógica de Descuento (10% si es transferencia)
  const discountAmount = paymentMethod === 'transfer' ? total * 0.10 : 0;
  const finalTotal = total - discountAmount;

  // Efecto para cuenta regresiva en éxito de transferencia
  useEffect(() => {
    if (isTransferSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isTransferSuccess && countdown === 0) {
      onReturnToShop();
    }
  }, [isTransferSuccess, countdown, onReturnToShop]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // --- NUEVA FUNCIÓN PARA REDIRIGIR A MERCADO PAGO ---
  const handleMercadoPagoRedirect = async () => {
    if (!createdOrderId) return;
    
    setIsRedirecting(true);
    try {
      // Pedimos al backend que cree la "Preferencia" (el link de pago)
      // NOTA: Tu backend debe tener esta ruta habilitada.
      const { data } = await api.post('/api/store/checkout/preference', { orderId: createdOrderId })


      // Si recibimos el link (init_point), nos vamos a la web de MP
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        console.error("No se recibió el link de pago");
        setError("Error al conectar con Mercado Pago. Intenta nuevamente.");
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("Error iniciando Checkout Pro:", error);
      setError("Hubo un problema al generar el link de pago.");
      setIsRedirecting(false);
    }
  };

  const handleConfirmShipping = async () => {
    if (!selectedAddress) {
      setError("Por favor selecciona una dirección de envío.");
      return;
    }
    setLoadingOrder(true);
    setError(null);

    try {
      const itemsLimpios = cart.map(item => ({
  productId: Number(item.id),                
  variantId: Number(item.selectedVariantId),  
  quantity: Number(item.quantity),
}));


      const orderPayload = {
        shippingAddress: {
          recipient_name: selectedAddress.recipient_name, 
          firstName: selectedAddress.recipient_name.split(' ')[0], 
          lastName: selectedAddress.recipient_name.split(' ').slice(1).join(' ') || '',
          
          dni: selectedAddress.dni || '', 
          phone: selectedAddress.phone,
          street: selectedAddress.street,
          number: selectedAddress.number,
          floor_apt: selectedAddress.floor_apt || '', 
          city: selectedAddress.city,
          zip: selectedAddress.zip_code, 
          province: selectedAddress.province
        },
        billingAddress: {}, 
        paymentMethod: paymentMethod || 'mercadopago',
        shippingCost: 0, 
        items: itemsLimpios,
        total: finalTotal
      };

      const { data } = await api.post('/api/store/checkout', orderPayload);
      
      setCreatedOrderId(data.orderId);
      if (data.clientId) setClientId(data.clientId);
      
      setStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' }); 

    } catch (err: any) {
      console.error("Error creando orden:", err);
      setError(err.response?.data?.error || "Error al procesar la orden.");
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleConfirmTransfer = () => {
    if (!transferFile) {
      alert("Por favor adjunta el comprobante.");
      return;
    }
    setIsTransferSuccess(true);
  };

  // --- COMPONENTE INTERNO DE RESUMEN ---
  const OrderSummaryContent = () => (
    <>
      <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 mb-6 scrollbar-thin scrollbar-thumb-stone-200">
        {cart.map((item) => (
          <div key={item.cartItemId} className="flex gap-3 text-sm">
            <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden flex-shrink-0 relative">
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                <div className="absolute -top-0 -right-0 bg-stone-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-bl font-bold">
                  {item.quantity}
                </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-stone-800 line-clamp-1">{item.name}</p>
              <p className="text-stone-400 text-xs">
                  {item.selectedColor?.name} {item.selectedSize && `• ${item.selectedSize}`}
              </p>
            </div>
            <div className="font-medium text-stone-900">
              ${(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-100 pt-4 space-y-2 text-sm text-stone-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${total.toLocaleString()}</span>
        </div>
        
        {paymentMethod === 'transfer' && (
          <div className="flex justify-between text-green-700 font-medium animate-in slide-in-from-left-2">
            <span>Descuento Transferencia (10%)</span>
            <span>-${discountAmount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Envío</span>
          <span className="text-stone-400 italic">A consultar</span>
        </div>
      </div>
      
      <div className="border-t border-stone-200 pt-4 mt-4 flex justify-between items-end">
        <span className="font-serif text-lg text-stone-800">Total</span>
        <span className="font-bold text-2xl text-stone-900 animate-pulse-once">
          ${finalTotal.toLocaleString()}
        </span>
      </div>
    </>
  );

  // PANTALLA DE ÉXITO DE TRANSFERENCIA
  if (isTransferSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-stone-100 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-serif text-2xl text-stone-900 mb-2">¡Transferencia Informada!</h2>
          <p className="text-stone-500 mb-6 text-sm leading-relaxed">
            Nuestro equipo validará tu comprobante en breve. Te enviaremos la confirmación a tu correo electrónico registrado.
          </p>
          <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-8">
            Redirigiendo en {countdown}s...
          </div>
          <button onClick={onReturnToShop} className="w-full bg-stone-900 text-white py-3 rounded text-sm font-bold uppercase tracking-wider hover:bg-stone-800">
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20">
      
      {/* HEADER */}
      <header className="bg-white border-b border-stone-200 py-4 px-6 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={onReturnToShop} className="text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Volver a la tienda</span>
          </button>
          <div className="flex items-center gap-2 text-stone-900">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="font-serif font-bold text-lg">Pago Seguro</span>
          </div>
          <div className="w-4 sm:hidden"></div>
        </div>
      </header>

      {/* --- RESUMEN MÓVIL --- */}
      <div className="lg:hidden bg-stone-50 border-b border-stone-200">
        <button 
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full px-4 py-4 flex justify-between items-center bg-stone-100/50"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <ShoppingBag className="w-4 h-4" />
            <span>{showMobileSummary ? 'Ocultar' : 'Ver'} resumen del pedido</span>
            {showMobileSummary ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
          </div>
          <span className="font-bold text-stone-900">${finalTotal.toLocaleString()}</span>
        </button>
        
        {showMobileSummary && (
          <div className="p-4 bg-white border-t border-stone-200 animate-in slide-in-from-top-2">
            <OrderSummaryContent />
          </div>
        )}
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA (Pasos) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PASO 1: ENVÍO */}
          <div className={`bg-white p-6 md:p-8 rounded-lg shadow-sm border border-stone-100 transition-opacity ${step === 'payment' ? 'opacity-100' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 'shipping' ? 'bg-stone-900 text-white' : 'bg-green-100 text-green-700'}`}>
                {step === 'payment' ? '✓' : '1'}
              </div>
              <h2 className="font-serif text-xl text-stone-800">Dirección de Envío</h2>
            </div>

            <div className={step === 'payment' ? 'hidden' : 'block animate-in fade-in'}>
              <AddressSelector 
                onSelect={(addr) => { setSelectedAddress(addr); setError(null); }} 
                selectedAddressId={selectedAddress?.id}
              />
              
              {error && (
                <div className="mt-4 bg-red-50 text-red-600 p-3 rounded flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleConfirmShipping}
                  disabled={loadingOrder || !selectedAddress}
                  className="bg-stone-900 text-white px-8 py-3 rounded hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-bold text-xs uppercase tracking-widest flex items-center gap-2 w-full md:w-auto justify-center"
                >
                  {loadingOrder ? <Loader2 className="w-4 h-4 animate-spin"/> : 'CONTINUAR AL PAGO'}
                </button>
              </div>
            </div>

            {step === 'payment' && selectedAddress && (
              <div className="ml-0 md:ml-11 bg-stone-50 border border-stone-200 rounded p-4 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <div className="text-sm text-stone-600">
                  <p className="font-bold text-stone-900">{selectedAddress.alias} <span className="font-normal text-stone-500">({selectedAddress.recipient_name})</span></p>
                  <p>{selectedAddress.street} {selectedAddress.number}, {selectedAddress.city}</p>
                  <p className="text-xs mt-1">{selectedAddress.province} - {selectedAddress.zip_code}</p>
                </div>
                <button 
                  onClick={() => setStep('shipping')} 
                  className="text-stone-500 hover:text-stone-900 text-xs font-bold uppercase underline decoration-stone-300 underline-offset-4 px-2 py-1"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* PASO 2: PAGO */}
          <div 
             className={`bg-white p-6 md:p-8 rounded-lg transition-all ${step === 'shipping' ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}
             style={{ border: '1px solid #e7e5e4', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 'shipping' ? 'bg-stone-200 text-stone-500' : 'bg-stone-900 text-white'}`}>
                2
              </div>
              <h2 className="font-serif text-xl text-stone-800">Método de Pago</h2>
            </div>

            {step === 'payment' && (
                <div className="ml-0 md:ml-11 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* TABS DE SELECCIÓN */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                   <button onClick={() => { setPaymentMethod('mercadopago'); handleMercadoPagoRedirect(); }} disabled={!createdOrderId || isRedirecting} className="border border-stone-900 bg-stone-50 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed">
  {isRedirecting ? (
    <Loader2 className="w-5 h-5 animate-spin text-stone-700" />
  ) : (
    <img src="/mercadonegro.png" alt="Mercado Pago" className="h-6 w-auto object-contain" />
  )}
</button>


                    <button 
                      onClick={() => setPaymentMethod('transfer')}
                      className={`border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden ${paymentMethod === 'transfer' ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900 text-stone-900' : 'border-stone-200 text-stone-400 hover:border-stone-400'}`}
                    >
                      <Building2 className="w-6 h-6" />
                      <span className="text-xs font-bold uppercase tracking-wider">Transferencia</span>
                      <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        -10% OFF
                      </div>
                    </button>
                  </div>

                  {/* OPCIÓN B: TRANSFERENCIA */}
                  {paymentMethod === 'transfer' && (
                    <div className="space-y-6 animate-in fade-in">
                      <div className="bg-stone-50 p-6 rounded border border-stone-200">
                        <h4 className="font-serif text-lg text-stone-800 mb-4">Datos Bancarios</h4>
                        
                        <div className="space-y-4">
                           {/* CBU */}
                           <div className="bg-white border border-stone-200 p-3 rounded flex justify-between items-center group">
                             <div>
                               <span className="text-[10px] uppercase text-stone-400 font-bold tracking-wider block mb-1">CBU / CVU</span>
                               <span className="font-mono text-stone-800 text-sm md:text-base break-all">{BANK_DETAILS.cbu}</span>
                             </div>
                             <button onClick={() => handleCopy(BANK_DETAILS.cbu, 'cbu')} className="p-2 text-stone-400 hover:text-stone-900 relative">
                               {copiedField === 'cbu' ? <Check className="w-5 h-5 text-green-600"/> : <Copy className="w-5 h-5"/>}
                             </button>
                           </div>

                           {/* ALIAS */}
                           <div className="bg-white border border-stone-200 p-3 rounded flex justify-between items-center group">
                             <div>
                               <span className="text-[10px] uppercase text-stone-400 font-bold tracking-wider block mb-1">Alias</span>
                               <span className="font-mono text-stone-800 text-base font-bold">{BANK_DETAILS.alias}</span>
                             </div>
                             <button onClick={() => handleCopy(BANK_DETAILS.alias, 'alias')} className="p-2 text-stone-400 hover:text-stone-900">
                                 {copiedField === 'alias' ? <Check className="w-5 h-5 text-green-600"/> : <Copy className="w-5 h-5"/>}
                             </button>
                           </div>

                           {/* INFO EXTRA */}
                           <div className="grid grid-cols-2 gap-4">
                             <div>
                               <span className="text-[10px] uppercase text-stone-400 font-bold tracking-wider block mb-1">Banco</span>
                               <span className="text-sm text-stone-800 font-medium">{BANK_DETAILS.bank}</span>
                             </div>
                             <div>
                               <span className="text-[10px] uppercase text-stone-400 font-bold tracking-wider block mb-1">Titular</span>
                               <span className="text-sm text-stone-800 font-medium">{BANK_DETAILS.owner}</span>
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* SUBIR COMPROBANTE */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Adjuntar Comprobante</label>
                        <div className="relative border-2 border-dashed border-stone-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-stone-50 transition-colors cursor-pointer">
                          <input 
                            type="file" 
                            accept="image/*,.pdf"
                            onChange={(e) => setTransferFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {transferFile ? (
                             <div className="text-stone-900 flex items-center gap-2">
                               <Check className="w-5 h-5 text-green-600" />
                               <span className="font-medium">{transferFile.name}</span>
                             </div>
                          ) : (
                             <>
                               <UploadCloud className="w-8 h-8 text-stone-400 mb-2" />
                               <p className="text-sm text-stone-500">Haz clic o arrastra tu comprobante aquí</p>
                               <p className="text-xs text-stone-400 mt-1">(JPG, PNG, PDF)</p>
                             </>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={handleConfirmTransfer}
                        className="w-full bg-stone-900 text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-stone-800 shadow-lg transition-transform active:scale-[0.98]"
                      >
                        Informar Pago de ${(finalTotal).toLocaleString()}
                      </button>
                    </div>
                  )}

               </div>
            )}
          </div>

        </div>

        {/* COLUMNA DERECHA: RESUMEN DESKTOP */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 sticky top-24">
            <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Resumen del Pedido
            </h3>
            <OrderSummaryContent />
          </div>
        </div>

      </main>
    </div>
  );
};

export default CheckoutPage;