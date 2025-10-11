import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'
import {BasketModel} from "../../models/BasketModel";

export interface BasketState {
    basket: BasketModel[] | null
}

const initialState: BasketState = {
    basket: []
}

export const BasketSlice = createSlice({
    name: 'basket',
    initialState,
    reducers: {
        updateBasket: (state, action: PayloadAction<BasketModel[] | null>) => {
            state.basket = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const {updateBasket} = BasketSlice.actions

export default BasketSlice.reducer
