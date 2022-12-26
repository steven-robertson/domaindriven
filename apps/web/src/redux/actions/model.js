export const actionTypes = {
    reset: 'model/reset',

    viewUpsert: 'model/viewUpsert',
    viewRemove: 'model/viewRemove',

    subscribeToModel: 'model/subscribeToModel',
    subscribeToModelCallback: 'model/subscribeToModelCallback',
    unsubscribeFromModel: 'model/unsubscribeFromModel',
    receiveModelQueryResult: 'model/receiveModelQueryResult',

    addModel: 'model/addModel',
    removeModel: 'model/removeModel',
    renameModel: 'model/renameModel',

    addConnection: 'model/addConnection',
    editConnection: 'model/editConnection',
    removeConnection: 'model/removeConnection',

    transferModel: 'model/transferModel',
    cloneModel: 'model/cloneModel',
    restoreModel: 'model/restoreModel',
};

/**
 * Resets the entire model state.
 */
export const reset = () => ({
    type: actionTypes.reset
});

/**
 * Adds viewer to list of people currently viewing the model.
 * @param id {string} Model UUID string.
 */
export const viewUpsert = (id) => ({
    type: actionTypes.viewUpsert,
    id
});

/**
 * Removes viewer from list of people currently viewing the model.
 * @param id {string} Model UUID string.
 */
export const viewRemove = (id) => ({
    type: actionTypes.viewRemove,
    id
});

/**
 * Subscribes to the data for a single model.
 * @param id {string} Model UUID string.
 */
export const subscribeToModel = (id) => ({
    type: actionTypes.subscribeToModel,
    id
});

/**
 * Callback with the data from the GraphQL query for loading a model.
 * @param error {Object} If an error occurred.
 * @param data {Object} Model data from GraphQL query.
 * @param id {string} Model UUID string.
 */
export const subscribeToModelCallback = (error, data, id) => ({
    type: actionTypes.subscribeToModelCallback,
    error, data, id
});

/**
 * Unsubscribes to the data for a single model.
 */
export const unsubscribeFromModel = () => ({
    type: actionTypes.unsubscribeFromModel
});

/**
 * Action used to load the model data in the Redux store.
 * @param result {Object} Data to be stored in Redux store using reducer.
 */
export const receiveModelQueryResult = (result) => ({
    type: actionTypes.receiveModelQueryResult,
    result
});

/**
 * Adds a new model.
 * @param name {string} Name of the model to be added.
 * @param spaceId {string} UUID for the space that will own the model.
 * @param navigate {Object} Hook that will be used to navigate on completion of the GraphQL query.
 */
export const addModel = (name, spaceId, navigate) => ({
    type: actionTypes.addModel,
    name, spaceId, navigate
});

/**
 * Removes the model with the given UUID.
 * @param modelId {string} Model UUID string ID.
 * @param navigate {Object} Hook that will be used to navigate on completion of the GraphQL query.
 */
export const removeModel = (modelId, navigate) => ({
    type: actionTypes.removeModel,
    modelId, navigate
});

/**
 * Renames a model.
 * @param modelId {string} Model UUID string ID.
 * @param name {string} New name for the model.
 */
export const renameModel = (modelId, name) => ({
    type: actionTypes.renameModel,
    modelId, name
});

/**
 * Add a new connection between contexts.
 * @param modelId {string} Model UUID string ID.
 * @param fromContextId {string} UUID for the context at the 'from' side of the connection.
 * @param toContextId {string} UUID for the context at the 'to' side of the connection.
 */
export const addConnection = (modelId, fromContextId, toContextId) => ({
    type: actionTypes.addConnection,
    modelId, fromContextId, toContextId
});

/**
 * Edit a connection between contexts.
 * @param connectionId {string} Connection UUID string ID.
 * @param fromContextId {string} UUID for the context at the 'from' side of the connection.
 * @param toContextId {string} UUID for the context at the 'to' side of the connection.
 */
export const editConnection = (connectionId, fromContextId, toContextId) => ({
    type: actionTypes.editConnection,
    connectionId, fromContextId, toContextId
});

/**
 * Remove a connection between contexts.
 * @param connectionId {string} UUID for the connection.
 */
export const removeConnection = (connectionId) => ({
    type: actionTypes.removeConnection,
    connectionId
});

/**
 * Transfers the model to another space.
 * @param modelId {string} Model UUID string ID.
 * @param spaceId {string} UUID for the space that will own the model.
 */
export const transferModel = (modelId, spaceId) => ({
    type: actionTypes.transferModel,
    modelId, spaceId
});

/**
 * Creates a copy of the model.
 * @param modelId {string} Model UUID string ID.
 * @param spaceId {string} UUID for the space that will own the model.
 * @param name {string} Name for the model to rename the model as it is being transferred.
 * @param navigate {Object} Hook that will be used to navigate on completion of the GraphQL query.
 */
export const cloneModel = (modelId, spaceId, name, navigate) => ({
    type: actionTypes.cloneModel,
    modelId, spaceId, name, navigate
});

/**
 * Restores a copy from a backup of a model.
 * @param backupId {string} Backup UUID string ID.
 * @param spaceId {string} UUID for the space that will own the model.
 * @param name {string} Name for the model to rename the model as it is being restored.
 * @param navigate {Object} Hook that will be used to navigate on completion of the GraphQL query.
 */
export const restoreModel = (backupId, spaceId, name, navigate) => ({
    type: actionTypes.restoreModel,
    backupId, spaceId, name, navigate
});
