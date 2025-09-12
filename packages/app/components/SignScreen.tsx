import { useCallback } from "react";

import { useWallet } from "@/providers/WalletProvider";

import Button from "./Button";
import SafeView from "./SafeView";
import Text, { TextVariant } from "./Text";
import { useApi } from "@/providers/ApiProvider";

interface Props {
  orderId: string;
  message: string | null | undefined;
}

export default function SignScreen({ orderId, message }: Props) {
  const { sign } = useWallet();
  const { meApi } = useApi();

  const handleSign = useCallback(async () => {
    if (!message) {
      return;
    }

    const signature = await sign(message);

    await meApi.meUpdateMyOrderStepSignV1({
      orderId,
      updateMyOrderStepSignDto: {
        signature,
      },
    });
  }, [message]);

  return (
    <SafeView dark>
      <Text variant={TextVariant.H3}>Wallet sign</Text>

      <Text>{message}</Text>

      <Button onPress={handleSign}>Sign</Button>
    </SafeView>
  );
}
