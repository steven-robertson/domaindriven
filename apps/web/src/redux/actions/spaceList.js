export const actionTypes = {
    reset: 'spaceList/reset',

    subscribeToSpaceList: 'spaceList/subscribeToSpaceList',
    subscribeToSpaceListCallback: 'spaceList/subscribeToSpaceListCallback',
    unsubscribeFromSpaceList: 'spaceList/unsubscribeFromSpaceList',
    receiveSpaceListQueryResult: 'spaceList/receiveSpaceListQueryResult',

    subscribeToSpaceListTotal: 'spaceList/subscribeToSpaceListTotal',
    subscribeToSpaceListTotalCallback: 'spaceList/subscribeToSpaceListTotalCallback',
    unsubscribeFromSpaceListTotal: 'spaceList/unsubscribeFromSpaceListTotal',
    receiveSpaceListTotal: 'spaceList/receiveSpaceListTotal',
};

export const reset = () => ({
    type: actionTypes.reset
});

export const subscribeToSpaceList = (limit, offset, sortBy) => ({
    type: actionTypes.subscribeToSpaceList,
    limit, offset, sortBy
});

export const subscribeToSpaceListCallback = (error, data) => ({
    type: actionTypes.subscribeToSpaceListCallback,
    error, data
});

export const unsubscribeFromSpaceList = () => ({
    type: actionTypes.unsubscribeFromSpaceList
});

export const receiveSpaceListQueryResult = (result) => ({
    type: actionTypes.receiveSpaceListQueryResult,
    result
});

export const subscribeToSpaceListTotal = () => ({
    type: actionTypes.subscribeToSpaceListTotal
});

export const subscribeToSpaceListTotalCallback = (error, data) => ({
    type: actionTypes.subscribeToSpaceListTotalCallback,
    error, data
});

export const unsubscribeFromSpaceListTotal = () => ({
    type: actionTypes.unsubscribeFromSpaceListTotal
});

export const receiveSpaceListTotal = (total) => ({
    type: actionTypes.receiveSpaceListTotal,
    total
});
