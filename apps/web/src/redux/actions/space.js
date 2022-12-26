export const actionTypes = {
    reset: 'space/reset',

    subscribeToSpace: 'space/subscribeToSpace',
    subscribeToSpaceCallback: 'space/subscribeToSpaceCallback',
    unsubscribeFromSpace: 'space/unsubscribeFromSpace',
    receiveSpaceQueryResult: 'space/receiveSpaceQueryResult',

    subscribeToSpaceUsers: 'space/subscribeToSpaceUsers',
    subscribeToSpaceUsersCallback: 'space/subscribeToSpaceUsersCallback',
    unsubscribeFromSpaceUsers: 'space/unsubscribeFromSpaceUsers',
    receiveSpaceUsersQueryResult: 'space/receiveSpaceUsersQueryResult',

    subscribeToSpaceUsersTotal: 'space/subscribeToSpaceUsersTotal',
    subscribeToSpaceUsersTotalCallback: 'space/subscribeToSpaceUsersTotalCallback',
    unsubscribeFromSpaceUsersTotal: 'space/unsubscribeFromSpaceUsersTotal',
    receiveSpaceUsersTotal: 'space/receiveSpaceUsersTotal',

    subscribeToSpaceModels: 'space/subscribeToSpaceModels',
    subscribeToSpaceModelsCallback: 'space/subscribeToSpaceModelsCallback',
    unsubscribeFromSpaceModels: 'space/unsubscribeFromSpaceModels',
    receiveSpaceModelsQueryResult: 'space/receiveSpaceModelsQueryResult',

    subscribeToSpaceModelsTotal: 'space/subscribeToSpaceModelsTotal',
    subscribeToSpaceModelsTotalCallback: 'space/subscribeToSpaceModelsTotalCallback',
    unsubscribeFromSpaceModelsTotal: 'space/unsubscribeFromSpaceModelsTotal',
    receiveSpaceModelsTotal: 'space/receiveSpaceModelsTotal',

    addSpace: 'space/addSpace',
    removeSpace: 'space/removeSpace',
    renameSpace: 'space/renameSpace',
    addMember: 'space/addMember',
    editInfo: 'space/editInfo',
};

/**
 * Resets the entire space state.
 */
export const reset = () => ({
    type: actionTypes.reset
});

/**
 * Subscribes to the data for a single space.
 * @param id {string} Space UUID string.
 */
export const subscribeToSpace = (id) => ({
    type: actionTypes.subscribeToSpace,
    id
});

/**
 * Callback with the data from the GraphQL query for loading a space.
 * @param error {Object} If an error occurred.
 * @param data {Object} Space data from GraphQL query.
 * @param id {string} Space UUID string.
 */
export const subscribeToSpaceCallback = (error, data, id) => ({
    type: actionTypes.subscribeToSpaceCallback,
    error, data, id
});

/**
 * Unsubscribes to the data for a single space.
 */
export const unsubscribeFromSpace = () => ({
    type: actionTypes.unsubscribeFromSpace
});

/**
 * Action used to load the space data in the Redux store.
 * @param result {Object} Data to be stored in Redux store using reducer.
 */
export const receiveSpaceQueryResult = (result) => ({
    type: actionTypes.receiveSpaceQueryResult,
    result
});

/**
 * @param id {string}
 * @param limit {number}
 * @param offset {number}
 * @param sortBy {Object}
 */
export const subscribeToSpaceUsers = (id, limit, offset, sortBy) => ({
    type: actionTypes.subscribeToSpaceUsers,
    id, limit, offset, sortBy
});

/**
 * @param error {Object}
 * @param data {Object}
 * @param id {string}
 */
export const subscribeToSpaceUsersCallback = (error, data, id) => ({
    type: actionTypes.subscribeToSpaceUsersCallback,
    error, data, id
});

export const unsubscribeFromSpaceUsers = () => ({
    type: actionTypes.unsubscribeFromSpaceUsers
});

/**
 * @param result {Object}
 */
export const receiveSpaceUsersQueryResult = (result) => ({
    type: actionTypes.receiveSpaceUsersQueryResult,
    result
});

/**
 * @param spaceId {string}
 */
export const subscribeToSpaceUsersTotal = (spaceId) => ({
    type: actionTypes.subscribeToSpaceUsersTotal,
    spaceId
});

/**
 * @param error {Object}
 * @param data {Object}
 */
export const subscribeToSpaceUsersTotalCallback = (error, data) => ({
    type: actionTypes.subscribeToSpaceUsersTotalCallback,
    error, data
});

export const unsubscribeFromSpaceUsersTotal = () => ({
    type: actionTypes.unsubscribeFromSpaceUsersTotal
});

/**
 * @param total {number}
 */
export const receiveSpaceUsersTotal = (total) => ({
    type: actionTypes.receiveSpaceUsersTotal,
    total
});

/**
 * @param id {string}
 * @param limit {number}
 * @param offset {number}
 * @param sortBy {Object}
 */
export const subscribeToSpaceModels = (id, limit, offset, sortBy) => ({
    type: actionTypes.subscribeToSpaceModels,
    id, limit, offset, sortBy
});

/**
 * @param error {Object}
 * @param data {Object}
 * @param id {string}
 */
export const subscribeToSpaceModelsCallback = (error, data, id) => ({
    type: actionTypes.subscribeToSpaceModelsCallback,
    error, data, id
});

export const unsubscribeFromSpaceModels = () => ({
    type: actionTypes.unsubscribeFromSpaceModels
});

/**
 * @param result {Object}
 */
export const receiveSpaceModelsQueryResult = (result) => ({
    type: actionTypes.receiveSpaceModelsQueryResult,
    result
});

/**
 * @param spaceId {string}
 */
export const subscribeToSpaceModelsTotal = (spaceId) => ({
    type: actionTypes.subscribeToSpaceModelsTotal,
    spaceId
});

/**
 * @param error {Object}
 * @param data {Object}
 */
export const subscribeToSpaceModelsTotalCallback = (error, data) => ({
    type: actionTypes.subscribeToSpaceModelsTotalCallback,
    error, data
});

export const unsubscribeFromSpaceModelsTotal = () => ({
    type: actionTypes.unsubscribeFromSpaceModelsTotal
});

/**
 * @param total {number}
 */
export const receiveSpaceModelsTotal = (total) => ({
    type: actionTypes.receiveSpaceModelsTotal,
    total
});

/**
 * @param name {string}
 * @param navigate {Object}
 */
export const addSpace = (name, navigate) => ({
    type: actionTypes.addSpace,
    name, navigate
});

/**
 * @param spaceId {string}
 * @param navigate {Object}
 */
export const removeSpace = (spaceId, navigate) => ({
    type: actionTypes.removeSpace,
    spaceId, navigate
});

/**
 * @param spaceId {string}
 * @param name {string}
 */
export const renameSpace = (spaceId, name) => ({
    type: actionTypes.renameSpace,
    spaceId, name
});

/**
 * @param spaceId {string}
 * @param userId {string}
 */
export const addMember = (spaceId, userId) => ({
    type: actionTypes.addMember,
    spaceId, userId
});

/**
 * @param spaceId {string}
 * @param info {string}
 */
export const editInfo = (spaceId, info) => ({
    type: actionTypes.editInfo,
    spaceId, info
});
