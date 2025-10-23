import { create, ApisauceInstance } from "apisauce";
import Environement from "../constants/Environement";
import { getSecureData } from "../utils/SecureStorage";
import { DataKey } from "../models/Static";
import { RefreshTokenDto } from "../models/UserModel";
import { storeSecureData } from "../utils/SecureStorage";
import { isRefreshTokenExpired } from "../utils/JwtHelper";
import { Endpoints } from "./Endpoints";

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

apiClient.addResponseTransform(async (response) => {
    if (response.status === 401) {
        // Don't try to refresh token for auth endpoints
        if (response.config?.url?.endsWith("/login") || 
            response.config?.url?.endsWith("/signup") ||
            response.config?.url?.endsWith("/refresh-token") ||
            response.config?.url?.endsWith("/exchange-token") ||
            response.config?.url?.endsWith("/request-password-reset") ||
            response.config?.url?.endsWith("/check-code-for-reset") ||
            response.config?.url?.endsWith("/reset-password")) {
            if (onUnauthorizedCallback) {
                onUnauthorizedCallback();
            }
            return;
        }

        // Try to refresh the token
        try {
            const refreshToken = await getSecureData(DataKey.refreshToken);
            if (refreshToken) {
                // Check if refresh token is expired
                const isRefreshExpired = await isRefreshTokenExpired();
                if (isRefreshExpired) {
                    console.log('Refresh token is expired, logging out');
                    if (onUnauthorizedCallback) {
                        onUnauthorizedCallback();
                    }
                    return;
                }

                const refreshTokenDto: RefreshTokenDto = { refreshToken };
                const refreshResult = await apiClient.post(`${Environement.url}${Endpoints.CHEHADETI}/users/refresh-token`, refreshTokenDto);
                
                if (refreshResult.ok && refreshResult.data) {
                    const loginData = refreshResult.data;
                    await storeSecureData(DataKey.token, loginData.access_token);
                    await storeSecureData(DataKey.refreshToken, loginData.refresh_token);
                    await storeSecureData(DataKey.accessTokenExpiry, loginData.expires_in.toString());
                    await storeSecureData(DataKey.refreshTokenExpiry, loginData.refresh_expires_in.toString());
                    
                    // Retry the original request with the new token
                    if (response.config) {
                        response.config.headers["Authorization"] = `Bearer ${loginData.access_token}`;
                        // Note: We can't retry the request here as apisauce doesn't support it in response transform
                        // The request will need to be retried by the calling code
                    }
                    return;
                }
            }
        } catch (error) {
            console.error('Error refreshing token in response transform:', error);
        }
        
        // If refresh failed or no refresh token, call the unauthorized callback
        if (onUnauthorizedCallback) {
            onUnauthorizedCallback();
        }
    }
});

apiClient.setOnUnauthorizedCallback = (callback) => {
    onUnauthorizedCallback = callback;
};

export default apiClient;
