import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { router } from "expo-router";
import { PublicOnboardingProgressDto } from "api-client-ts";

import { get, set } from "@/storage";
import { logError } from "@/util";

import { useOnboardingStages } from "./OnboardingStagesProvider";
import { useApi } from "./ApiProvider";

const KEY_REQUIRED = "onboarding-progress-required";
const KEY_OPTIONAL = "onboarding-progress-optional3";

interface OnboardingProgressContextProps {
  isRequiredComplete: boolean;
  isOptionalComplete: boolean;
  progressByStage: Record<string, PublicOnboardingProgressDto>;
  refresh: () => Promise<void>;
  startStage: (name: string) => Promise<void>;
  completeStage: (name: string, navigate?: boolean) => Promise<void>;
}

const OnboardingProgressContext = createContext<OnboardingProgressContextProps>(
  {
    isRequiredComplete: false,
    isOptionalComplete: false,
    progressByStage: {},
    refresh: async () => {},
    startStage: async () => {},
    completeStage: async () => {},
  }
);

export function useOnboardingProgress() {
  const value = useContext(OnboardingProgressContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useOnboardingProgress must be wrapped in a <OnboardingProgressProvider />"
      );
    }
  }

  return value;
}

export function OnboardingProgressProvider({ children }: PropsWithChildren) {
  const { session, meApi } = useApi();
  const { requiredStages, optionalStages } = useOnboardingStages();
  const [requiredProgress, setRequiredProgress] = useState(
    get<Record<string, PublicOnboardingProgressDto>>(KEY_REQUIRED, {})
  );
  const [optionalProgress, setOptionalProgress] = useState(
    get<Record<string, PublicOnboardingProgressDto>>(KEY_OPTIONAL, {})
  );

  const refresh = useCallback(async () => {
    const progress = await meApi.meFindMyOnboardingProgressV1();
    const byStage: Record<string, PublicOnboardingProgressDto> = {};
    progress.forEach((p) => (byStage[p.stageName] = p));
    setRequiredProgress(byStage);
    set(KEY_REQUIRED, byStage);
  }, [meApi]);

  const clearRequired = useCallback(() => {
    setRequiredProgress({});
    set(KEY_REQUIRED, {});
  }, []);

  useEffect(() => {
    if (!session) {
      clearRequired();
      return;
    }

    refresh().catch(logError);
  }, [refresh, clearRequired, session]);

  const progressByStage = useMemo(
    () => ({ ...requiredProgress, ...optionalProgress }),
    [requiredProgress, optionalProgress]
  );

  const isRequiredComplete = useMemo(
    () => requiredStages.every((s) => !!requiredProgress[s.name]?.completedAt),
    [requiredStages, requiredProgress]
  );

  const isOptionalComplete = useMemo(
    () => optionalStages.every((s) => !!optionalProgress[s.name]?.completedAt),
    [optionalStages, optionalProgress]
  );

  const startStage = useCallback(
    async (name: string) => {
      if (requiredStages.some((s) => s.name === name)) {
        await meApi.meUpdateMyOnboardingProgressV1({
          updateMyOnboardingProgressDto: {
            stage: name,
            completed: false,
          },
        });
        await refresh();
      } else {
        setOptionalProgress((oldProgress) => {
          if (oldProgress[name]?.startedAt) {
            return oldProgress;
          }

          const prog = {
            ...(oldProgress[name] ?? { id: "", stageName: name }),
            startedAt: new Date(),
          };

          const newProgress = { ...oldProgress, [name]: prog };
          set(KEY_OPTIONAL, newProgress);
          return newProgress;
        });
      }
    },
    [meApi, refresh]
  );

  const completeStage = useCallback(
    async (name: string, navigate: boolean = true) => {
      if (requiredStages.some((s) => s.name === name)) {
        await meApi.meUpdateMyOnboardingProgressV1({
          updateMyOnboardingProgressDto: {
            stage: name,
            completed: true,
          },
        });

        await refresh();

        if (navigate) {
          const currentStageIdx = requiredStages.findIndex(
            (s) => s.name === name
          );

          if (currentStageIdx >= 0) {
            const nextStage = requiredStages[currentStageIdx + 1];

            if (nextStage) {
              router.navigate({
                pathname: `/logged-in/onboarding/${nextStage.type}`,
                params: { stage: nextStage.name },
              });
            }
          }
        }
      } else {
        setOptionalProgress((oldProgress) => {
          if (oldProgress[name]?.completedAt) {
            return oldProgress;
          }

          const prog = {
            ...(oldProgress[name] ?? {
              id: "",
              stageName: name,
              startedAt: new Date(),
            }),
            completedAt: new Date(),
          };

          const newProgress = { ...oldProgress, [name]: prog };
          set(KEY_OPTIONAL, newProgress);
          return newProgress;
        });

        if (navigate) {
          const currentStageIdx = optionalStages.findIndex(
            (s) => s.name === name
          );

          if (currentStageIdx >= 0) {
            const nextStage = optionalStages[currentStageIdx + 1];

            if (nextStage) {
              router.navigate({
                pathname: `/pre-onboarding/${nextStage.type}` as any, // TODO: Add catch-all route
                params: { stage: nextStage.name },
              });
            }
          }
        }
      }
    },
    [meApi, refresh, requiredStages, optionalStages]
  );

  const value = useMemo(
    () => ({
      isRequiredComplete,
      isOptionalComplete,
      progressByStage,
      refresh,
      startStage,
      completeStage,
    }),
    [
      isRequiredComplete,
      isOptionalComplete,
      progressByStage,
      refresh,
      startStage,
      completeStage,
    ]
  );

  return (
    <OnboardingProgressContext.Provider value={value}>
      {children}
    </OnboardingProgressContext.Provider>
  );
}
