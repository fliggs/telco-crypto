import { VolumeType } from "api-client-ts";
import Decimal from "decimal.js";
import { DimensionValue, Platform, ViewStyle } from "react-native";
import SimCardsManagerModule from "react-native-sim-cards-manager";
import * as Device from "expo-device";
import QuickCrypto from "react-native-quick-crypto";

import { PartialAddress } from "./components/AddressInput";

export function getImage(image: string | null | undefined) {
  // TODO: Add images
  return null;
}

export async function extractErrorMsg(err: unknown) {
  let msg = "Unknown error";
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    typeof err.response === "object" &&
    err.response instanceof Response
  ) {
    const resp = await err.response.text();
    try {
      const json = JSON.parse(resp);
      if ("message" in json) {
        msg = json.message;
      }
    } catch {
      msg = resp;
    }
  } else if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof err.message === "string"
  ) {
    msg = err.message;
  } else {
    msg = JSON.stringify(err);
  }
  return msg;
}

export async function logError(err: unknown) {
  try {
    const msg = await extractErrorMsg(err).catch(
      (err) => `LOG ERROR: ${err.message}`
    );
    console.error("ERROR", msg, err);
  } catch (err) {
    console.error("ERROR", err);
  }
}

export function coverageToWords(coverage: number | null) {
  if (coverage === null) {
    return "Unknown";
  } else if (coverage >= 1) {
    return "Excellent";
  } else if (coverage >= 0.75) {
    return "Great";
  } else if (coverage >= 0.5) {
    return "Good";
  } else if (coverage >= 0.25) {
    return "Fair";
  } else {
    return "Poor";
  }
}
export function filterByPeriod(
  data: { timestamp: number; value: number }[],
  period: string
) {
  const now = Date.now();
  let months = 12;
  if (period === "3m") months = 3;
  else if (period === "36m") months = 36;

  const cutoff = now - months * 30 * 24 * 60 * 60 * 1000;

  return data.filter((item) => item.timestamp >= cutoff);
}

export function formatCost(
  cost: string | number | Decimal | undefined | null,
  currency: boolean = true
) {
  if (!cost) {
    return null;
  }

  const c = Decimal(cost);
  const abs = c.abs();
  return `${c.lt(0) ? "-" : ""} ${currency ? "$" : ""}${abs.toFixed(2)}`;
}

export function splitNumber(
  cost: number | string | Decimal | undefined | null
) {
  if (!cost) {
    return null;
  }
  const [entier, decimal] = cost.toString().split(".");
  return {
    entier: parseInt(entier, 10),
    decimal: decimal ? parseInt(decimal, 10) : 0,
  };
}

export function formatVolume(type: VolumeType, amount: string) {
  if (type === VolumeType.Data) {
    return formatData(amount);
  } else if (type === VolumeType.Call) {
    const min = Decimal(amount).div(60).toFixed(0);
    return `${min} min.`;
  } else if (type === VolumeType.Text) {
    return `${amount} msg.`;
  } else {
    return amount;
  }
}

export function formatData(amount: string | undefined | null) {
  if (!amount) {
    return "";
  }

  const num = Decimal(amount);
  let value = num.toFixed(2);
  let suffix = "B";

  if (num.gte(1_000_000_000)) {
    value = num.div(1_000_000_000).toFixed(2);
    suffix = "GB";
  } else if (num.gte(1_000_000)) {
    value = num.div(1_000_000).toFixed(2);
    suffix = "MB";
  } else if (num.gte(1_000)) {
    value = num.div(1000).toFixed(2);
    suffix = "KB";
  }

  while (value.endsWith("0")) {
    value = value.substring(0, value.length - 1);
  }
  value = value.endsWith(".") ? value.substring(0, value.length - 1) : value;

  return `${value} ${suffix}`;
}

export function formatPhoneNum(num: string | null | undefined) {
  if (!num) {
    return null;
  }
  return `(${num.substring(0, 3)}) ${num.substring(3, 6)}-${num.substring(6)}`;
}

export function isNewerVersion(first: string, second: string) {
  const firstSplits = first.split(".").map(Number);
  const secondSplits = second.split(".").map(Number);
  if (firstSplits[0] != secondSplits[0]) {
    return firstSplits[0] > secondSplits[0];
  }
  if (firstSplits[1] != secondSplits[1]) {
    return firstSplits[1] > secondSplits[1];
  }
  return firstSplits[2] >= secondSplits[2];
}

export const getCheckIconStyle = (
  index: number,
  offersCount: number,
  width: number
): ViewStyle => {
  const topPosition = index < 3 ? 55 : 135;
  let leftPosition: DimensionValue;

  if (index < 3 && offersCount > 3) {
    leftPosition = ((width - 40 + 8 * index) / 3) * index + 40;
  } else if (index < 4 && (index === 0 || index === 3)) {
    leftPosition = "20%";
  } else {
    leftPosition = "71%";
  }

  return {
    position: "absolute",
    top: topPosition,
    left: leftPosition,
    zIndex: index < 3 ? 1 : 0,
  };
};

export function getValidUntilDate(validForSeconds: number): string {
  const now = new Date();
  const validUntil = new Date(now.getTime() + validForSeconds * 1000);

  const month = (validUntil.getMonth() + 1).toString().padStart(2, "0");
  const day = validUntil.getDate().toString().padStart(2, "0");
  const year = validUntil.getFullYear();

  return `${month}/${day}/${year}`;
}

export async function checkESimSupport() {
  let supported = false;
  if (Platform.OS === "ios") {
    const modelId = Device.modelId;
    const majorVersion = parseInt(
      modelId.replace("iPhone", "").split(",")[0],
      10
    );
    supported = majorVersion >= 12;
  } else if (Platform.OS === "android") {
    supported = await SimCardsManagerModule?.isEsimSupported?.();
  } else {
    throw new Error("Unsupported platform");
  }

  return supported;
}

export const isAddressEqual = (
  a: PartialAddress,
  b: PartialAddress
): boolean => {
  const keys = Object.keys(a) as (keyof PartialAddress)[];
  for (const key of keys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};
export function shuffle<T>(origArray: T[]): T[] {
  const array = [...origArray];
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function keyFromPassword(password: string, salt: Buffer) {
  const ITER = 10;
  const LEN = 32;
  const DIGEST = "SHA-256";
  return QuickCrypto.pbkdf2Sync(Buffer.from(password), salt, ITER, LEN, DIGEST);
}

export async function encrypt(password: string, data: string) {
  const salt = QuickCrypto.randomBytes(16) as unknown as Buffer;
  const key = keyFromPassword(password, salt);

  const iv = QuickCrypto.randomBytes(12);
  const cipher = QuickCrypto.createCipheriv("aes-256-gcm", key, iv);
  let encryptedData = cipher.update(data, "utf-8", "base64");
  encryptedData += cipher.final("base64");

  const tag = cipher.getAuthTag();

  return {
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    enc: encryptedData,
  };
}

export async function decrypt(
  password: string,
  encData: string
): Promise<string> {
  const { enc, ...json } = JSON.parse(encData);
  const salt = Buffer.from(json.salt, "base64");
  const iv = Buffer.from(json.iv, "base64");
  const tag = Buffer.from(json.tag, "base64");

  const key = keyFromPassword(password, salt);

  const decipher = QuickCrypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(enc, "base64", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

export function clampArray(existing: string[], max: number) {
  for (let i = existing.length; i < max; i++) {
    existing.push("");
  }
  return existing.slice(0, max);
}

export type Currency = "USD" | "BTC" | "SOL" | "ETH";

export function convert(
  amount: number,
  price: number,
  from: "USD" | "CRYPTO"
): number {
  if (from === "USD") {
    // USD → Crypto
    return amount / price;
  } else {
    // Crypto → USD
    return amount * price;
  }
}
