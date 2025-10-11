import {configureStore} from '@reduxjs/toolkit'
import LoaderSlice from "./features/LoaderSlice";
import AppConfigSlice from "./features/AppConfigSlice";
import UserNotifSlice from "./features/UserNotifSlice";
import AuthSlice from "./features/AuthSlice";
import LangSlice from "./features/LangSlice";

export const store = configureStore({
    reducer: {
        loader: LoaderSlice,
        appConfig: AppConfigSlice,
        userNotif: UserNotifSlice,
        auth: AuthSlice,
        lang: LangSlice,


    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
