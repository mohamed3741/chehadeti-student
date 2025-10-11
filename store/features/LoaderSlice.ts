import {createSlice} from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit'

export interface LoaderState {
    isLoading: boolean
}

const initialState: LoaderState = {
    isLoading: false,
}

export const LoaderSlice = createSlice({
    name: 'loader',
    initialState,
    reducers: {
        updateLoader: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const {updateLoader} = LoaderSlice.actions

export default LoaderSlice.reducer
