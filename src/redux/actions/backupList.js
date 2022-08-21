export const actionTypes = {
    reset: 'backupList/reset',

    subscribeToBackupList: 'backupList/subscribeToBackupList',
    subscribeToBackupListCallback: 'backupList/subscribeToBackupListCallback',
    unsubscribeFromBackupList: 'backupList/unsubscribeFromBackupList',
    receiveBackupListQueryResult: 'backupList/receiveBackupListQueryResult',

    subscribeToBackupListTotal: 'backupList/subscribeToBackupListTotal',
    subscribeToBackupListTotalCallback: 'backupList/subscribeToBackupListTotalCallback',
    unsubscribeFromBackupListTotal: 'backupList/unsubscribeFromBackupListTotal',
    receiveBackupListTotal: 'backupList/receiveBackupListTotal',
};

export const reset = () => ({
    type: actionTypes.reset
});

export const subscribeToBackupList = (modelId, limit, offset) => ({
    type: actionTypes.subscribeToBackupList,
    modelId, limit, offset
});

export const subscribeToBackupListCallback = (error, data) => ({
    type: actionTypes.subscribeToBackupListCallback,
    error, data
});

export const unsubscribeFromBackupList = () => ({
    type: actionTypes.unsubscribeFromBackupList
});

export const receiveBackupListQueryResult = (result) => ({
    type: actionTypes.receiveBackupListQueryResult,
    result
});

export const subscribeToBackupListTotal = (modelId) => ({
    type: actionTypes.subscribeToBackupListTotal,
    modelId
});

export const subscribeToBackupListTotalCallback = (error, data) => ({
    type: actionTypes.subscribeToBackupListTotalCallback,
    error, data
});

export const unsubscribeFromBackupListTotal = () => ({
    type: actionTypes.unsubscribeFromBackupListTotal
});

export const receiveBackupListTotal = (total) => ({
    type: actionTypes.receiveBackupListTotal,
    total
});
