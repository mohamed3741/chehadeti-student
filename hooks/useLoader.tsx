import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/ReduxStore";
import {updateLoader} from '../store/features/LoaderSlice'

export const useLoader = () => {
    const isLoading = useSelector((state: RootState) => state.loader.isLoading)
    const dispatch = useDispatch()

    const setLoader = () => {
        dispatch(updateLoader(true))
    }

    const removeLoader = () => {
        dispatch(updateLoader(false))
    }

    return {
        setLoader,
        removeLoader,
        isLoading: isLoading
    }
}
