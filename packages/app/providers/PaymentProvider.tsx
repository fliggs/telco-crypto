import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
} from "react";

import { logError } from "@/util";

import { useMe } from "./MeProvider";

interface PaymentContextProps {
  getPaymentMethods: () => Promise<any[]>;
  checkout: () => Promise<boolean>;
}

const PaymentContext = createContext<PaymentContextProps>({
  getPaymentMethods: async () => [],
  checkout: () => {
    throw new Error("payment provider not ready");
  },
});

export function usePayment() {
  const value = useContext(PaymentContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("usePayment must be wrapped in a <PaymentProvider />");
    }
  }

  return value;
}

export function PaymentProvider({ children }: PropsWithChildren) {
  const { me } = useMe(false);

  const getPaymentMethods = useCallback(async () => {
    // TODO: Get payment methods
    return [];
  }, []);

  const checkout = useCallback(async () => {
    if (!me) {
      throw new Error("missing_user_info");
    }

    try {
      // TODO: Payment
      throw new Error("not_implemented");
    } catch (err: any) {
      logError(err);
      return false;
    }
  }, [me]);

  return (
    <PaymentContext.Provider value={{ checkout, getPaymentMethods }}>
      {children}
    </PaymentContext.Provider>
  );
}
