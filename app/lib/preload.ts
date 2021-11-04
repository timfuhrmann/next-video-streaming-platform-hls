import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { useRef } from "react";
import { preloadMovie } from "./redux/reducer/movies";

interface PrefetchData {
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

/**
 * React hook to prefetch data on hover.
 *
 * @param {number} id - The item's id.
 * @returns {PrefetchData} An object containing functions to trigger data fetching.
 */
export const usePreload = (id: number): PrefetchData => {
    const router = useRouter();
    const dispatch = useDispatch();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const onClick = () => {
        return router.push({ query: { ...router.query, id: id } }, undefined, {
            shallow: true,
        });
    };

    const onMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            dispatch(preloadMovie({ id }));
        }, 400);
    };

    const onMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    return {
        onClick,
        onMouseEnter,
        onMouseLeave,
    };
};
