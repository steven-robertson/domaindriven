export const actionTypes = {
    reset: 'contextList/reset',

    subscribeToContextList: 'contextList/subscribeToContextList',
    subscribeToContextListCallback: 'contextList/subscribeToContextListCallback',
    unsubscribeFromContextList: 'contextList/unsubscribeFromContextList',
    receiveContextListQueryResult: 'contextList/receiveContextListQueryResult',

    subscribeToContextListTotal: 'contextList/subscribeToContextListTotal',
    subscribeToContextListTotalCallback: 'contextList/subscribeToContextListTotalCallback',
    unsubscribeFromContextListTotal: 'contextList/unsubscribeFromContextListTotal',
    receiveContextListTotal: 'contextList/receiveContextListTotal',
};

export const reset = () => ({
    type: actionTypes.reset
});

export const subscribeToContextList = (limit, offset, sortBy) => ({
    type: actionTypes.subscribeToContextList,
    limit, offset, sortBy
});

export const subscribeToContextListCallback = (error, data) => ({
    type: actionTypes.subscribeToContextListCallback,
    error, data
});

export const unsubscribeFromContextList = () => ({
    type: actionTypes.unsubscribeFromContextList
});

export const receiveContextListQueryResult = (result) => ({
    type: actionTypes.receiveContextListQueryResult,
    result
});

export const subscribeToContextListTotal = () => ({
    type: actionTypes.subscribeToContextListTotal
});

export const subscribeToContextListTotalCallback = (error, data) => ({
    type: actionTypes.subscribeToContextListTotalCallback,
    error, data
});

export const unsubscribeFromContextListTotal = () => ({
    type: actionTypes.unsubscribeFromContextListTotal
});

export const receiveContextListTotal = (total) => ({
    type: actionTypes.receiveContextListTotal,
    total
});
