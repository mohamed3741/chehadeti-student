import { create, ApisauceInstance } from "apisauce";
import Environement from "../constants/Environement";
import { getSecureData } from "../utils/SecureStorage";
import { DataKey } from "../models/Static";

interface ExtendedApisauceInstance extends ApisauceInstance {
    setOnUnauthorizedCallback: (callback: () => void) => void;
}

let onUnauthorizedCallback;

const apiClient: ExtendedApisauceInstance = create({
    baseURL: Environement.url,
}) as ExtendedApisauceInstance;

apiClient.addAsyncRequestTransform(async (request) => {
    const token = await getSecureData(DataKey.token);
    if (
        !token ||
        request.url.endsWith("/signup") ||
        request.url.endsWith("/login") ||
        request.url.endsWith("/exchange-token") ||
        request.url.endsWith("/refresh-token") ||
        request.url.endsWith("/request-password-reset") ||
        request.url.endsWith("/check-code-for-reset") ||
        request.url.endsWith("/reset-password") ||
        request.url.endsWith("/classes/list")
    )
        return;
    request.headers["Authorization"] = `Bearer ${token}`;
});

apiClient.addResponseTransform((response) => {
    if (response.status === 401 && onUnauthorizedCallback) {
        onUnauthorizedCallback();
    }
});

apiClient.setOnUnauthorizedCallback = (callback) => {
    onUnauthorizedCallback = callback;
};

export default apiClient;
