import { useEffect } from "react";

const CheckoutReturn = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderId = params.get("order_id");

    // Pago aprobado → página de éxito
    if (status === "approved") {
      window.location.href = `/payment-result?order_id=${orderId}`;
      return;
    }

    // Pending o failure → volver al checkout
    window.location.href = "/checkout";
  }, []);

  return null; // no renderiza nada
};

export default CheckoutReturn;
