import * as actionTypes from '../actions/actionTypes';

export const updateLoading = (activeRoute) => {
    return {
        type: actionTypes.LOADING,
        activeRoute: activeRoute
    };
};
