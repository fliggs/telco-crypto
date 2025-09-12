import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import {
  CreateMyOrderDto,
  OrderStatus,
  OrderType,
  PublicOrderWithOfferDto,
  UpdateMyOrderV2Dto,
} from "api-client-ts";

import { get, set } from "@/storage";

import { useApi } from "./ApiProvider";

interface CurrentOrderContextProps {
  order: PublicOrderWithOfferDto | null;
  create: (dto: CreateMyOrderDto) => Promise<PublicOrderWithOfferDto>;
  update: (dto: UpdateMyOrderV2Dto) => Promise<PublicOrderWithOfferDto>;
  refresh: () => Promise<void>;
  clear: () => void;
}

const CurrentOrderContext = createContext<CurrentOrderContextProps>({
  order: null,
  create: async () => {
    throw new Error("context_not_ready");
  },
  update: async () => {
    throw new Error("context_not_ready");
  },
  refresh: async () => {},
  clear: () => {},
});

export function useCurrentOrder() {
  const value = useContext(CurrentOrderContext);
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
  type: OrderType;
  status: OrderStatus;
}

export function CurrentOrderProvider({ type, status, children }: Props) {
  const KEY = `order-${type}-${status}`;

  const { meApi } = useApi();
  const [order, setOrder] = useState(get<PublicOrderWithOfferDto>(KEY));

  const create = useCallback(
    async (dto: CreateMyOrderDto) => {
      const newOrder = await meApi.meCreateMyOrderV1({ createMyOrderDto: dto });
      set(KEY, newOrder);
      setOrder(newOrder);
      return newOrder;
    },
    [meApi]
  );

  const update = useCallback(
    async (dto: UpdateMyOrderV2Dto) => {
      if (!order) {
        throw new Error("no_order");
      }
      const newOrder = await meApi.meUpdateMyOrderV2({
        orderId: order.id,
        updateMyOrderV2Dto: dto,
      });
      set(KEY, newOrder);
      setOrder(newOrder);
      return newOrder;
    },
    [meApi, order]
  );

  const refresh = useCallback(async () => {
    let newOrder: PublicOrderWithOfferDto | null;
    if (order) {
      newOrder = await meApi
        .meFindMyOrderV1({ orderId: order.id })
        .catch(() => null);
    } else {
      const orders = await meApi.meFindMyOrdersV1({
        types: [type],
        status: [status],
      });
      newOrder = orders[0] ?? null;
    }

    set(KEY, newOrder);
    setOrder(newOrder);
  }, [meApi, order]);

  const clear = useCallback(() => {
    setOrder(null);
    set(KEY, null);
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      order,
      create,
      update,
      refresh,
      clear,
    }),
    [order, create, update, refresh, clear]
  );

  return (
    <CurrentOrderContext.Provider value={value}>
      {children}
    </CurrentOrderContext.Provider>
  );
}
