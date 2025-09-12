import { View } from "react-native";

import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicTokenBalanceDto, PublicWalletDto } from "api-client-ts";
import Decimal from "decimal.js";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import PriceTag, { priceVariant } from "@/components/PriceTag";
import { useTranslation } from "@/node_modules/react-i18next";

export default function SettingsAccountBillingCreaditBalance() {
  const { t } = useTranslation();
  const { meApi } = useApi();
  const { showError } = useErrorSheet();
  const [wallets, setWallets] = useState<PublicWalletDto[]>([]);
  const [tokens, setTokens] = useState<Record<string, PublicTokenBalanceDto[]>>(
    {}
  );
  const total = useMemo(
    () =>
      wallets.reduce(
        (acc, w) =>
          acc.plus(
            tokens[w.id]?.reduce(
              (a, t) => a.plus(t.balanceInUsd ? Decimal(t.balanceInUsd) : 0),
              Decimal(0)
            ) ?? 0
          ),
        Decimal(0)
      ),
    [wallets, tokens]
  );

  const refresh = useCallback(async () => {
    try {
      const wallets = await meApi.meFindMyWalletsV1();
      setWallets(wallets);

      await Promise.all(
        wallets.map((wallet) =>
          meApi
            .meFindMyWalletTokensV1({ walletId: wallet.id })
            .then((tokens) =>
              setTokens((ts) => ({ ...ts, [wallet.id]: tokens }))
            )
        )
      );
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi]);

  useEffect(() => {
    refresh();
  }, []);
  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />

      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        {t("account.credit-balance-title")}
      </Text>
      <Text variant={TextVariant.BodyLarge} color={Color.WHITE}>
        {t("account.credit-balance-subtilte")}
      </Text>
      <View
        style={{
          backgroundColor: Color.PRIMARY,
          padding: Spacing.MEDIUM,
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
        }}
      >
        <PriceTag
          value={String(total) ?? "0.00"}
          variant={priceVariant.SMALL}
        />
      </View>
      <Text variant={TextVariant.BodyLarge} color={Color.WHITE}>
        {t("account.credit-balance-subtilte2")}
      </Text>
    </SafeView>
  );
}
