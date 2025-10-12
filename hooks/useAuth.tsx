import {clearData, getData, storeData} from "../utils/AsyncStorage";
import {DataKey} from "../models/Static";
import {clearSecureData, getSecureData, storeSecureData} from "../utils/SecureStorage";
import {UserApi} from "../api/UserApi";
import {decodeJwt} from "../utils/JwtHelper";
import {useLang} from "./useLang";
import * as Application from "expo-application";
import {useNotificationReceived} from "./useNotificationReceived";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/ReduxStore";
import {
    performLogout,
    updateConnectedUser, updateIsInSignupFlow,
    updateIsSkipped,
    updateTokens
} from "../store/features/AuthSlice";
import {useEffect} from "react";
import apiClient from "../api/ApiClient";
import {logOutUser} from "../utils/logOutUtils";

export const useAuth = () => {
    const stateAuth = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch()

    const {updateUserNotif} = useNotificationReceived();
    const {currentLangApiEnum} = useLang();

    useEffect(() => {
        apiClient.setOnUnauthorizedCallback(async () => {
            await logOut();
        });
    },[]);

    const storeToken = async (token, refreshToken, accessTokenExpiry, refreshTokenExpiry) => {
        dispatch(updateTokens({token, refreshToken, accessTokenExpiry, refreshTokenExpiry}));
        await storeSecureData(DataKey.token, token);
        await storeSecureData(DataKey.refreshToken, refreshToken);
        await storeSecureData(DataKey.accessTokenExpiry, accessTokenExpiry.toString());
        await storeSecureData(DataKey.refreshTokenExpiry, refreshTokenExpiry.toString());
        await refreshUser()
        updateUserNotif(true)
        await unSkip()

    }
    const signupInProgress = async (status:boolean) => {
        dispatch(updateIsInSignupFlow(status));
    }

    const skip = async () => {
        await storeData(DataKey.isSkipped, 'true');
        dispatch(updateIsSkipped(true));
    }


    const unSkip = async () => {
        await storeData(DataKey.isSkipped, 'false');
        dispatch(updateIsSkipped(false));
    }

    const checkSkipped = async () => {
        const isSkipped = await getData(DataKey.isSkipped);
        dispatch(updateIsSkipped(isSkipped === 'true'));
        return isSkipped === 'true';
    }

    const refreshUser = async () => {
        const decoded = await decodeJwt();
        const isSkipped = await checkSkipped();
        if (!decoded && !isSkipped) return await logOut();
        dispatch(updateTokens({
            token: decoded?.token,
            refreshToken: decoded?.refreshToken,
            accessTokenExpiry: parseInt(decoded?.accessTokenExpiry),
            refreshTokenExpiry: parseInt(decoded?.refreshTokenExpiry)
        }));
        if (decoded) {
            const result = await UserApi.getMe();
            if (result.ok) {
                dispatch(updateConnectedUser(result?.data))
            } else if (result.status === 403) {
                await logOut()
            }
        } else {
            dispatch(updateConnectedUser(null))
        }

    }


    const logOut = async () => {
        await logOutUser((value) => dispatch(updateIsSkipped(value)), () => dispatch(performLogout()));
    }



    const saveNotificationToken = async (token) => {
        if (stateAuth?.connectedUser) {
            const lang = await currentLangApiEnum();
            const body = token ? {
                    userId: stateAuth?.connectedUser?.id,
                    username: stateAuth?.connectedUser?.username,
                    lang,
                    version: Application.nativeApplicationVersion,
                    ...token
                } :
                {
                    userId: stateAuth?.connectedUser?.id,
                    username: stateAuth?.connectedUser?.username,
                    token: null,
                    expoToken: null
                }
            //await UserApi.saveUserDevice(body)
        }
    }

    const rememberUser = async (body) => {
        await storeSecureData(DataKey.rememberedUser, JSON.stringify(body));
    }

    const clearRememberedUser = async () => {
        await clearSecureData(DataKey.rememberedUser);
    }

    const getRememberedUser = async (): Promise<{
        password: string,
        emailOrPhone : string,
        tel: string,
        telCode: string,
        code: string
    }> => {
        const user = await getSecureData(DataKey.rememberedUser);
        return user ? JSON.parse(user) : null
    }

    const getTmpPass = async () => {
        return await getSecureData(DataKey.tmpPass);
    }

    const setTmpPass = async (tmpPass) => {
        tmpPass ? await storeSecureData(DataKey.tmpPass, tmpPass) :
            await clearSecureData(DataKey.tmpPass);
    }


    return {
        logOut,
        connectedUser: stateAuth.connectedUser,
        token: stateAuth.token,
        refreshToken: stateAuth.refreshToken,
        accessTokenExpiry: stateAuth.accessTokenExpiry,
        refreshUser,
        storeToken,
        signupInProgress,
        skip,
        unSkip,
        checkSkipped,
        saveNotificationToken,
        isSkipped: stateAuth.isSkipped,
        rememberUser,
        getRememberedUser,
        clearRememberedUser,
        getTmpPass,
        setTmpPass,
        isInSignupFlow:stateAuth.isInSignupFlow
    }
}
