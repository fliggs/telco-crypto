import React, { useCallback, useMemo, useState } from "react";
import {
  PublicCertificateDto,
  PublicTokenBalanceDto,
  PublicWalletDto,
  WalletProvider,
} from "api-client-ts";
import Decimal from "decimal.js";
import { Image, Linking, StyleSheet, View } from "react-native";
import { useTranslation } from "@/node_modules/react-i18next";
import { useFocusEffect } from "expo-router";
import { format } from "date-fns";
import {
  Pressable,
  RefreshControl,
  ScrollView,
} from "react-native-gesture-handler";

import { formatCost, formatPhoneNum } from "@/util";
import { Color, Spacing } from "@/constants";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useWallet } from "@/providers/WalletProvider";
import { useMe } from "@/providers/MeProvider";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import MenuItemLink from "@/components/MenuItemLink";
import PriceTag, { priceVariant } from "@/components/PriceTag";
import LoadingComponent from "@/components/LoadingComponent";
import LegacyWallet from "@/components/LegacyWallet";

import SvgCheck from "@/assets/icons/check.svg";
import BottomSheet from "@/components/BottomSheet";
import CloseSvg from "@/assets/icons/close.svg";

import WalletRecover from "../wallet/recover";
import WalletSetup from "../wallet/setup";

const EXPLORER_URL =
  process.env.NODE_ENV !== "development"
    ? "https://explorer.solana.com/address/$cert"
    : "https://explorer.solana.com/address/$cert?cluster=devnet";

export default function Wallets() {
  const { meApi } = useApi();
  const { me } = useMe();
  const { showError } = useErrorSheet();
  const { isLoading, wallet } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [certs, setCerts] = useState<PublicCertificateDto[]>([]);
  const [tokens, setTokens] = useState<PublicTokenBalanceDto[]>([]);
  const [wallets, setWallets] = useState<PublicWalletDto[]>([]);
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = useMemo(
    () => [
      {
        id: 0,
        name: `${t("wallets.tab-coin")}`,
        enabled: true,
      },
      // {
      //   id: 1,
      //   name: "NFTs",
      //   enabled: false,

      // },
      {
        id: 2,
        name: "Vault",
        enabled: true,
      },
    ],
    []
  );

  const onChange = (tabId: number) => {
    setActiveTab(tabId);
  };

  const total = useMemo(
    () =>
      tokens.reduce(
        (a, t) => a.plus(t.balanceInUsd ? Decimal(t.balanceInUsd) : 0),
        Decimal(0)
      ),
    [tokens]
  );

  const refresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (isLoading) {
        return;
      }

      if (!me.isNewWalletEnabled) {
        return;
      }

      const wallets = await meApi.meFindMyWalletsV1();
      setWallets(wallets.filter((w) => w.provider === WalletProvider.Solana));

      if (wallet) {
        //clear();
        meApi
          .meFindMyWalletTokensV1({ walletIdOrAddress: wallet.address })
          .then(setTokens);
        meApi
          .meFindMyWalletCertificatesV1({ walletIdOrAddress: wallet.address })
          .then(setCerts);
        return;
      }
    } catch (err) {
      showError({
        error: err,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [meApi, isLoading, wallet]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!me.isNewWalletEnabled) {
    return <LegacyWallet />;
  }

  if (isLoading) {
    return <LoadingComponent processing />;
  }

  if (!wallet) {
    if (wallets.length > 0) {
      return <WalletRecover />;
    } else {
      return <WalletSetup />;
    }
  }

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
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Color.WHITE}
          />
        }
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: Spacing.SMALL,
            marginBottom: Spacing.MEDIUM,
          }}
        >
          {tabs.map((tab) => (
            <React.Fragment key={tab.name}>
              <Pressable
                key={tab.id}
                onPress={() => (tab.enabled ? onChange(tab.id) : null)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "center",
                  position: "relative",
                  marginBottom: 5,
                  paddingVertical: Spacing.MEDIUM,
                  opacity: tab.enabled ? 1 : 0.5,
                  backgroundColor:
                    tab?.id == activeTab
                      ? Color.PRIMARY
                      : tab.enabled
                      ? Color.DARK
                      : Color.DARK_GRAY,
                }}
              >
                <Text
                  variant={TextVariant.H4}
                  color={activeTab === tab.id ? Color.BLACK : Color.WHITE}
                >
                  {tab?.name}
                </Text>

                {activeTab === tab.id && (
                  <SvgCheck
                    style={{
                      position: "absolute",
                      bottom: -16,
                      left: "auto",
                      zIndex: 1,
                    }}
                  />
                )}
              </Pressable>
            </React.Fragment>
          ))}
        </View>

        {activeTab === 0 ? (
          <>
            <Text variant={TextVariant.H4} color={Color.WHITE}>
              {t("wallets.title")}
            </Text>

            <View
              style={{
                backgroundColor: Color.PRIMARY,
                padding: Spacing.MEDIUM,
                paddingBottom: 0,
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

            {tokens.map((token, i) => (
              <MenuItemLink
                key={i}
                href={{
                  pathname: "/logged-in/wallet/tokens/[token]",
                  params: {
                    token: token.symbol,
                    name: token.name,
                    image: token.image,
                    price: token.exchangeRateUsd,
                    balance: token.balance,
                    balanceInUsd: token.balanceInUsd,
                  },
                }}
              >
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
                    marginRight: Spacing.SMALL,
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
          </>
        ) : activeTab === 2 ? (
          <>
            <View style={{ marginBottom: Spacing.MEDIUM }}>
              <Text variant={TextVariant.H4} color={Color.WHITE}>
                Your certificates
              </Text>
              <BottomSheet
                trigger={(show) => (
                  <Pressable onPress={show}>
                    <Text variant={TextVariant.Link}>How it works {">"}</Text>
                  </Pressable>
                )}
              >
                {(close) => (
                  <View style={{ marginHorizontal: Spacing.SMALL }}>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        marginBottom: Spacing.MEDIUM,
                      }}
                    >
                      <Text
                        variant={TextVariant.H4}
                        color={Color.BLACK}
                        style={{ marginBottom: Spacing.SMALL, width: "90%" }}
                      >
                        Phone number theft protection
                      </Text>
                      <Pressable onPress={close} style={{ width: "10%" }}>
                        <CloseSvg />
                      </Pressable>
                    </View>
                    <Text
                      variant={TextVariant.BodySmall}
                      color={Color.BLACK}
                      style={{ marginBottom: Spacing.SMALL }}
                    >
                      We’ve added an extra layer of security to stop anyone from
                      stealing your phone number.
                    </Text>
                    <Text
                      variant={TextVariant.BodySmall}
                      color={Color.BLACK}
                      style={{ marginBottom: Spacing.SMALL }}
                    >
                      To request number porting or transfer to another SIM, you
                      must be logged into your account
                      <Text
                        variant={TextVariant.BodySmall}
                        color={Color.BLACK}
                        style={{
                          marginBottom: Spacing.SMALL,
                          fontWeight: "700",
                          display: "contents",
                        }}
                      >
                        {" (security layer 1)"}
                      </Text>{" "}
                      and have access to your wallet, which holds the ownership
                      certificate
                      <Text
                        variant={TextVariant.BodySmall}
                        color={Color.BLACK}
                        style={{
                          marginBottom: Spacing.SMALL,
                          fontWeight: "700",
                          display: "contents",
                        }}
                      >
                        {" (security layer 2)"}
                      </Text>
                      .
                    </Text>
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      To successfully steal your phone number,{" "}
                      <Text
                        variant={TextVariant.BodySmall}
                        color={Color.BLACK}
                        style={{ fontWeight: "700", display: "contents" }}
                      >
                        {"a fraudster would need both your "}
                      </Text>{" "}
                      account login and the access keys to your wallet. {"\n"}
                    </Text>

                    <Text
                      variant={TextVariant.BodySmall}
                      color={Color.BLACK}
                      style={{
                        marginBottom: Spacing.SMALL,
                        alignSelf: "flex-start",
                      }}
                    >
                      Without both, it simply won’t work.
                    </Text>
                    <Text
                      variant={TextVariant.BodySmall}
                      color={Color.BLACK}
                      style={{ marginBottom: Spacing.SMALL, marginLeft: 0 }}
                    >
                      You don’t have to do anything — we’ve set it up for you
                      automatically.
                    </Text>
                  </View>
                )}
              </BottomSheet>
            </View>

            {certs.map((cert) => (
              <Pressable
                key={cert.id}
                style={{
                  backgroundColor: Color.WHITE,
                  padding: Spacing.MEDIUM,
                  borderRadius: Spacing.SMALL,
                }}
                onPress={() =>
                  Linking.openURL(EXPLORER_URL.replace("$cert", cert.id))
                }
              >
                <Text variant={TextVariant.H4} color={Color.BLACK}>
                  {formatPhoneNum(cert.phoneNumberMsisdn)}
                </Text>

                <Text
                  color={Color.BLACK}
                  style={{ marginBottom: Spacing.MEDIUM }}
                >
                  Phone Number Ownership
                </Text>

                <Text
                  variant={TextVariant.Description}
                  color={Color.BLACK}
                  style={{ flex: 2 }}
                >
                  Certificate ID
                </Text>
                <View
                  style={{ flexDirection: "row", marginBottom: Spacing.MEDIUM }}
                >
                  <Text
                    variant={TextVariant.BodySmall}
                    color={Color.BLACK}
                    style={{ flexWrap: "wrap" }}
                  >
                    {cert.id}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: Spacing.SMALL }}>
                  <View style={{ flex: 1 }}>
                    <Text variant={TextVariant.Description} color={Color.BLACK}>
                      Issued at
                    </Text>
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      {format(cert.issuedAt, "MM/dd/yyyy")}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text variant={TextVariant.Description} color={Color.BLACK}>
                      Valid until
                    </Text>
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      {format(cert.expiresAt, "MM/dd/yyyy")}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </>
        ) : null}

        <View style={{ flexGrow: 1 }} collapsable={false} />

        {/* <Button
          type={ButtonType.PRIMARY}
          style={{ marginTop: Spacing.LARGE, marginBottom: Spacing.SMALL }}
          onPress={showChat}
        >
          {t("global.chat-with-us")}
        </Button> */}
      </ScrollView>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: Spacing.SMALL,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
    marginBottom: Spacing.MEDIUM,
  },
});
