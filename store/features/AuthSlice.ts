import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'
import {UserModel} from "../../models/UserModel";
import {SystemUserModel} from "../../models/SystemUserModel";

export interface AuthState {
    token: string | null | undefined,
    refreshToken: string | null,
    accessTokenExpiry: number,
    refreshTokenExpiry: number,
    connectedUser: SystemUserModel | null,
    isSkipped: boolean,
    isInSignupFlow: boolean
}

const initialState: AuthState = {
    token: null,
    refreshToken: null,
    accessTokenExpiry: null,
    refreshTokenExpiry: null,
    connectedUser: null,
    isSkipped: false,
    isInSignupFlow: false}

export const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateConnectedUser: (state, action: PayloadAction<UserModel | null>) => {
            state.connectedUser = action.payload;
        },
        updateTokens: (state, action: PayloadAction<{
            token: string | null | undefined,
            refreshToken: string | null | undefined,
            accessTokenExpiry: number | null | undefined,
            refreshTokenExpiry: number | null | undefined
        }>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
            state.accessTokenExpiry = action.payload.accessTokenExpiry;
            state.refreshTokenExpiry = action.payload.refreshTokenExpiry;
        },
        updateIsSkipped: (state, action: PayloadAction<boolean>) => {
            state.isSkipped = action.payload;
        },
        updateIsInSignupFlow: (state, action:PayloadAction<boolean>) => {
            state.isInSignupFlow = action.payload;
        },
        performLogout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.connectedUser = null;
            state.isSkipped = false;
        }
    },
})

// Action creators are generated for each case reducer function
export const {updateConnectedUser, updateTokens, performLogout, updateIsSkipped, updateIsInSignupFlow} = AuthSlice.actions

export default AuthSlice.reducer
