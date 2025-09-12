import { WebView } from "react-native-webview";
import { Dimensions, View, StyleSheet, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Spacing } from "@/constants";

const { width, height } = Dimensions.get("window");
type TMobileWebContentProps = {
  setShowCoverage: (value: boolean) => void;
  zipCode?: string;
  encodedAddress?: string;
};

const TMobileWebContent = ({
  setShowCoverage,
  encodedAddress,
}: TMobileWebContentProps) => {
  const handleClose = () => {
    console.log("Close icon pressed");
    setShowCoverage(false);
  };
  const url = `https://example.com/coverageapp?address=${encodedAddress}`;
  const injectedJS = `
    (function scrollToDiv() {
      var maxTries = 10;
      var attempt = 0;

      function tryScroll() {
        var target = document.querySelector(".cmp-container--body");

        if (target) {
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
          window.ReactNativeWebView.postMessage("✅ Scrolled to .cmp-container--body");
        } else if (attempt < maxTries) {
          attempt++;
          setTimeout(tryScroll, 500);
        } else {
          window.ReactNativeWebView.postMessage("❌ Failed to find .cmp-container--body");
        }
      }

      tryScroll();
    })();
    true; // Required for Android
  `;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <AntDesign name="close" size={24} color="white" />
      </TouchableOpacity>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        androidHardwareAccelerationDisabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        setSupportMultipleWindows={false}
        originWhitelist={["*"]}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1"
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        renderToHardwareTextureAndroid={true}
        injectedJavaScript={injectedJS}
        onMessage={(event) => console.log("WebView:", event.nativeEvent.data)}
      />
    </View>
  );
};

export default TMobileWebContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000",
  },
  webview: {
    width: width,
    height: height * 0.85,
    marginTop: Spacing.LARGE * 2,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.SMALL,
    right: Spacing.SMALL,
    width: 44,
    height: 44,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
});
