import {createSlice} from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit'
import {LangEnum} from "../../models/Static";

export interface LangState {
    currentLang: LangEnum
}

const initialState: LangState = {
    currentLang: null,
}

export const LangSlice = createSlice({
    name: 'lang',
    initialState,
    reducers: {
        updateLang: (state, action: PayloadAction<LangEnum>) => {
            state.currentLang = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const {updateLang} = LangSlice.actions

export default LangSlice.reducer
