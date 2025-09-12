import { View, ScrollView, Image } from 'react-native'
import React, { useEffect } from 'react'
import SafeView from '@/components/SafeView'
import Header from '@/components/Header'
import { Color, Spacing } from '@/constants'
import Text, { TextVariant } from '@/components/Text'
import { formatCost } from '@/util'
import { useLocalSearchParams } from 'expo-router'
import { Params } from '..'
import { RectButton } from 'react-native-gesture-handler'
import ArrowUp from "@/assets/icons/arrow-up.svg"
import ArrowDown from "@/assets/icons/arrow-down.svg"
import { useWallet } from '@/providers/WalletProvider'


type transactionItem = {
    type: "send" | "recieve";
    status: "success" | "failed";
    fee: number;
    date: string;
    time: string
};

const transactions = () => {
    const { token, name, image, price, balance, balanceInUsd } =
        useLocalSearchParams<Params>();

    const { transactions } = useWallet();

    const transactionItem = ({ type, status, fee, date, time }: transactionItem) => {

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.SMALL, }}>
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", flex: 1 }}>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginHorizontal: Spacing.SMALL }}>
                        <View style={{ marginRight: Spacing.SMALL }}>
                            {
                                type === "send" ?
                                    <ArrowUp /> :
                                    <ArrowDown />
                            }
                        </View>
                        <View >
                            <Text variant={TextVariant.BodySmall} color={Color.WHITE}>{type === "send" ? "Send" : "Recieve"}</Text>
                            <Text variant={TextVariant.BodySmall} color={status !== "success" ? Color.RED : Color.PETROL}>{status}</Text>
                        </View>
                    </View>

                    <View style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1 }}>
                        <Text variant={TextVariant.BodySmall} color={Color.WHITE}>{date}</Text>
                        <Text variant={TextVariant.BodySmall} color={Color.WHITE}>{time}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: "flex-end", }}>
                        <Text variant={TextVariant.BodySmall} color={Color.WHITE}>{`${type === "send" ? "-" : ""}${fee}`}</Text>
                    </View>
                </View>
            </View>
        );
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
                    Transactions.
                </Text>
                <RectButton
                >
                    <Text variant={TextVariant.Link} style={{}}>
                        View details in Browser
                        {" >"}
                    </Text>
                </RectButton>

                <View>
                    {transactions.map((item, index) => (
                        <View key={index}>
                            {transactionItem(item)}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeView>
    )
}

export default transactions