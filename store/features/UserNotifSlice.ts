import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'

export interface IMsgCount {
    count: number | null,
    orderId: number | null
}

export interface UserNotifState {
    getUserNotif: boolean,
    lastNotification: any,
    orderMsgCount: IMsgCount,
    currentOrdersCount: number | null,
    supportMsgCount: IMsgCount
}

const initialState: UserNotifState = {
    getUserNotif: true,
    lastNotification: null,
    orderMsgCount: {
        count: 0,
        orderId: null
    },
    currentOrdersCount: 0,
    supportMsgCount: {
        count: 0,
        orderId: null
    }
}

export const UserNotifSlice = createSlice({
    name: 'userNotif',
    initialState,
    reducers: {
        getUserNotif: (state, action: PayloadAction<boolean>) => {
            state.getUserNotif = action.payload;
        },
        updateOrderMsgCount: (state, action: PayloadAction<IMsgCount>) => {
            state.orderMsgCount = action.payload;
        },
        updateSupportMsgCount: (state, action: PayloadAction<IMsgCount>) => {
            state.supportMsgCount = action.payload;
        },
        setLastNotification: (state, action: PayloadAction<any>) => {
            state.lastNotification = action.payload;
        },
        updateCurrentOrderCount: (state, action: PayloadAction<number>) => {
            state.currentOrdersCount = action.payload;
        }
    }
})

// Action creators are generated for each case reducer function
export const {getUserNotif, setLastNotification, updateOrderMsgCount, updateSupportMsgCount, updateCurrentOrderCount} = UserNotifSlice.actions

export default UserNotifSlice.reducer
