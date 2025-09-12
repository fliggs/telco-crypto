import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Platform } from "react-native";
import * as ExpoGoogleAuthentication from "@heartbot/expo-google-authentication";
import {
  AuthProvider,
  PublicAuthStrategyDto,
  PublicSessionTokensDto,
} from "api-client-ts";
import {
  appleAuth,
  appleAuthAndroid,
} from "@invertase/react-native-apple-authentication";
import {
  exchangeCodeAsync,
  fetchDiscoveryAsync,
  loadAsync,
} from "expo-auth-session";

import { logError } from "@/util";
import { get, set } from "@/storage";

import { useApi } from "./ApiProvider";

const KEY = "auth-strategies";

interface SocialAuthContextProps {
  strategies: PublicAuthStrategyDto[];
  validStrategies: PublicAuthStrategyDto[];
  login(strategy: PublicAuthStrategyDto): Promise<PublicSessionTokensDto>;
}

const cachedStrategies = get<PublicAuthStrategyDto[]>(KEY, []);
const SocialAuthContext = createContext<SocialAuthContextProps>({
  strategies: cachedStrategies,
  validStrategies: cachedStrategies.filter((s) =>
    s.tags?.includes(Platform.OS.toLowerCase())
  ),
  login: () => {
    throw new Error("context_not_ready");
  },
});

export function useSocialAuth() {
  const value = useContext(SocialAuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useSocialAuth must be wrapped in a <SocialAuthProvider />"
      );
    }
  }

  return value;
}

interface Props extends PropsWithChildren {}

export function SocialAuthProvider({ children }: Props) {
  const { authApi } = useApi();

  const [strategies, setStrategies] = useState(
    get<PublicAuthStrategyDto[]>(KEY, [])
  );

  useEffect(() => {
    authApi
      .authFindStrategiesV1({ admin: false })
      .then((strategies) => {
        setStrategies(strategies);
        set(KEY, strategies);
      })
      .catch(logError);
  }, [authApi]);

  const login = useCallback(async (strategy: PublicAuthStrategyDto) => {
    switch (strategy.provider) {
      case AuthProvider.Apple: {
        let token = "";
        let firstName: string | undefined = undefined;
        let lastName: string | undefined = undefined;

        if (appleAuth.isSupported) {
          const res = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
          });

          // use credentialState response to ensure the user is authenticated
          if (!res.identityToken) {
            throw new Error("Not authorized");
          }

          token = res.identityToken;
          firstName = res.fullName?.givenName ?? undefined;
          lastName = res.fullName?.familyName ?? undefined;
        } else {
          const rawNonce = Math.random().toString();
          const state = Math.random().toString();

          const exchange = await authApi.authAppleExchangeStartV2({
            strategy: strategy.name,
          });

          appleAuthAndroid.configure({
            clientId: exchange.clientId,
            redirectUri: exchange.redirectUrl,
            responseType: appleAuthAndroid.ResponseType.ALL,
            scope: appleAuthAndroid.Scope.ALL,
            nonce: rawNonce,
            state,
          });

          const res = await appleAuthAndroid.signIn();
          if (!res.id_token) {
            throw new Error("Not authorized");
          }

          token = res.id_token;
          firstName = res.user?.name?.firstName;
          lastName = res.user?.name?.lastName;
        }

        return authApi.authAppleExchangeCallbackV2({
          strategy: strategy.name,
          authAppleExchangeCallbackDto: {
            idToken: token,
            firstName,
            lastName,
          },
        });
      }

      case AuthProvider.Google: {
        const exchange = await authApi.authGoogleExchangeStartV2({
          strategy: strategy.name,
        });

        ExpoGoogleAuthentication.configure({
          webClientId: exchange.webClientId,
          iOSClientId: exchange.iOSClientId,
        });

        const res = await ExpoGoogleAuthentication.login();

        return authApi.authGoogleExchangeCallbackV2({
          strategy: strategy.name,
          authGoogleExchangeCallbackDto: {
            idToken: res.idToken,
          },
        });
      }

      case AuthProvider.OpenId: {
        const config = await authApi.openIdExchangeStartV1({
          strategy: strategy.name,
        });
        const discovery = await fetchDiscoveryAsync(config.issuerUrl);

        const req = await loadAsync(
          {
            clientId: config.clientId,
            redirectUri: config.redirectUrl,
            scopes: config.scope.split(" "),
          },
          discovery
        );

        const result = await req.promptAsync(discovery);
        if (result.type !== "success") {
          throw new Error(`Authentication failed: ${result.type}`);
        }

        const { idToken } = await exchangeCodeAsync(
          {
            clientId: config.clientId,
            scopes: config.scope.split(" "),
            code: result.params.code,
            redirectUri: req.redirectUri,
            extraParams: {
              code_verifier: req.codeVerifier ?? "",
            },
          },
          discovery
        );
        if (!idToken) {
          throw new Error("Could not exchange id token");
        }

        return authApi.openIdExchangeCallbackV1({
          strategy: strategy.name,
          authOpenIdExchangeCallbackDto: { idToken },
        });
      }

      default: {
        throw new Error("unknown_authentication_provider");
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      strategies,
      validStrategies: strategies.filter((s) =>
        s.tags?.includes(Platform.OS.toLowerCase())
      ),
      login,
    }),
    [strategies, login]
  );

  return (
    <SocialAuthContext.Provider value={value}>
      {children}
    </SocialAuthContext.Provider>
  );
}
