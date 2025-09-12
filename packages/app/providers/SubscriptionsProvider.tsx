import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useCallback,
  useState,
} from "react";
import {
  PublicOrderWithOfferDto,
  PublicSimDetailsDto,
  PublicSubscriptionPeriodWithOfferDto,
  PublicSubscriptionWithOfferDto,
  PublicVolumeUsageDto,
  SubscriptionStatus,
} from "api-client-ts";

import { get, set } from "@/storage";
import { logError } from "@/util";

import { useApi } from "./ApiProvider";

const KEY = "subs";

interface SubExtra {
  periods?: PublicSubscriptionPeriodWithOfferDto[];
  usages?: PublicVolumeUsageDto[];
  simDetails?: PublicSimDetailsDto;
  orders?: PublicOrderWithOfferDto[];
  children?: PublicSubscriptionWithOfferDto[];
}

interface SubscriptionsContextProps {
  subscriptions: PublicSubscriptionWithOfferDto[];
  extras: Record<string, SubExtra>;
  refresh: (extras?: boolean) => Promise<void>;
  clear: () => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextProps>({
  subscriptions: get<PublicSubscriptionWithOfferDto[]>(KEY, []),
  extras: {},
  refresh: async () => {},
  clear: () => {},
});

export function useSubscriptions(): SubscriptionsContextProps;
export function useSubscriptions(subId: string): SubscriptionsContextProps & {
  subscription: PublicSubscriptionWithOfferDto | undefined;
  extra: SubExtra | undefined;
};
export function useSubscriptions(subId?: string) {
  const value = useContext(SubscriptionsContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useSubscriptions must be wrapped in a <SubscriptionsProvider />"
      );
    }
  }

  if (subId) {
    const subscription = value.subscriptions.find((s) => s.id === subId);
    const extra = value.extras[subId];
    return {
      ...value,
      subscription,
      extra,
    };
  }

  return value;
}

export function SubscriptionsProvider({ children }: PropsWithChildren) {
  const { session, meApi } = useApi();
  const [subscriptions, setSubscriptions] = useState(
    get<PublicSubscriptionWithOfferDto[]>(KEY, [])
  );
  const [extras, setExtras] = useState<Record<string, SubExtra>>({});
  const refresh = useCallback(
    async (extras?: boolean) => {
      if (!session) {
        return;
      }

      const subs = await meApi.meFindMySubscriptionsV1({ baseOnly: true });
      setSubscriptions(subs);
      set(KEY, subs);

      if (extras) {
        for (const sub of subs) {
          meApi
            .meFindMySubscriptionPeriodsV1({ subId: sub.id })
            .then((periods) => {
              setExtras((extras) => ({
                ...extras,
                [sub.id]: { ...extras[sub.id], periods },
              }));
            })
            .catch(logError);

          if (sub.status === SubscriptionStatus.Pending) {
            meApi
              .meFindMySubscriptionOrdersV1({ subId: sub.id })
              .then((orders) => {
                setExtras((extras) => ({
                  ...extras,
                  [sub.id]: { ...extras[sub.id], orders },
                }));
              })
              .catch(logError);
          }

          // Only fetch details for activate plans that don't have a parent (=isStandalone)
          if (!sub.parentId && sub.status !== SubscriptionStatus.Pending) {
            meApi
              .meFindMySubscriptionChildrenV1({ subId: sub.id })
              .then((children) => {
                setExtras((extras) => ({
                  ...extras,
                  [sub.id]: { ...extras[sub.id], children },
                }));
              })
              .catch(logError);
            meApi
              .meFindMySubscriptionActiveSimUsageV1({ subId: sub.id })
              .then((usages) => {
                setExtras((extras) => ({
                  ...extras,
                  [sub.id]: { ...extras[sub.id], usages },
                }));
              })
              .catch(logError);
            meApi
              .meFindMySubscriptionActiveSimDetailsV1({ subId: sub.id })
              .then((details) => {
                setExtras((extras) => ({
                  ...extras,
                  [sub.id]: { ...extras[sub.id], simDetails: details },
                }));
              })
              .catch(logError);
          }
        }
      }
    },
    [meApi, session]
  );

  const clear = useCallback(() => {
    setSubscriptions([]);
    set(KEY, []);
  }, []);

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        extras,
        refresh,
        clear,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
}
