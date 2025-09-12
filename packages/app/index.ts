import "react-native-quick-base64";
import { install } from "react-native-quick-crypto";
import { install as installSolana } from "@solana/webcrypto-ed25519-polyfill";

install();

installSolana();

import "react-native-polyfill-globals/auto";
import "react-native-get-random-values";

// Polyfill AbortSignal.throwIfAborted
if (
  typeof AbortSignal !== "undefined" &&
  !AbortSignal.prototype.throwIfAborted
) {
  AbortSignal.prototype.throwIfAborted = function () {
    console.log("ABORTED", this.aborted);
    if (this.aborted) {
      const err = new DOMException("Aborted", "AbortError");
      throw err;
    }
  };
}

import "expo-router/entry";
