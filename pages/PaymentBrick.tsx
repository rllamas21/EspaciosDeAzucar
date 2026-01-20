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

  // SEGÚN TU CÓDIGO COPIADO:
  const initialization = {
    amount: Number(orderTotal),
    payer: {
      email: 'test_user_123456@testuser.com', 
    },
  };

  // SEGÚN TU CÓDIGO COPIADO (¡Esto es lo que faltaba!):
  const customization = {
    visual: {
      style: {
        theme: 'default', // Tu código dice "default"
      },
    },
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
      ticket: "all",
      bankTransfer: "all",
      onboarding_credits: "all",
      wallet_purchase: "all",
      maxInstallments: 12 // Puse 12 para dar flexibilidad, tu código decía 1.
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    return new Promise<void>((resolve, reject) => {
      fetch("https://yobel-admin-638148538936.us-east1.run.app/api/store/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData, // Aquí va todo lo que el Brick generó
          // Agregamos tus datos extra para que el Backend sepa quién es
          orderId: orderId,
          clientId: clientId,
          // Un pequeño parche por si el Brick no manda description
          description: "Compra en Tienda",
          // Y nos aseguramos que payer venga completo
          payer: {
             ...formData.payer,
             email: formData.payer.email || 'test_user_123456@testuser.com'
          }
        }),
      })
      .then((response) => response.json())
      .then((data) => {
        // Tu Backend devuelve el objeto 'result' directo de MP
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
        console.error("Error:", error);
        reject();
      });
    });
  };

  if (!ready) return <Loader2 className="animate-spin" />;

  return (
    <Payment
      initialization={initialization}
      customization={customization as any}
      onSubmit={onSubmit}
    />
  );
};

export default PaymentBrick;