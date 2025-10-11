import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/ReduxStore";
import {getUserNotif, setLastNotification} from "../store/features/UserNotifSlice";

export const useNotificationReceived = () => {
    const userNotifState = useSelector((state: RootState) => state.userNotif)
    const dispatch = useDispatch()

    const updateLastNotification = (notif: any) => {
        dispatch(setLastNotification(notif));
        dispatch(getUserNotif(true));
        setTimeout(() => {
            dispatch(setLastNotification(null))
        }, 500)
    }

    const updateUserNotif = (payload: boolean) => {
        dispatch(getUserNotif(payload))
    }

    return {
        lastNotification: userNotifState?.lastNotification,
        getUserNotif: userNotifState?.getUserNotif,
        updateLastNotification,
        updateUserNotif
    }
}
