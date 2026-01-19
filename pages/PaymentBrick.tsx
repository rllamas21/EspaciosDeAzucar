import { useEffect, useState } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Loader2 } from 'lucide-react';

interface PaymentBrickProps {
  orderTotal: number;
  orderId: string | number;
  clientId: string | number;
}

const PaymentBrick = ({ orderTotal, orderId, clientId }: PaymentBrickProps) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. LEER LA LLAVE DIRECTAMENTE DE LAS VARIABLES DE ENTORNO (VERCEL)
    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

    if (publicKey) {
      // Inicializamos Mercado Pago con la llave de Vercel
      initMercadoPago(publicKey, { locale: 'es-AR' });
      setReady(true);
    } else {
      console.error("❌ ERROR CRÍTICO: No se encontró VITE_MP_PUBLIC_KEY en las variables de entorno.");
    }
  }, []);

  // 2. CONFIGURACIÓN (Sin preferenceId para evitar pantalla blanca)
  const initialization = {
    amount: Number(orderTotal),
    // ¡IMPORTANTE! NO poner preferenceId aquí si usamos Bricks Core
  };

  const customization = {
    paymentMethods: {
      ticket: "all",
      bankTransfer: "all",
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
    visual: {
        style: {
            theme: 'default', 
        },
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    return new Promise<void>((resolve, reject) => {
      // Llamada directa a tu Backend
      fetch("https://yobel-admin-638148538936.us-east1.run.app/api/store/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData, 
          orderId: orderId,
          clientId: clientId
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        resolve();
        
        if (data.status === 'approved') {
            // REDIRECCIÓN MANUAL: ÉXITO
            window.location.href = `/?status=success&payment_id=${data.id}&order_id=${orderId}`;
        } else {
            // REDIRECCIÓN MANUAL: FALLO
            window.location.href = `/?status=failure&payment_id=${data.id}`;
        }
      })
      .catch((error) => {
        console.error("Error procesando el pago:", error);
        reject();
      });
    });
  };

  const onError = async (error: any) => {
    console.log("Error en Brick:", error);
  };

  const onReady = async () => {
    // El componente cargó correctamente
  };

  // Si no hay llave, mostramos un spinner o error en consola
  if (!ready) {
    return (
        <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-stone-200 animate-in fade-in duration-500">
      <h3 className="text-lg font-serif mb-4 text-stone-700">Pago Seguro con Tarjeta</h3>
      <div className="opacity-95">
        <Payment
          initialization={initialization}
          customization={customization as any} // 'as any' soluciona el error rojo de TypeScript
          onSubmit={onSubmit}
          onReady={onReady}
          onError={onError}
        />
      </div>
    </div>
  );
};

export default PaymentBrick;