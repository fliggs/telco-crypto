declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "react-native-freshchat-sdk" {
  class Freshchat {
    static readonly EVENT_USER_RESTORE_ID_GENERATED: string;

    static init(config: FreshchatConfig): void;
    static showFAQs(): void;
    static showConversations(): void;
    static getUser(
      cb: (
        user: FreshchatUser & { externalId: string; restoreId: string }
      ) => void
    ): void;
    static setUser(user: FreshchatUser, cb: (err: any) => void): void;
    static resetUser(): void;
    static identifyUser(
      externalId: string,
      restoreId: string | null,
      cb: (err: any) => void
    ): void;
    static addEventListener(
      event: EVENT_USER_RESTORE_ID_GENERATED,
      cb: () => void
    ): void;
    static removeEventListeners(event: EVENT_USER_RESTORE_ID_GENERATED): void;
  }

  class FreshchatConfig {
    domain: string;
    cameraCaptureEnabled: boolean;
    gallerySelectionEnabled: boolean;
    responseExpectationEnabled: boolean;
    fileSelectionEnabled: boolean;
    constructor(appId: string, appKey: string);
  }

  class FreshchatUser {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    phoneCountryCode: string;
    constructor();
  }
}
