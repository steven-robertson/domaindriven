export const actionTypes = {
    getAuthInfo: 'user/getAuthInfo',
    setAuthInfo: 'user/setAuthInfo',
    resetUserInfo: 'user/resetUserInfo',

    subscribeToUserInfo: 'user/subscribeToUserInfo',
    subscribeToUserInfoCallback: 'user/subscribeToUserInfoCallback',
    unsubscribeFromUserInfo: 'user/unsubscribeFromUserInfo',
    receiveUserInfoQueryResult: 'user/receiveUserInfoQueryResult',
};

export const getAuthInfo = () => ({
    type: actionTypes.getAuthInfo
});

export const setAuthInfo = (info) => ({
    type: actionTypes.setAuthInfo,
    info
});

export const resetUserInfo = () => ({
    type: actionTypes.resetUserInfo,
})

export const subscribeToUserInfo = (id) => ({
    type: actionTypes.subscribeToUserInfo,
    id
});

export const subscribeToUserInfoCallback = (error, data, id) => ({
    type: actionTypes.subscribeToUserInfoCallback,
    error, data, id
});

export const unsubscribeFromUserInfo = () => ({
    type: actionTypes.unsubscribeFromUserInfo
});

export const receiveUserInfoQueryResult = (result) => ({
    type: actionTypes.receiveUserInfoQueryResult,
    result
});