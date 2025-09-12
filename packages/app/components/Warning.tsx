import { View, Text } from 'react-native'
import React from 'react'
import Warn from "@/assets/icons/warning.svg"
import { Color, Spacing } from '@/constants';


type WarningProps = {
    color?: string;
}
const Warning = ({ color = Color.RED }: WarningProps) => {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: Spacing.MEDIUM,
                width: "100%",
            }}
        >
            <View style={{ flex: 1, height: 1, backgroundColor: color }} />
            <Warn style={{ marginHorizontal: Spacing.MEDIUM, }} color={color} />

            <View style={{ flex: 1, height: 1, backgroundColor: color }} />
        </View>
    )
}

export default Warning