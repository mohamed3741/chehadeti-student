import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'

export interface AppConfigState {
    appConfig: any
}

const initialState: AppConfigState = {
    appConfig: {
        facebook: "",
        instagram: "",
        isCommercialUsed: false,
        isNearbyConfirmationEnabled: false,
        nearbyConfirmationDistance: 500,
        notificationStepCount: 5,
        offline: false,
        offlineMessage: null,
        supportHelpMail: "help@tanker.ae",
        supportMail: "support@tanker.ae",
        supportTel: "00971554818345",
        twitter: null,
    }
}

export const AppConfigSlice = createSlice({
    name: 'appConfig',
    initialState,
    reducers: {
        updateAppConfig: (state, action: PayloadAction<any>) => {
            state.appConfig = action.payload;
        }
    }
})

// Action creators are generated for each case reducer function
export const {updateAppConfig} = AppConfigSlice.actions

export default AppConfigSlice.reducer
