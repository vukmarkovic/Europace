import queryCache from "./query.cache";
import { QueryClient } from "react-query";

/**
 * Client to fetch data from and post data to backend API.
 * Configures refetch behaviour, cache and default error handling.
 * @param onErrorFn - default error handler.
 * @see https://react-query-v3.tanstack.com/reference/QueryClient
 */
const createQueryClient = (onErrorFn: (err: unknown) => void) =>
    new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,
                keepPreviousData: true,
                staleTime: Infinity,
                onError: err => onErrorFn(err),
            },
            mutations: {
                onError: err => onErrorFn(err),
            },
        },
        queryCache: queryCache,
    });

export default createQueryClient;
