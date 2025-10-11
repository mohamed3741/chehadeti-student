import { useCallback, useEffect, useState } from 'react';
import { useRestaurant } from "./useRestaurant";
import { useApi } from "./useApi";
import { EnrollementsApi } from "../api/EnrollementsApi";
import { useLoader } from "./useLoader";

export const useSupplements = () => {
    const [supplements, setSupplements] = useState([]);
    const [countDisponible, setCountDisponible] = useState(0);
    const [countIndisponible, setCountIndisponible] = useState(0);
    const { setLoader, removeLoader } = useLoader();
    const { restaurant } = useRestaurant();

    const getSupplementList = useApi(
        EnrollementsApi.getSupplementList,
        false,
        null,
        false,
        false
    );

    useEffect(() => {
        fetchSupplementData();
    }, [restaurant]);

    useEffect(() => {
        calculateCounts(supplements);
    }, [supplements]);

    const fetchSupplementData = async () => {
        try {
            setLoader();
            const res = await getSupplementList.request(restaurant?.id);
            setSupplements(res?.data || []);
        } catch (error) {
            console.error("Failed to fetch supplements:", error);
        } finally {
            removeLoader();
        }
    };

    const calculateCounts = (supplementsData) => {
        const disponibleCount = supplementsData.filter(
            (supplement) =>
                supplement?.availability === null ||
                supplement?.availability?.available === true
        ).length;

        const indisponibleCount = supplementsData.filter(
            (supplement) => supplement?.availability?.available === false
        ).length;

        setCountDisponible(disponibleCount);
        setCountIndisponible(indisponibleCount);
    };

    const refreshSupplements = async () => {
        await fetchSupplementData();
    };

    return {
        supplements,
        countDisponible,
        countIndisponible,
        refreshSupplements,
    };
};
