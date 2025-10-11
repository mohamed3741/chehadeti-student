import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'

export interface WalletState {
    wallet: number
}

const initialState: WalletState = {
    wallet: 0,
}

export const WalletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        updateWallet: (state, action: PayloadAction<number>) => {
            state.wallet = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const {updateWallet} = WalletSlice.actions

export default WalletSlice.reducer
