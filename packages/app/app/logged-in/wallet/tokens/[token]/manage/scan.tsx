import React, { useState } from 'react'
import SafeView from '@/components/SafeView';
import Header from '@/components/Header';
import Text, { TextVariant } from '@/components/Text';
import { Color, Spacing } from '@/constants';
import QRCodeScanner from '@/components/QrCodeScanner';

const scan = () => {
    const [data, setData] = useState<string | null>(null);
    const [resetScanner, setResetScanner] = useState(false);

    const handleScanned = (scannedData: string) => {
        setData(scannedData);
        setResetScanner(false);
    };

    return (
        <SafeView dark>
            <Header showBack />

            <Text variant={TextVariant.H4} color={Color.WHITE}>
                Scan QR code.
            </Text>
            <Text
                color={Color.WHITE}
                style={{ marginBottom: Spacing.SMALL }}
                variant={TextVariant.BodyLarge}
            >
                Capture the receiving address.
            </Text>

            <QRCodeScanner onScanned={handleScanned} resetTrigger={resetScanner} />

          
        </SafeView>
    );
};



export default scan