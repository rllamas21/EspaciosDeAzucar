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
    const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: 'es-AR' });
      setReady(true);
    }
  }, []);

  const initialization = {
    amount: Number(orderTotal),
    payer: {
      // IMPORTANTE: Si usas el mismo email que el vendedor, falla.
      // Ponemos uno genérico seguro para evitar conflictos de "auto-compra".
      email: 'comprador_generico@email.com', 
    },
  };

  const customization = {
    visual: {
      style: {
        theme: 'flat', 
      },
      hidePaymentButton: false,
    },
    // 🚨 BORRÉ "paymentMethods". 
    // Al no existir, el Brick NO filtra nada. Acepta todo lo que tu cuenta acepte.
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    return new Promise<void>((resolve, reject) => {
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
        if (data.status === 'approved') {
            resolve();
            window.location.href = `/?status=success&payment_id=${data.id}&order_id=${orderId}`;
        } else if (data.status === 'in_process') {
             resolve();
             window.location.href = `/?status=pending&payment_id=${data.id}`;
        } else {
            resolve();
            window.location.href = `/?status=failure&payment_id=${data.id}`;
        }
      })
      .catch((error) => {
        console.error("Error Brick:", error);
        reject();
      });
    });
  };

  const onError = async (error: any) => {
    // Si sigue fallando, esto nos dirá qué pasa internamente sin hablar de tarjetas
    console.log("Error Interno SDK:", error);
  };

  const onReady = async () => {
    // Brick listo
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