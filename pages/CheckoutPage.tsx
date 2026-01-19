import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import AddressSelector from '../components/AddressSelector';
import PaymentBrick from '../pages/PaymentBrick';
import api from '../lib/api';
import { CartItem, Address } from '../types';

interface CheckoutPageProps {
  cart: CartItem[];
  total: number;
  onReturnToShop: () => void;
}

type CheckoutStep = 'shipping' | 'payment';

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, total, onReturnToShop }) => {
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  
  // Datos de la orden generada para pasarle al Brick
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [createdOrderTotal, setCreatedOrderTotal] = useState<number>(0);
  const [clientId, setClientId] = useState<number | string | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  // 1. CREAR LA ORDEN EN EL BACKEND
  const handleConfirmShipping = async () => {
    if (!selectedAddress) {
      setError("Por favor selecciona una dirección de envío.");
      return;
    }
    
    setLoadingOrder(true);
    setError(null);

    try {
      // Preparamos los items para el backend (igual que antes)
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

      // Creamos la orden con la dirección seleccionada
      const orderPayload = {
        shippingAddress: {
          firstName: selectedAddress.recipient_name.split(' ')[0], // Hack simple para nombre
          lastName: selectedAddress.recipient_name.split(' ').slice(1).join(' ') || '',
          dni: '', // Opcional si ya no lo pides o lo sacas del user
          phone: selectedAddress.phone,
          street: selectedAddress.street,
          number: selectedAddress.number,
          city: selectedAddress.city,
          zip: selectedAddress.zip_code,
          province: selectedAddress.province
        },
        billingAddress: {}, // Se asume igual
        paymentMethod: 'mercadopago',
        shippingCost: 0, // Aquí podrías calcular envío real si quisieras
        items: itemsLimpios 
      };

      const { data } = await api.post('/api/store/checkout', orderPayload);
      
      // ¡Éxito! Guardamos los datos y avanzamos al pago
      setCreatedOrderId(data.orderId);
      setCreatedOrderTotal(total); // O data.total si el backend recalcula
      if (data.clientId) setClientId(data.clientId);
      
      setStep('payment');

    } catch (err: any) {
      console.error("Error creando orden:", err);
      setError(err.response?.data?.error || "Error al procesar la orden. Intenta nuevamente.");
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20">
      
      {/* HEADER SIMPLE (Tipo Shopify) */}
      <header className="bg-white border-b border-stone-200 py-4 px-6 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={onReturnToShop} className="text-sm font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver a la tienda
          </button>
          <div className="flex items-center gap-2 text-stone-900">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <span className="font-serif font-bold text-lg hidden sm:block">Checkout Seguro</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: PROCESO (2/3 del ancho) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PASO 1: ENVÍO */}
          <div className={`bg-white p-6 md:p-8 rounded-lg shadow-sm border border-stone-100 transition-opacity ${step === 'payment' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 'shipping' ? 'bg-stone-900 text-white' : 'bg-green-100 text-green-700'}`}>
                {step === 'payment' ? '✓' : '1'}
              </div>
              <h2 className="font-serif text-xl text-stone-800">Dirección de Envío</h2>
            </div>

            {/* Selector de Direcciones (Componente Nuevo) */}
            <div className={step === 'payment' ? 'hidden' : 'block'}>
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
                  className="bg-stone-900 text-white px-8 py-3 rounded hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  {loadingOrder ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Continuar al Pago'}
                </button>
              </div>
            </div>

            {/* Resumen Compacto (Solo visible cuando ya pasamos al paso 2) */}
            {step === 'payment' && selectedAddress && (
              <div className="ml-11 text-sm text-stone-600">
                <p className="font-medium text-stone-900">{selectedAddress.alias} ({selectedAddress.recipient_name})</p>
                <p>{selectedAddress.street} {selectedAddress.number}, {selectedAddress.city}</p>
                <button onClick={() => setStep('shipping')} className="text-blue-600 hover:underline mt-1 text-xs font-medium">Cambiar</button>
              </div>
            )}
          </div>

          {/* PASO 2: PAGO */}
          <div className={`bg-white p-6 md:p-8 rounded-lg shadow-sm border border-stone-100 transition-all ${step === 'shipping' ? 'opacity-40 grayscale' : 'opacity-100 ring-1 ring-stone-900'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 'shipping' ? 'bg-stone-200 text-stone-500' : 'bg-stone-900 text-white'}`}>
                2
              </div>
              <h2 className="font-serif text-xl text-stone-800">Pago</h2>
            </div>

            {step === 'payment' && createdOrderId ? (
               <div className="ml-0 md:ml-11 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-stone-500 text-sm mb-6">Selecciona tu método de pago preferido. Todas las transacciones son encriptadas.</p>
                  {/* BRICK DE MERCADO PAGO INTEGRADO */}
                  <PaymentBrick 
                     orderTotal={createdOrderTotal}
                     orderId={createdOrderId}
                     clientId={clientId || 0}
                  />
               </div>
            ) : (
              <p className="ml-11 text-stone-400 text-sm italic">Completa el envío para desbloquear el pago.</p>
            )}
          </div>

        </div>

        {/* COLUMNA DERECHA: RESUMEN ORDEN (Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 sticky top-24">
            <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Resumen del Pedido
            </h3>
            
            {/* Lista de Items (Scrollable si son muchos) */}
            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 mb-6 scrollbar-thin scrollbar-thumb-stone-200">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex gap-3 text-sm">
                  <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden flex-shrink-0 relative">
                     {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-stone-200" />
                     )}
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
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-stone-400 italic">Gratis</span>
              </div>
            </div>
            
            <div className="border-t border-stone-200 pt-4 mt-4 flex justify-between items-end">
              <span className="font-serif text-lg text-stone-800">Total</span>
              <span className="font-bold text-2xl text-stone-900">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default CheckoutPage;