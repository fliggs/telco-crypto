import { PropsWithChildren } from "react";
import { ImageBackground } from "react-native";

import { getImage } from "@/util";

interface Props extends PropsWithChildren {
  image: string | null | undefined;
}

export default function BackgroundImage({ image, children }: Props) {
  const img = getImage(image);

  return img ? (
    <ImageBackground
      source={img}
      style={{ width: "100%", height: "100%" }}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  ) : (
    children
  );
}
