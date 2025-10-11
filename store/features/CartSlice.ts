import type {PayloadAction} from '@reduxjs/toolkit'
import {createSlice} from '@reduxjs/toolkit'
import {CartModel} from "../../models/CartModel";

export interface CartState {
    cart: CartModel[] | null
}

const initialState: CartState = {
    cart: []
}

export const CartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        updateCart: (state, action: PayloadAction<CartModel[] | null>) => {
            state.cart = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const {updateCart} = CartSlice.actions

export default CartSlice.reducer
