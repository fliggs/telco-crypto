import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PublicTokenBalanceDto, PublicWalletDto } from "api-client-ts";
import Decimal from "decimal.js";
import { Dimensions, Image, View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";

import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { Color, Spacing } from "@/constants";
import { formatCost, splitNumber } from "@/util";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import MenuItemLink from "@/components/MenuItemLink";
import Button, { ButtonType } from "@/components/Button";
import SvgCheck from "@/assets/icons/check.svg";
import { useSupport } from "@/providers/SupportProvider";
import PriceTag, { priceVariant } from "@/components/PriceTag";
import { useTranslation } from "@/node_modules/react-i18next";

export default function Wallets() {
  const { meApi } = useApi();
  const { showError } = useErrorSheet();
  const { showChat } = useSupport();
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<PublicWalletDto[]>([]);
  const [tokens, setTokens] = useState<Record<string, PublicTokenBalanceDto[]>>(
    {}
  );
  const { width } = Dimensions.get("window");
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<number>(0);
  const tabs = [
    {
      id: 0,

      name: `${t("wallets.tab-coin")}`,
      status: "active",
    },
    {
      id: 1,
      name: `${t("wallets.tab-badges")}`,
      status: "deactive",
    },
  ];

  const onChange = (tabId: number) => {
    setActiveTab(tabId);
  };

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
    setLoading(true);
    try {
      const wallets = await meApi.meFindMyWalletsV1();
      setWallets(wallets);

      await Promise.all(
        wallets.map((wallet) =>
          meApi
            .meFindMyWalletTokensV1({ walletIdOrAddress: wallet.id })
            .then((tokens) =>
              setTokens((ts) => ({ ...ts, [wallet.id]: tokens }))
            )
        )
      );
    } catch (err) {
      showError({
        error: err,
      });
    } finally {
      setLoading(false);
    }
  }, [meApi]);

  useEffect(() => {
    refresh();
  }, []);

  return (
    <SafeView noPaddingBottom dark>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: Spacing.SMALL,
          paddingBottom: Spacing.SMALL,
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Color.WHITE}
          />
        }
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            //flexWrap: "wrap",
            //gap: Spacing.SMALL,

            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {tabs.map((tab, index) => (
            <React.Fragment key={tab.name}>
              <Button
                type={ButtonType.TRANSPARENT}
                onPress={() => onChange(tab.id)}
                key={index}
                enabled={tab.status == "active"}
                style={{
                  marginBottom: 5,
                  paddingHorizontal: 0,
                  paddingTop: 30,

                  width: "47.8%",
                  backgroundColor:
                    tab?.id == activeTab
                      ? Color.PRIMARY
                      : tab.status == "active"
                      ? Color.DARK
                      : Color.DARK_GRAY,
                }}
              >
                <View
                  style={{
                    // flex: 1,

                    position: "relative",
                  }}
                >
                  <Text
                    variant={TextVariant.H4}
                    color={tab?.id == activeTab ? Color.BLACK : Color.WHITE}
                    style={{
                      width: width / 2 - 40 + 12,
                      textAlign: "center",
                    }}
                  >
                    {tab?.name}
                  </Text>
                </View>
              </Button>
              {activeTab === tab.id && (
                <SvgCheck
                  style={{
                    position: "absolute",
                    top: index < 3 ? 60 : 150,
                    left: index == 0 ? "20%" : "71%",
                    zIndex: index == 0 ? 1 : 0,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </View>
        <Text
          variant={TextVariant.BodyLarge}
          color={Color.WHITE}
          style={{ marginVertical: Spacing.MEDIUM }}
        >
          {t("wallets.description")}
        </Text>

        <Text variant={TextVariant.H4} color={Color.WHITE}>
          {t("wallets.title")}
        </Text>

        <View
          style={{
            backgroundColor: Color.PRIMARY,
            padding: Spacing.MEDIUM,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
            marginTop: Spacing.MEDIUM,
            marginBottom: Spacing.LARGE,
          }}
        >
          <PriceTag
            value={String(total) ?? "0.00"}
            variant={priceVariant.SMALL}
          />
        </View>

        {wallets.map((wallet, j) => (
          <Fragment key={j}>
            {tokens[wallet.id]?.map((token, i) => (
              <MenuItemLink key={i} href="/logged-in/main/wallets" noChevron>
                <Image
                  src={token.image}
                  resizeMode="contain"
                  style={{
                    alignSelf: "stretch",
                    width: Spacing.LARGE,
                    marginRight: Spacing.MEDIUM,
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                  }}
                >
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                      {token.name}
                    </Text>
                    <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                      {token.balance} {token.symbol}
                    </Text>
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                      {token.symbol}
                    </Text>
                    <Text variant={TextVariant.Description} color={Color.WHITE}>
                      {formatCost(token.balanceInUsd)}
                    </Text>
                  </View>
                </View>
              </MenuItemLink>
            ))}
          </Fragment>
        ))}

        <View style={{ flexGrow: 1 }} collapsable={false} />

        <Button
          type={ButtonType.PRIMARY}
          style={{ marginTop: Spacing.LARGE }}
          onPress={showChat}
        >
          {t("global.chat-with-us")}
        </Button>
      </ScrollView>
    </SafeView>
  );
}
