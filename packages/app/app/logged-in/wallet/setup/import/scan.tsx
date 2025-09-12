import { View, StyleSheet } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { CameraView, useCameraPermissions } from 'expo-camera';
import Button from '@/components/Button';
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
        Import a wallet.
      </Text>
      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        Capture the wallet address.
      </Text>

      <QRCodeScanner onScanned={handleScanned} resetTrigger={resetScanner} />

      {data && (
        <>
          <Button
            onPress={() => {
              setData(null);
              setResetScanner(true);
            }}
          />
          <View style={styles.overlay}>
            <Text style={styles.result}>Scanned: {data}</Text>
          </View>
        </>
      )}
    </SafeView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  result: { fontSize: 16, textAlign: 'center' },
});


export default scan