import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import { PublicOfferWithPlanWithVolumesDto } from "api-client-ts";

import { get, set } from "@/storage";
import { logError } from "@/util";

import { useApi } from "./ApiProvider";

const KEY = "offers";

interface OffersContextProps {
  isLoading: boolean;
  offers: PublicOfferWithPlanWithVolumesDto[];
  refresh: () => void;
  clear: () => void;
}

const PlansContext = createContext<OffersContextProps>({
  isLoading: false,
  offers: get<PublicOfferWithPlanWithVolumesDto[]>(KEY, []),
  refresh: () => {},
  clear: () => {},
});

export function useOffers() {
  const value = useContext(PlansContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useOffers must be wrapped in a <OffersProvider />");
    }
  }

  return value;
}

export function OffersProvider({ children }: PropsWithChildren) {
  const { offerApi } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [offers, setOffers] = useState(
    get<PublicOfferWithPlanWithVolumesDto[]>(KEY, [])
  );

  const refresh = useCallback(() => {
    setIsLoading(true);
    offerApi
      .offerFindAllPublicValidV1()
      .then((offers) => {
        setOffers(offers);
        set(KEY, offers);
      })
      .catch(logError)
      .finally(() => setIsLoading(false));
  }, [offerApi]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clear = useCallback(() => {
    setOffers([]);
    set(KEY, []);
  }, []);

  const value = useMemo(
    () => ({ isLoading, offers, refresh, clear }),
    [isLoading, offers, refresh, clear]
  );

  return (
    <PlansContext.Provider value={value}>{children}</PlansContext.Provider>
  );
}
