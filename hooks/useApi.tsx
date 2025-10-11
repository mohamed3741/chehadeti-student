import * as React from "react";
import {useCallback, useState} from "react";
import {ApiResponse} from "apisauce";
import {Toast} from "../components/Toast";
import {uniqBy} from "lodash";
import {useLoader} from "./useLoader";
import {useStateIfMounted} from "use-state-if-mounted";

export const useApi = (apiFunc, isPagination, initData?, errorMsg?, isUseLoader = true,
                       initShouldFetch = true, isUseErrorMsg = true) => {
    const {setLoader, removeLoader} = useLoader();
    const [data, setData] = useStateIfMounted<any>(initData);
    const [responseApi, setResponseApi] = useStateIfMounted<ApiResponse<unknown, unknown>>(null);
    const [error, setError] = useStateIfMounted(false);
    const [page, setPage] = useStateIfMounted(0);
    const [shouldFetch, setShouldFetch] = useStateIfMounted(initShouldFetch);
    const [refreshing, setRefreshing] = useStateIfMounted(false);
    const [isLoading, setIsLoading] = useStateIfMounted(false);

    const onRefresh = React.useCallback(() => {
        setData(initData == null ? initData : []);
        setResponseApi(null)
        setPage(0);
        setRefreshing(true);
        setShouldFetch(true);
    }, []);

    const needMore = useCallback(({distanceFromEnd}) => {
        if (distanceFromEnd < 0) return;
        setShouldFetch(true);
    }, []);


    const request = async (...args): Promise<{ data: any, response: ApiResponse<unknown, unknown> }> => {
        setIsLoading(true)
        if (isUseLoader) setLoader()
        const response: ApiResponse<unknown, unknown> = isPagination ? await apiFunc(page, ...args) : await apiFunc(...args);
        if (isUseLoader) removeLoader()
        setIsLoading(false)

        setShouldFetch(false);
        setRefreshing(false);
        setResponseApi(response)

        if (!response.ok) {
            console.log(`${response.originalError.message} ${response.data?.message}: url (${response.config.url})`);
            if (isUseErrorMsg) {
                errorMsg ? Toast(errorMsg) : Toast(response.originalError?.message)
            }
            setError(true);
            return;
        }


        if (isPagination) {
            const newData = [].concat(response.data);
            setData(uniqBy([...data, ...newData], 'id'));
            setPage(page + 1);
        } else {
            setData(response.data)
        }
        setError(false);
        return {data: response.data, response}
    };

    return {data, error, request, onRefresh, needMore, refreshing, shouldFetch, responseApi, isLoading, setData}
}
