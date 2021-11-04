import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../lib/redux";
import { preloadMovie } from "../../lib/redux/reducer/movies";
import { fillParent, square } from "../../css/content";
import { deleteParamFromQuery } from "../../lib/util";
import { PopUpOpener } from "../molecule/PopUpOpener";
import { BlockTeaser } from "../molecule/BlockTeaser";
import { getRecommendations } from "../../lib/api/tmdb";
import { IconX } from "../../icon/IconX";

const PopUpWrapper = styled.div`
    ${fillParent};
    position: fixed;
    display: flex;
    flex-direction: column;
`;

const PopUpFrame = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow-y: auto;
`;

const PopUpStage = styled.div`
    position: relative;
    z-index: 1;
    flex: 1;
    width: 100%;
    max-width: 90rem;
    margin: 5rem auto 0;
    padding-bottom: 5rem;
    background-color: ${p => p.theme.gray100};
`;

const PopUpBody = styled.div`
    margin-top: 8rem;
`;

const PopUpRow = styled.div`
    margin-top: 4rem;

    &:first-child {
        margin: 0;
    }
`;

const PopUpOverlay = styled.button`
    ${fillParent};
    background-color: ${p => p.theme.black};
    opacity: 0.75;
`;

const PopUpClose = styled.button`
    position: absolute;
    z-index: 1;
    top: 2rem;
    right: 2rem;
    ${square("2rem")};

    &::after {
        content: "";
        position: absolute;
        z-index: -1;
        top: 50%;
        left: 50%;
        ${square("2.5rem")};
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background-color: ${p => p.theme.gray50};
        opacity: 0.5;
    }
`;

const CloseIcon = styled(IconX)`
    ${square("2rem")};
`;

export const MoviePopUp: React.FC = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { id } = router.query;
    const { entities, fetchRequests } = useSelector((state: RootState) => state.movies);
    const [movie, setMovie] = useState<Api.MovieDetails | null>(null);
    const [recommendations, setRecommendations] = useState<Api.Movie[] | null>(null);

    useEffect(() => {
        if (!id || typeof id !== "string") {
            setMovie(null);
            return;
        }

        const numId = parseInt(id);

        const entity = entities[numId];

        if (entity) {
            document.documentElement.classList.add("no-scroll");
            setMovie(entity);
        } else if (!fetchRequests.includes(numId)) {
            dispatch(preloadMovie({ id: numId }));
        }

        return () => document.documentElement.classList.remove("no-scroll");
    }, [id, entities]);

    useEffect(() => {
        if (!id || typeof id !== "string") {
            return;
        }

        getRecommendations(parseInt(id)).then(setRecommendations);

        return () => setRecommendations(null);
    }, [id]);

    const handleClose = () => {
        const query = deleteParamFromQuery(router.query, "id");

        return router.push({ query }, undefined, {
            shallow: true,
        });
    };

    if (!movie) return null;

    return (
        <PopUpWrapper>
            <PopUpFrame key={movie.id}>
                <PopUpStage>
                    <PopUpOpener {...movie} />
                    <PopUpBody>
                        {recommendations && (
                            <PopUpRow>
                                <BlockTeaser
                                    headline="You could also like"
                                    movies={recommendations}
                                />
                            </PopUpRow>
                        )}
                    </PopUpBody>
                    <PopUpClose type="button" onClick={handleClose}>
                        <CloseIcon />
                    </PopUpClose>
                </PopUpStage>
                <PopUpOverlay type="button" onClick={handleClose} />
            </PopUpFrame>
        </PopUpWrapper>
    );
};
