import { View, ScrollView, Image, Alert, Platform } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";
import { Color, Spacing } from "@/constants";
import Text, { TextVariant } from "@/components/Text";
import { formatCost } from "@/util";
import { useLocalSearchParams } from "expo-router";
import { Params } from "..";
import TextInput from "@/components/TextInput";
import CustomCheckbox from "@/components/CustomCheckBox";
import Warning from "@/components/Warning";
import Button, { ButtonType } from "@/components/Button";
import ScanQr from "@/assets/icons/scan-qr.svg";
import QRCodeScanner from "@/components/QrCodeScanner";
import BottomSheet from "@/components/BottomSheet";
import { t } from "i18next";
import * as LocalAuthentication from "expo-local-authentication";
import { useWallet } from "@/providers/WalletProvider";
import LoadingComponent from "@/components/LoadingComponent";
export enum WalletType {
  SOLANA = "solana",
  BITCOIN = "bitcoin",
  ETHEREUM = "ethereum",
  POLYGON = "polygon",
}

const send = () => {
  const { token, name, image, price, balance, balanceInUsd } =
    useLocalSearchParams<Params>();
  const [recievingAddress, setRecievingAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isMax, setisMax] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [walletID, setWalletID] = useState<string | null>(null);
  const {
    send,
    wallet,
    isLoading,
    estimateTransactionCost,
    mintAndTransferToken,
    convertSolToUSD,
  } = useWallet();
  const [sending, setSending] = useState<boolean | undefined>();
  const [txid, setTxid] = useState<string | null>(null);
  const [gasFees, setgasFees] = useState("");

  const handleScanned = (scannedData: string) => {
    setWalletID(scannedData);
    setShowScan(false);
    setRecievingAddress(scannedData);
  };
  const authenticate = async () => {
    console.log("inside authenticate");
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const isEmulator =
      Platform.OS === "android" &&
      (await LocalAuthentication.isEnrolledAsync()) === false;

    if (isEmulator) {
      // Bypass biometric on emulator for testing
      onSend();
      return;
    }

    if (!hasHardware || !isEnrolled) {
      Alert.alert("Biometrics not available", "Please use your device PIN.");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate",
      fallbackLabel: "Use PIN",
      cancelLabel: "Cancel",
    });

    if (result.success) {
      onSend();
    } else {
      Alert.alert("Authentication failed", result.error || "Try again");
    }
  };

  useEffect(() => {
    if (recievingAddress.length > 0 && Number(amount) > 0) {
      const fetchFee = async () => {
        try {
          const feeSol = await estimateTransactionCost(
            recievingAddress,
            Number(amount)
          );

          const feeUSD = await convertSolToUSD(Number(feeSol));

          console.log("Estimated fee:", feeSol, feeUSD);

          setgasFees(feeUSD);
        } catch (error) {
          console.error("Error estimating fee:", error);
        }
      };

      fetchFee();
    } else {
      setgasFees("0");
    }
  }, [amount, recievingAddress, estimateTransactionCost, convertSolToUSD]);

  const onSend = async () => {
    if (!recievingAddress || !amount || !name) {
      Alert.alert("Error", "Please enter recipient address and amount");
      return;
    }

    if (!wallet) {
      Alert.alert("Error", "Wallet not loaded");
      return;
    }

    setSending(true);
    try {
      let tx;
      if (name.toLowerCase() === WalletType.SOLANA) {
        console.log("Sending SOLs");
        tx = await send(recievingAddress, Number(amount));
      } else {
        console.log("Sending Tokens");
        tx = await mintAndTransferToken(
          recievingAddress,
          Number(amount),
          Number(amount)
        );
      }
      setTxid(tx);
    } catch (e: any) {
      setRecievingAddress("");
      setAmount("");
      setSending(undefined);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeView dark>
      <Header showBack />

      {showScan ? (
        <View>
          <Text
            color={Color.WHITE}
            style={{ marginBottom: Spacing.SMALL }}
            variant={TextVariant.BodyLarge}
          >
            Capture the receiving address.
          </Text>

          <QRCodeScanner onScanned={handleScanned} />
        </View>
      ) : (
        <>
          {sending ? (
            <LoadingComponent />
          ) : (
            <>
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
                      <Text
                        variant={TextVariant.Description}
                        color={Color.BLACK}
                      >
                        {formatCost(balanceInUsd)}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text variant={TextVariant.H4} color={Color.WHITE}>
                  Send {token}.
                </Text>
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  To another wallet or exchange.
                </Text>
                <View style={{ gap: Spacing.SMALL }}>
                  <TextInput
                    style={{ width: "100%" }}
                    value={recievingAddress}
                    onChangeText={setRecievingAddress}
                    placeholder="Enter receiving address"
                    textContentType="emailAddress"
                    autoCapitalize="none"
                    autoCorrect={false}
                    variant="secondary"
                    rightIcon={<ScanQr />}
                    onRightIconPress={() => setShowScan(true)}
                  />

                  <View style={{ flexDirection: "row", gap: Spacing.MEDIUM }}>
                    <View style={{ flex: 3 }}>
                      <TextInput
                        style={{ width: "100%" }}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="Enter $ amount"
                        textContentType="emailAddress"
                        keyboardType="decimal-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        variant="secondary"
                      />
                    </View>
                    <View style={{ flex: 1, marginTop: Spacing.MEDIUM }}>
                      <CustomCheckbox
                        text="Max."
                        checked={amount === balanceInUsd}
                        onCheckedChange={() => setAmount(balanceInUsd)}
                      />
                    </View>
                  </View>
                </View>

                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  Estimated Gas Fee in USD: {gasFees}
                </Text>
                <View style={{ gap: Spacing.SMALL }}>
                  <Warning color={Color.WHITE} />
                  <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                    Ensure the receiving address is a Solana wallet that
                    supports wBTC. Sending to an incompatible or incorrect
                    address may result in permanent loss of funds.
                  </Text>
                </View>

                <BottomSheet
                  trigger={(show) => (
                    <Button
                      type={ButtonType.PRIMARY}
                      enabled={Number(amount) > 0}
                      onPress={show}
                    >
                      {"Send"}
                    </Button>
                  )}
                >
                  {(close) => (
                    <View
                      style={{
                        gap: Spacing.SMALL,
                        paddingVertical: Spacing.SMALL,
                        display: "flex",
                        justifyContent: "center",
                        width: "95%",
                      }}
                    >
                      <Warning />
                      <Text
                        variant={TextVariant.H4}
                        color={Color.BLACK}
                        style={{
                          flexWrap: "wrap",
                          flexShrink: 1,
                          marginBottom: Spacing.SMALL,
                        }}
                      >
                        {t("wallets.please-confirm")}
                      </Text>
                      <Text variant={TextVariant.BodySmall} color={Color.DARK}>
                        {t("wallets.about-send")} {token}.
                      </Text>
                      <View
                        style={{
                          marginVertical: Spacing.MEDIUM,
                          gap: Spacing.SMALL,
                        }}
                      >
                        <TextInput
                          style={{ width: "100%" }}
                          value={amount}
                          onChangeText={setAmount}
                          placeholder={`Amount of ${token}`}
                          autoCapitalize="none"
                          autoCorrect={false}
                          variant="secondary_dark"
                        />
                        <TextInput
                          style={{ width: "100%" }}
                          value={recievingAddress}
                          onChangeText={setRecievingAddress}
                          placeholder={`Receiving address`}
                          autoCapitalize="none"
                          autoCorrect={false}
                          variant="secondary_dark"
                        />
                      </View>
                      <View style={{ gap: Spacing.SMALL }}>
                        <Button
                          onPress={close}
                          type={ButtonType.TRANSPARENT_BORD_BLACK}
                          textColor={Color.BLACK}
                        >
                          {t("global.button-cancel")}
                        </Button>
                        <Button onPress={() => authenticate()}>
                          {t("global.button-confirm")}
                        </Button>
                      </View>
                    </View>
                  )}
                </BottomSheet>
                <BottomSheet
                  visible={sending !== undefined}
                  trigger={(show) => <></>}
                  imageSuccess={txid !== null}
                >
                  {txid !== null
                    ? (close) => (
                        <View
                          style={{
                            gap: Spacing.SMALL,
                            paddingVertical: Spacing.SMALL,
                            display: "flex",
                            justifyContent: "center",
                            width: "95%",
                          }}
                        >
                          <Text
                            variant={TextVariant.H4}
                            color={Color.BLACK}
                            style={{
                              flexWrap: "wrap",
                              flexShrink: 1,
                              marginBottom: Spacing.SMALL,
                            }}
                          >
                            {t("wallets.sent")}
                          </Text>

                          <Text
                            variant={TextVariant.BodySmall}
                            color={Color.BLACK}
                            style={{ marginVertical: Spacing.MEDIUM }}
                          >
                            {" "}
                            {t("wallets.transfer-success")}
                          </Text>
                          <Button
                            style={{
                              marginTop: Spacing.SMALL,
                              width: "100%",
                              alignSelf: "stretch",
                            }}
                            onPress={() => {
                              close();
                              setRecievingAddress("");
                              setAmount("");
                            }}
                          >
                            {t("global.button-ok")}
                          </Button>
                        </View>
                      )
                    : (close) => (
                        <View
                          style={{
                            gap: Spacing.SMALL,
                            paddingVertical: Spacing.SMALL,
                            display: "flex",
                            justifyContent: "center",
                            width: "95%",
                          }}
                        >
                          <Warning color={Color.RED} />
                          <Text variant={TextVariant.H4} color={Color.BLACK}>
                            {t("onboarding.we-are-sorry")}
                          </Text>
                          <Text
                            variant={TextVariant.BodySmall}
                            color={Color.BLACK}
                            style={{ marginVertical: Spacing.MEDIUM }}
                          >
                            {t("wallets.transfer-failed")}{" "}
                          </Text>

                          <Button
                            onPress={() => {
                              close();
                              setRecievingAddress("");
                              setAmount("");
                            }}
                          >
                            OK
                          </Button>
                        </View>
                      )}
                </BottomSheet>
              </ScrollView>
            </>
          )}
        </>
      )}
    </SafeView>
  );
};

export default send;
