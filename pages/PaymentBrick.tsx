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
    // Inicialización del SDK
    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'es-AR' });
      setReady(true);
    }
  }, []);

  // 1. INICIALIZACIÓN (Datos mínimos obligatorios)
  const initialization = {
    amount: Number(orderTotal),
    payer: {
      email: 'test_user_123456@testuser.com', // Opcional: pre-rellena el email si lo tienes
    },
  };

  // 2. PERSONALIZACIÓN (Visual y UI)
  const customization = {
    visual: {
      style: {
        theme: 'flat', // 'default', 'dark', 'bootstrap' o 'flat'
      },
    },
    // NOTA: No definimos paymentMethods para dejar que MP use los valores predeterminados de la cuenta
  };

  // 3. ONSUBMIT (Envío de datos al Backend)
  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    return new Promise<void>((resolve, reject) => {
      fetch("https://yobel-admin-638148538936.us-east1.run.app/api/store/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData, // El Brick genera el token y los datos necesarios aquí
          orderId: orderId,
          clientId: clientId
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        // Manejo de respuesta basado en status
        if (data.status === 'approved') {
            resolve();
            window.location.href = `/?status=success&payment_id=${data.id}&order_id=${orderId}`;
        } else if (data.status === 'in_process') {
             resolve();
             window.location.href = `/?status=pending&payment_id=${data.id}`;
        } else {
            // Rechazado
            resolve();
            window.location.href = `/?status=failure&payment_id=${data.id}`;
        }
      })
      .catch((error) => {
        console.error("Error crítico:", error);
        reject();
      });
    });
  };

  const onError = async (error: any) => {
    console.log("Error en Brick:", error);
  };

  const onReady = async () => {
    // El componente cargó
  };

  if (!ready) {
    return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <Payment
      initialization={initialization}
      customization={customization as any}
      onSubmit={onSubmit}
      onReady={onReady}
      onError={onError}
    />
  );
};

export default PaymentBrick;