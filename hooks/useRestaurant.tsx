import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {setSelectedRestaurant} from "../store/features/restaurantSlice";
import {RootState} from "../store/ReduxStore";
import {useAuth} from "./useAuth";

export const useRestaurant = () => {
    const dispatch = useDispatch();

    const {connectedUser} = useAuth();

    const selectedRestaurant = useSelector((state : RootState) => state.restaurant.selectedRestaurant);

    const updateRestaurant = useCallback((restaurant) => {
        dispatch(setSelectedRestaurant(restaurant));
    }, [connectedUser,dispatch]);

    return {
        restaurant: selectedRestaurant,
        updateRestaurant,
    };
};
