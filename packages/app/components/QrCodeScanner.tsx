import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

type QRCodeScannerProps = {
  onScanned: (data: string) => void;
  resetTrigger?: boolean;
};

export default function QRCodeScanner({ onScanned, resetTrigger }: QRCodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (resetTrigger) {
      setScanned(false);
    }
  }, [resetTrigger]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    onScanned(data);
  };

  if (!permission) return null;
  if (!permission.granted) return null;

  return (
    <View>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {/* ✅ Test button to simulate scan */}
      {process.env.NODE_ENV !== 'production' && !scanned && (
        <Button
          title="🔧 Simulate QR Scan"
          onPress={() => handleBarCodeScanned({ data: '5HDhVSDYYtrN4uzRBwXcsMDZAzuFDV7yecgiR5JUeWDy' })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    width: '100%',
    height: 400,
    alignSelf: 'center',
    marginTop: 20,
  },
});
