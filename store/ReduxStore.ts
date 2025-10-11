import {configureStore} from '@reduxjs/toolkit'
import LoaderSlice from "./features/LoaderSlice";
import AppConfigSlice from "./features/AppConfigSlice";
import UserNotifSlice from "./features/UserNotifSlice";
import AuthSlice from "./features/AuthSlice";
import LangSlice from "./features/LangSlice";
import WalletSlice from "./features/WalletSlice";
import OnBoardingSlice from "./features/OnBoardingSlice";
import BasketSlice from "./features/BasketSlice";
import CartSlice from "./features/CartSlice";
import restaurantSlice from "./features/restaurantSlice";

export const store = configureStore({
    reducer: {
        loader: LoaderSlice,
        onboarding: OnBoardingSlice,
        appConfig: AppConfigSlice,
        userNotif: UserNotifSlice,
        auth: AuthSlice,
        lang: LangSlice,
        basket: BasketSlice,
        cart: CartSlice,
        wallet: WalletSlice,
        restaurant : restaurantSlice,


    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
