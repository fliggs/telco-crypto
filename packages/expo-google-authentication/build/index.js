// Import the native module. On web, it will be resolved to ExpoGoogleAuthentication.web.ts
// and on native platforms to ExpoGoogleAuthentication.ts
import { Platform } from "react-native";
import { ExpoGoogleAuthenticationStatusCodes } from "./ExpoGoogleAuthenticationConstants";
import ExpoGoogleAuthenticationModule from "./ExpoGoogleAuthenticationModule";
export function configure(props) {
    if (Platform.OS === "android" || Platform.OS === "ios") {
        // Configure is only necessary for Android.
        ExpoGoogleAuthenticationModule.configure(props);
    }
}
export function login() {
    if (Platform.OS === "ios") {
        return ExpoGoogleAuthenticationModule.signIn();
    }
    else if (Platform.OS === "android") {
        return ExpoGoogleAuthenticationModule.loginFromUserAction();
    }
    return Promise.reject(new CodedError(ExpoGoogleAuthenticationStatusCodes.UNSUPPORTED_PLATFORM, "Unsupported platform"));
}
export function loginWithoutUserIntent() {
    if (Platform.OS === "ios") {
        return ExpoGoogleAuthenticationModule.signIn();
    }
    else if (Platform.OS === "android") {
        return ExpoGoogleAuthenticationModule.loginWithoutUserAction();
    }
    return Promise.reject(new CodedError(ExpoGoogleAuthenticationStatusCodes.UNSUPPORTED_PLATFORM, "Unsupported platform"));
}
export function authorize(options) {
    return ExpoGoogleAuthenticationModule.authorize(options);
}
export function logout() {
    return ExpoGoogleAuthenticationModule.logout();
}
// Export for testing
export class CodedError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
export { ExpoGoogleAuthenticationStatusCodes, };
//# sourceMappingURL=index.js.map