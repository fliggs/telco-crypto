import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Dimensions, Image, ScrollView, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { LineChart } from "react-native-wagmi-charts";

import { filterByPeriod, formatCost, logError } from "@/util";
import { Color, Spacing } from "@/constants";
import { useApi } from "@/providers/ApiProvider";
import { useWallet } from "@/providers/WalletProvider";
import Text, { TextVariant } from "@/components/Text";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import MenuItemLink from "@/components/MenuItemLink";
import SimpleSelector from "@/components/SimpleSelectorWrapper";

export interface Params extends Record<string, string> {
  token: string;
  name: string;
  image: string;
  price: string;
  balance: string;
  balanceInUsd: string;
}


export default function WalletCoinScreen() {
  const { token, name, image, price, balance, balanceInUsd } =
    useLocalSearchParams<Params>();
  const { meApi } = useApi();
  const { wallet } = useWallet();
  const [rawHistory, setRawHistory] = useState<
    { timestamp: number; value: number }[]
  >([]);
  const [history, setHistory] = useState<
    { timestamp: number; value: number }[]
  >([]);
  const width = Dimensions.get("window").width;
  const [selected, setSelected] = useState("12m");


  useFocusEffect(
    useCallback(() => {
      if (!wallet) return;

      meApi
        .meGetMyWalletTokenHistoryV1({
          walletIdOrAddress: wallet.address,
          token,
        })
        .then(({ prices }) => {
          const mapped = prices.map((p) => ({
            timestamp: p.ts.getTime(),
            value: p.price,
          }));
          setRawHistory(mapped);
        })
        .catch(logError);
    }, [meApi, wallet, token])
  );

  useEffect(() => {
    setHistory(filterByPeriod(rawHistory, selected));
  }, [rawHistory, selected]);


  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H4} color={Color.WHITE}>
        Your {token} balance.
      </Text>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, gap: Spacing.MEDIUM }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: Color.PRIMARY,
            paddingHorizontal: Spacing.MEDIUM,
            paddingVertical: Spacing.MEDIUM,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 48,
          }}
        >
          <Image
            src={image}
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
              <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                {name}
              </Text>
              <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                {balance} {token}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                {token}
              </Text>
              <Text variant={TextVariant.Description} color={Color.BLACK}>
                {formatCost(balanceInUsd)}
              </Text>
            </View>
          </View>
        </View>

        <View >
          <Text variant={TextVariant.Fineprint} color={Color.WHITE} style={{ textAlign: "right" }}>
            Current {token} value
          </Text>
          <Text variant={TextVariant.H4} color={Color.WHITE} style={{ textAlign: "right" }}>
            USD {formatCost(price, false)}
          </Text>
        </View>

        {history.length > 0 ? (
          <>
            <LineChart.Provider key={selected} data={history}>
              <LineChart height={200} width={width - 2 * Spacing.MEDIUM}>
                <LineChart.Path color={Color.WHITE} />
                <LineChart.CursorLine>
                  <LineChart.Tooltip textStyle={{ color: Color.WHITE }} />
                </LineChart.CursorLine>
              </LineChart>
            </LineChart.Provider>
            <SimpleSelector
              options={[
                { id: "3m", label: "3M" },
                { id: "12m", label: "12M" },
                { id: "36m", label: "36M" }
              ]}
              selectedId={selected}
              onSelect={setSelected}
            />
          </>

        ) : (
          <View style={{ height: 200 }} collapsable={false} />
        )}
        <Text variant={TextVariant.Fineprint} color={Color.WHITE} style={{ marginTop: Spacing.SMALL }}>Manage your funds </Text>
        <View style={{ gap: Spacing.SMALL }}>
          {/* <MenuItemLink notButton
            href={{
              pathname: "/logged-in/wallet/tokens/[token]/manage/bills",
              params: {
                token: token,
                name: name,
                image: image,
                price: price,
                balance: balance,
                balanceInUsd: balanceInUsd,
              }
            }}
          >
            Pay phone bills
          </MenuItemLink> */}

          <MenuItemLink notButton
            href={{
              pathname: "/logged-in/wallet/tokens/[token]/manage/send",
              params: {
                token: token,
                name: name,
                image: image,
                price: price,
                balance: balance,
                balanceInUsd: balanceInUsd,
              }
            }}
          >
            Send
          </MenuItemLink>

          <MenuItemLink notButton href={{
            pathname: "/logged-in/wallet/tokens/[token]/manage/recieve",
            params: {
              token: token,
              name: name,
              image: image,
              price: price,
              balance: balance,
              balanceInUsd: balanceInUsd,
            }
          }}>
            Receive
          </MenuItemLink>
        </View>
        <Text variant={TextVariant.Fineprint} color={Color.WHITE} style={{ marginTop: Spacing.SMALL }}>View statistics </Text>
        <View style={{ gap: Spacing.SMALL }}>
          <MenuItemLink notButton href={{
            pathname: "/logged-in/wallet/tokens/[token]/manage/transactions",
            params: {
              token: token,
              name: name,
              image: image,
              price: price,
              balance: balance,
              balanceInUsd: balanceInUsd,
            }
          }}>
            Transactions
          </MenuItemLink>

        </View>
      </ScrollView>
    </SafeView>
  );
}
