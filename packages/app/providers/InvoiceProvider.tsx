import { useContext, createContext, type PropsWithChildren } from "react";
import { PublicInvoiceWithOrderAndItemsDto } from "api-client-ts";

interface InvoiceContextProps {
  invoices: PublicInvoiceWithOrderAndItemsDto[];
}

const InvoiceContext = createContext<InvoiceContextProps>({
  invoices: [],
});

export function useInvoices() {
  const value = useContext(InvoiceContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useInvoices must be wrapped in a <InvoicesProvider />");
    }
  }

  return value;
}

interface Props extends PropsWithChildren {
  invoices: PublicInvoiceWithOrderAndItemsDto[];
}

export function InvoicesProvider({ invoices, children }: Props) {
  return (
    <InvoiceContext.Provider value={{ invoices }}>
      {children}
    </InvoiceContext.Provider>
  );
}
