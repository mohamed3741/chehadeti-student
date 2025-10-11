import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'

export interface OnBoardingState {
    isFirstTime: boolean
}

const initialState: OnBoardingState = {
    isFirstTime: true
}

export const OnBoardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {
        updateIsFirstTime: (state, action: PayloadAction<boolean>) => {
            state.isFirstTime = action.payload;
        }
    },
})

export const { updateIsFirstTime} = OnBoardingSlice.actions;

export default OnBoardingSlice.reducer;