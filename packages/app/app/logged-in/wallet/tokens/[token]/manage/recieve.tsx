import { View, ScrollView, Image, Share, Alert, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import SafeView from '@/components/SafeView'
import Header from '@/components/Header'
import Text, { TextVariant } from '@/components/Text'
import { Color, Spacing } from '@/constants'
import { formatCost } from '@/util'
import { useLocalSearchParams } from 'expo-router'
import { Params } from '..'
import WalletSvg from "@/assets/images/wallet.svg"
import Button, { ButtonType } from '@/components/Button'
import BottomSheet from '@/components/BottomSheet'
import * as Clipboard from 'expo-clipboard';
import { useWallet } from '@/providers/WalletProvider'
import QRCode from 'react-native-qrcode-svg'


const send = () => {
    const { token, name, image, price, balance, balanceInUsd } =
        useLocalSearchParams<Params>();
    const { wallet, isLoading } = useWallet();

    const [walletID, setWalletID] = useState<string | undefined>();

    useEffect(() => {
        if (wallet?.address) {
            setWalletID(wallet.address);
        }
    }, [wallet]);

    const copyToClipboard = async () => {
        if (walletID) {
            await Clipboard.setStringAsync(walletID);
        }
    };


    const onShare = async () => {
        if (!walletID) {
            console.warn("Wallet ID is not available to share.");
            return;
        }

        try {
            const result = await Share.share({
                message: walletID,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                } else {
                }
            } else if (result.action === Share.dismissedAction) {
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };


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

                <Text variant={TextVariant.H4} color={Color.WHITE}>
                    Receive {token}.
                </Text>
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                    Share your address to receive {token}.
                </Text>
                <View style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: Spacing.MEDIUM, marginTop: Spacing.MEDIUM }}>
                    {walletID && (
                        <View style={{ alignSelf: "center", marginHorizontal: Spacing.MEDIUM, }}>
                            <QRCode value={walletID} size={Dimensions.get("window").width / 3} />
                        </View>
                    )}
                    <Text variant={TextVariant.BodyLarge} color={Color.WHITE} style={{ width: "80%", textAlign: "center" }}>
                        {walletID}
                    </Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={{ gap: Spacing.SMALL }}>
                    <BottomSheet
                        trigger={(show) => (
                            <Button
                                type={ButtonType.TRANSPARENT_BORD}
                                enabled={true}
                                onPress={() => { show(); copyToClipboard() }}
                            >
                                {"Copy to clipboard"}
                            </Button>
                        )}

                        imageSuccess={true}
                    >
                        {(close) => (
                            <>
                                <Text
                                    variant={TextVariant.H4}
                                    color={Color.BLACK}
                                    style={{ marginBottom: Spacing.SMALL }}
                                >
                                    Copied.
                                </Text>
                                <Text variant={TextVariant.BodySmall}
                                    color={Color.BLACK}
                                    style={{ marginBottom: Spacing.SMALL, width: "90%" }}>You have successfully copied the address to your clipboard. You can share it from there.</Text>
                                <Button
                                    style={{
                                        marginTop: Spacing.SMALL,
                                        width: "95%",
                                        marginBottom: Spacing.SMALL,
                                    }}
                                    onPress={close}
                                >
                                    OK
                                </Button>
                            </>
                        )}
                    </BottomSheet>

                    <Button
                        type={ButtonType.PRIMARY}
                        enabled={true}
                        onPress={onShare}                     >
                        {"Share"}
                    </Button>
                </View>
            </ScrollView>
        </SafeView>)
}

export default send