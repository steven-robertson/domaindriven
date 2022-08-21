export const actionTypes = {
    reset: 'modelList/reset',

    subscribeToModelList: 'modelList/subscribeToModelList',
    subscribeToModelListCallback: 'modelList/subscribeToModelListCallback',
    unsubscribeFromModelList: 'modelList/unsubscribeFromModelList',
    receiveModelListQueryResult: 'modelList/receiveModelListQueryResult',

    subscribeToModelListTotal: 'modelList/subscribeToModelListTotal',
    subscribeToModelListTotalCallback: 'modelList/subscribeToModelListTotalCallback',
    unsubscribeFromModelListTotal: 'modelList/unsubscribeFromModelListTotal',
    receiveModelListTotal: 'modelList/receiveModelListTotal',
};

export const reset = () => ({
    type: actionTypes.reset
});

export const subscribeToModelList = (limit, offset, sortBy) => ({
    type: actionTypes.subscribeToModelList,
    limit, offset, sortBy
});

export const subscribeToModelListCallback = (error, data) => ({
    type: actionTypes.subscribeToModelListCallback,
    error, data
});

export const unsubscribeFromModelList = () => ({
    type: actionTypes.unsubscribeFromModelList
});

export const receiveModelListQueryResult = (result) => ({
    type: actionTypes.receiveModelListQueryResult,
    result
});

export const subscribeToModelListTotal = () => ({
    type: actionTypes.subscribeToModelListTotal
});

export const subscribeToModelListTotalCallback = (error, data) => ({
    type: actionTypes.subscribeToModelListTotalCallback,
    error, data
});

export const unsubscribeFromModelListTotal = () => ({
    type: actionTypes.unsubscribeFromModelListTotal
});

export const receiveModelListTotal = (total) => ({
    type: actionTypes.receiveModelListTotal,
    total
});
