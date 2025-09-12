import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { PublicOnboardingStageDto } from "api-client-ts";

import { get, set } from "@/storage";
import { logError } from "@/util";

import { useApi } from "./ApiProvider";

const KEY = "onboarding-stages";

interface OnboardingStagesContextProps {
  stages: PublicOnboardingStageDto[];
  optionalStages: PublicOnboardingStageDto[];
  requiredStages: PublicOnboardingStageDto[];
  refresh: () => Promise<void>;
  clear: () => void;
}

const stages = get<PublicOnboardingStageDto[]>(KEY, []);
const OnboardingStagesContext = createContext<OnboardingStagesContextProps>({
  stages: stages,
  optionalStages: stages.filter((s) => !s.required),
  requiredStages: stages.filter((s) => s.required),
  refresh: async () => {},
  clear: () => {},
});

export function useOnboardingStages() {
  const value = useContext(OnboardingStagesContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useOnboardingStages must be wrapped in a <OnboardingStagesProvider />"
      );
    }
  }

  return value;
}

export function OnboardingStagesProvider({ children }: PropsWithChildren) {
  const { meApi, onboardingApi } = useApi();
  const [stages, setStages] = useState(
    get<PublicOnboardingStageDto[]>(KEY, [])
  );

  const refresh = useCallback(async () => {
    const stages = await onboardingApi.onboardingFindAllPublicStagesV1();
    setStages(stages);
    set(KEY, stages);
  }, [onboardingApi]);

  useEffect(() => {
    refresh().catch(logError);
  }, [refresh]);

  const clear = useCallback(() => {
    setStages([]);
    set(KEY, []);
  }, []);

  const value = useMemo(
    () => ({
      stages,
      optionalStages: stages.filter((s) => !s.required),
      requiredStages: stages.filter((s) => s.required),
      refresh,
      clear,
    }),
    [stages, refresh, clear]
  );

  return (
    <OnboardingStagesContext.Provider value={value}>
      {children}
    </OnboardingStagesContext.Provider>
  );
}
