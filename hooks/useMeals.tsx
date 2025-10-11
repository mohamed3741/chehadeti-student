import { useCallback, useEffect, useState } from 'react';
import { useRestaurant } from "./useRestaurant";
import { useApi } from "./useApi";
import { EnrollementsApi } from "../api/EnrollementsApi";

export const useMeals = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(false);

    const { restaurant } = useRestaurant();

    const getMenu = useApi(
        EnrollementsApi.retrieveSections,
        false,
        null,
        false,
        false
    );
    useEffect(() => {
        fetchMealsData();
    }, [restaurant]);

    const fetchMealsData = async () => {
        setLoading(true);
        try {
            const res = await getMenu.request(restaurant?.id);
            setMenu(res?.data);
            return res?.data
        } catch (error) {
            console.error("Failed to fetch menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshMeals = async () => {
        const updatedMenu = await fetchMealsData();
        setMenu(updatedMenu);
        return updatedMenu;
    };



    return {
        menu,
        refreshMeals,
        loading
    };
};
