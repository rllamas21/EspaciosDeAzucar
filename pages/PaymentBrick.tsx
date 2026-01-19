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
    // 1. LEER LA LLAVE DIRECTAMENTE DE LAS VARIABLES DE ENTORNO
    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'es-AR' });
      setReady(true);
    } else {
      console.error("❌ ERROR CRÍTICO: No se encontró VITE_MP_PUBLIC_KEY");
    }
  }, []);

  const initialization = {
    amount: Number(orderTotal),
  };

  // 🎨 PERSONALIZACIÓN VISUAL (ESTILO PLANO Y NEGRO)
  const customization = {
    paymentMethods: {
      ticket: "exclude", // 🚫 Ocultamos Rapipago/PagoFácil
      bankTransfer: "all",
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
    visual: {
        style: {
            theme: 'flat', // Diseño moderno sin sombras exageradas
            customVariables: {
                textPrimaryColor: '#1c1917', // Texto negro suave
                textSecondaryColor: '#57534e', 
                inputBackgroundColor: '#ffffff',
                formBackgroundColor: '#ffffff',
                baseColor: '#1c1917', // ⚫ BOTÓN NEGRO (Stone-900)
                borderRadius: '6px',
                successColor: '#16a34a',
                warningColor: '#eab308',
                errorColor: '#dc2626',
            }
        },
        texts: {
            formTitle: "Pagar con Tarjeta",
        }
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    return new Promise<void>((resolve, reject) => {
      // Usamos la URL completa como en tu versión original para asegurar compatibilidad
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
            window.location.href = `/?status=success&payment_id=${data.id}&order_id=${orderId}`;
        } else {
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
    // Componente listo
  };

  if (!ready) {
    return (
        <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
        </div>
    );
  }

  // 🧹 Contenedor limpio (sin bordes ni sombras externas, ya que está dentro de un Tab)
  return (
    <div className="animate-in fade-in duration-500 w-full">
      <div className="opacity-95">
        <Payment
          initialization={initialization}
          customization={customization as any} 
          onSubmit={onSubmit}
          onReady={onReady}
          onError={onError}
        />
      </div>
    </div>
  );
};

export default PaymentBrick;