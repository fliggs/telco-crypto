import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useCallback,
  useState,
} from "react";
import { PublicOrderWithDetailsDto, UpdateMyOrderV2Dto } from "api-client-ts";

import { get, set } from "@/storage";
import LoadingComponent from "@/components/LoadingComponent";

import { useApi } from "./ApiProvider";

interface OrderContextProps {
  order: PublicOrderWithDetailsDto;
  update: (dto: UpdateMyOrderV2Dto) => Promise<PublicOrderWithDetailsDto>;
  refresh: () => Promise<void>;
}

const OrderContext = createContext<OrderContextProps>({
  order: null as any,
  update: async () => {
    throw new Error("context_not_ready");
  },
  refresh: async () => {},
});

export function useOrder() {
  const value = useContext(OrderContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useCurrentOrder must be wrapped in a <CurrentOrderProvider />"
      );
    }
  }

  return value;
}

interface Props extends PropsWithChildren {
  orderId: string;
}

export function OrderProvider({ orderId, children }: Props) {
  const KEY = `order-${orderId}`;

  const { meApi } = useApi();
  const [order, setOrder] = useState(get<PublicOrderWithDetailsDto>(KEY));

  const update = useCallback(
    async (dto: UpdateMyOrderV2Dto) => {
      const newOrder = await meApi.meUpdateMyOrderV3({
        orderId: orderId,
        updateMyOrderV2Dto: dto,
      });
      set(KEY, newOrder);
      setOrder(newOrder);
      return newOrder;
    },
    [meApi, orderId]
  );

  const refresh = useCallback(async () => {
    let newOrder: PublicOrderWithDetailsDto | null;
    newOrder = await meApi
      .meFindMyOrderV2({ orderId: orderId })
      .catch(() => null);
    set(KEY, newOrder);
    setOrder(newOrder);
  }, [meApi, orderId]);

  useEffect(() => {
    refresh();
  }, []);

  if (!order) {
    return <LoadingComponent processing />;
  }

  return (
    <OrderContext.Provider
      value={{
        order,
        update,
        refresh,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}
