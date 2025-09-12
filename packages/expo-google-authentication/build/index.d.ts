import { ExpoGoogleAuthenticationAuthorizeOptions, ExpoGoogleAuthenticationAuthorizeResponse, ExpoGoogleAuthenticationConfigureProps, ExpoGoogleAuthenticationLoginResponse } from "./ExpoGoogleAuthentication.types";
import { ExpoGoogleAuthenticationStatusCodes } from "./ExpoGoogleAuthenticationConstants";
export declare function configure(props: ExpoGoogleAuthenticationConfigureProps): void;
export declare function login(): Promise<ExpoGoogleAuthenticationLoginResponse>;
export declare function loginWithoutUserIntent(): Promise<ExpoGoogleAuthenticationLoginResponse>;
export declare function authorize(options: ExpoGoogleAuthenticationAuthorizeOptions): Promise<ExpoGoogleAuthenticationAuthorizeResponse>;
export declare function logout(): Promise<any>;
export declare class CodedError extends Error {
    code: string;
    constructor(code: string, message: string);
}
export { ExpoGoogleAuthenticationConfigureProps, ExpoGoogleAuthenticationStatusCodes, ExpoGoogleAuthenticationLoginResponse, };
//# sourceMappingURL=index.d.ts.map