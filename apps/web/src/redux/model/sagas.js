import {take, takeLatest, select, put, call} from "redux-saga/effects";
import gql from "graphql-tag";
import toast from "react-hot-toast";
import {
    actionTypes,
    receiveModelQueryResult,
    reset,
    subscribeToModel,
    subscribeToModelCallback,
    viewUpsert,
} from "./actions";
import {
    subscribe,
    subscribeAction,
    unsubscribeAction,
} from "../subscriber/actions";
import {handleError, handleException, handleWebsocketCallbackError} from "../../errors";
import {gqlFetch} from "../../graphql_fetch";
import {screenLock, screenUnlock} from "../../lock_screen";
import {eventChannel} from "redux-saga";
import {history} from "../store";

// -----------------------------------------------------------------------------
// Action watchers
// -----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
export function* watchForTimerEvents() {
    const chan = yield call(getTimerEventChannel);
    try {
        while (true) {
            yield take(chan);
            yield handleTimerEvent();
        }
    } finally {
        chan.close();
    }
}

// noinspection JSUnusedGlobalSymbols
export function* watchForLocationChanges() {
    yield takeLatest('@@router/ON_LOCATION_CHANGED', handleLocationChanges);
}

// noinspection JSUnusedGlobalSymbols
export function* watchViewUpsertActions() {
    yield takeLatest(actionTypes.viewUpsert, handleViewUpsert);
}

// noinspection JSUnusedGlobalSymbols
export function* watchViewRemoveActions() {
    yield takeLatest(actionTypes.viewRemove, handleViewRemove);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToModelActions() {
    yield takeLatest(actionTypes.subscribeToModel, handleSubscribeToModel);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToModelCallbackActions() {
    yield takeLatest(actionTypes.subscribeToModelCallback, handleSubscribeToModelCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromModelActions() {
    yield takeLatest(actionTypes.unsubscribeFromModel, handleUnsubscribeFromModel);
}

// noinspection JSUnusedGlobalSymbols
export function* watchAddModelActions() {
    yield takeLatest(actionTypes.addModel, handleAddModel);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRemoveModelActions() {
    yield takeLatest(actionTypes.removeModel, handleRemoveModel);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRenameModelActions() {
    yield takeLatest(actionTypes.renameModel, handleRenameModel);
}

// noinspection JSUnusedGlobalSymbols
export function* watchAddConnectionActions() {
    yield takeLatest(actionTypes.addConnection, handleAddConnection);
}

// noinspection JSUnusedGlobalSymbols
export function* watchEditConnectionActions() {
    yield takeLatest(actionTypes.editConnection, handleEditConnection);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRemoveConnectionActions() {
    yield takeLatest(actionTypes.removeConnection, handleRemoveConnection);
}

// noinspection JSUnusedGlobalSymbols
export function* watchTransferModelActions() {
    yield takeLatest(actionTypes.transferModel, handleTransferModel);
}

// noinspection JSUnusedGlobalSymbols
export function* watchCloneModelActions() {
    yield takeLatest(actionTypes.cloneModel, handleCloneModel);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRestoreModelActions() {
    yield takeLatest(actionTypes.restoreModel, handleRestoreModel);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleTimerEvent() {
    const modelId = yield select((state) => state.model.id);
    if (modelId) yield put(viewUpsert(modelId));
}

function* handleLocationChanges(action) {
    const hash = action.payload.location.hash;
    if (hash.startsWith('#context-')) {
        const slice = hash.slice('#context-'.length);
        const url = decodeURIComponent(slice);
        setTimeout(() => history.replace(url), 0);
    }
}

function* handleViewUpsert(action) {
    const userId = yield select((state) => state.user.userId);

    if (!action.id) {
        console.error('viewUpsert without model id!');
        return;
    }

    // NOTE: Upsert query using on_conflict.
    const query = gql`
        mutation ($model_id: uuid!, $user_id: uuid!) {
            insert_model_viewer_one(
                object: {
                    model_id: $model_id,
                    user_id: $user_id
                },
                on_conflict: {
                    constraint: model_viewer_pkey,
                    update_columns: [model_id, user_id]
                }) {
                model_id
            }
        }
    `;

    const variables = {
        'model_id': action.id,
        'user_id': userId
    };

    // noinspection JSCheckFunctionSignatures
    const response = yield call(gqlFetch, userId, query, variables);

    // noinspection JSUnresolvedVariable
    const modelId = response?.data?.insert_model_viewer_one?.model_id;
    console.assert(modelId, response);
}

function* handleViewRemove(action) {
    const userId = yield select((state) => state.user.userId);

    const query = gql`
        mutation ($model_id: uuid!) {
            delete_model_viewer(where: {model_id: {_eq: $model_id}}) {
                affected_rows
            }
        }
    `;

    const variables = {
        'model_id': action.id
    };

    // noinspection JSCheckFunctionSignatures
    const response = yield call(gqlFetch, userId, query, variables);

    // noinspection JSUnresolvedVariable
    console.assert(response?.data?.delete_model_viewer, response);
}

function* handleSubscribeToModel(action) {
    try {
        const query = gql`
            subscription ($model_id: uuid!) {
                model_by_pk(model_id: $model_id) {
                    model_id
                    name
                    space {
                        space_id
                        name
                    }
                    contexts {
                        context_id
                        name
                    }
                    connections {
                        connection_id
                        from_context_id
                        to_context_id
                    }
                    model_viewers {
                        user_id
                        user {
                            user_id
                            name
                        }
                    }
                }
            }
        `;

        const variables = {
            model_id: action.id
        };

        yield put(subscribe(action, query, variables, subscribeToModelCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToModelCallback(action) {
    try {
        const {error, data} = action;

        if (!error && !data) {
            return; // Normal exit.
        }

        if (error) {
            handleWebsocketCallbackError(error);
            return;
        }

        // noinspection JSUnresolvedVariable
        if (!data.model_by_pk) {
            handleError('Model not found');
            return;
        }

        yield handlePeopleEnteringAndLeaving(data);
        yield put(receiveModelQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromModel() {
    yield put(unsubscribeAction(subscribeToModel(undefined)));
    yield put(reset());
}

function* handleAddModel(action) {
    try {
        const userId = yield select((state) => state.user.userId);

        const query = gql`
            mutation ($name: String!, $space_id: uuid!) {
                insert_model_one(object: {name: $name, space_id: $space_id}) {
                    model_id
                }
            }
        `;

        const variables = {
            'name': action.name,
            'space_id': action.spaceId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        const modelId = response?.data?.insert_model_one?.model_id;
        console.assert(modelId, response);

        // Add initial context to model.

        const contextQuery = gql`
            mutation ($name: String!, $model_id: uuid!) {
                insert_context_one(object: {name: $name, model_id: $model_id}) {
                    context_id
                }
            }
        `;

        const contextVariables = {
            'name': 'Core',
            'model_id': modelId
        };

        // noinspection JSCheckFunctionSignatures
        const contextResponse = yield call(gqlFetch, userId, contextQuery, contextVariables);

        // noinspection JSUnresolvedVariable
        const contextId = contextResponse?.data?.insert_context_one?.context_id;
        console.assert(contextId, response);

        // Redirect to the new model page.
        if (modelId) {
            action.navigate(`/models/${modelId}`);
        }

    } catch (e) {
        handleException(e);
    }
}

function* handleRemoveModel(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const spaceId = yield select((state) => state.model.spaceId);

        const query = gql`
            mutation ($model_id: uuid!) {
                delete_model_by_pk(model_id: $model_id) {
                    model_id
                }
            }
        `;

        const variables = {
            'model_id': action.modelId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.delete_model_by_pk?.model_id === action.modelId, response);

        // Redirect to list of models.
        action.navigate(`/spaces/${spaceId}`);

    } catch (e) {
        handleException(e);
    }
}

function* handleRenameModel(action) {
    try {
        const userId = yield select((state) => state.user.userId);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(action.modelId));

        const query = gql`
            mutation ($model_id: uuid!, $name: String!) {
                update_model_by_pk(pk_columns: {model_id: $model_id}, _set: {name: $name}) {
                    model_id
                }
            }
        `;

        const variables = {
            'model_id': action.modelId,
            'name': action.name
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_model_by_pk?.model_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleAddConnection(action) {
    try {
        const userId = yield select((state) => state.user.userId);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(action.modelId));

        const query = gql`
            mutation (
                $model_id: uuid!,
                $from_context_id: uuid!,
                $to_context_id: uuid!) {
                insert_connection_one(object: {
                    model_id: $model_id,
                    from_context_id: $from_context_id,
                    to_context_id: $to_context_id}) {
                    connection_id
                }
            }
        `;

        const variables = {
            'model_id': action.modelId,
            'from_context_id': action.fromContextId,
            'to_context_id': action.toContextId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        const connectionId = response?.data?.insert_connection_one?.connection_id;
        console.assert(connectionId, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleEditConnection(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($connection_id: uuid!, $from_context_id: uuid!, $to_context_id: uuid!) {
                update_connection_by_pk(pk_columns: {connection_id: $connection_id},
                    _set: {from_context_id: $from_context_id, to_context_id: $to_context_id}) {
                    connection_id
                }
            }
        `;

        const variables = {
            'connection_id': action.connectionId,
            'from_context_id': action.fromContextId,
            'to_context_id': action.toContextId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_connection_by_pk?.connection_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleRemoveConnection(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const modelId = yield select((state) => state.model.id);

        // Update timestamp for interaction with model.
        yield put(viewUpsert(modelId));

        const query = gql`
            mutation ($connection_id: uuid!) {
                delete_connection_by_pk(connection_id: $connection_id) {
                    connection_id
                }
            }
        `;

        const variables = {
            'connection_id': action.connectionId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.delete_connection_by_pk?.connection_id === action.connectionId, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleTransferModel(action) {
    try {
        const userId = yield select((state) => state.user.userId);

        const query = gql`
            mutation ($model_id: uuid!, $space_id: uuid!) {
                update_model_by_pk(pk_columns: {model_id: $model_id}, _set: {space_id: $space_id}) {
                    model_id
                }
            }
        `;

        const variables = {
            'model_id': action.modelId,
            'space_id': action.spaceId
        };

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_model_by_pk?.model_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleCloneModel(action) {
    try {
        const userId = yield select((state) => state.user.userId);

        const query = gql`
            query ($model_id: uuid!, $name: String!, $space_id: uuid!) {
                clone(model_id: $model_id, name: $name, space_id: $space_id) {
                    model_id
                }
            }
        `;

        const variables = {
            'model_id': action.modelId,
            'name': action.name,
            'space_id': action.spaceId
        };

        screenLock(); // NOTE: Lock after closing modal to disable body scroll.

        const response = yield call(gqlFetch, userId, query, variables);

        const modelId = response?.data?.clone?.model_id;
        console.assert(modelId, response);

        // Redirect to the new model page.
        if (modelId) {
            action.navigate(`/models/${modelId}`);
        }

    } catch (e) {
        handleException(e);
    } finally {
        screenUnlock();
    }
}

function* handleRestoreModel(action) {
    try {
        const userId = yield select((state) => state.user.userId);

        const query = gql`
            query ($backup_id: uuid!, $name: String!, $space_id: uuid!) {
                restore(backup_id: $backup_id, name: $name, space_id: $space_id) {
                    model_id
                }
            }
        `;

        const variables = {
            'backup_id': action.backupId,
            'name': action.name,
            'space_id': action.spaceId
        };

        screenLock(); // NOTE: Lock after closing modal to disable body scroll.

        const response = yield call(gqlFetch, userId, query, variables);

        const modelId = response?.data?.restore?.model_id;
        console.assert(modelId, response);

        // Redirect to the new model page.
        if (modelId) {
            action.navigate(`/models/${modelId}`);
        }

    } catch (e) {
        handleException(e);
    } finally {
        screenUnlock();
    }
}

// -----------------------------------------------------------------------------
// Supporting code
// -----------------------------------------------------------------------------

function getTimerEventChannel() {
    return eventChannel(emit => {
        const emitter = () => emit({});
        const interval = setInterval(emitter, 30000);
        return () => clearInterval(interval);
    })
}

/**
 * @param data {Object}
 */
function* handlePeopleEnteringAndLeaving(data) {
    const userId = yield select((state) => state.user.userId);
    const lastViewerIds = yield select((state) => state.model.viewerIds);
    const lastViewerIdLookup = yield select((state) => state.model.viewerIdLookup);

    // noinspection JSUnresolvedVariable
    const model = data.model_by_pk;

    // Gather info about people currently viewing the model.
    // noinspection JSUnresolvedVariable
    const viewers = model.model_viewers;
    const viewerIds = [];
    const viewerIdLookup = {};
    for (let i = 0; i < viewers.length; i++) {
        const viewer = viewers[i].user;
        if (viewer) {
            viewerIds.push(viewer.user_id);
            viewerIdLookup[viewer.user_id] = viewer.name;
        }
    }

    // Toasts for when people enter and leave the same model page.
    if (lastViewerIds) {

        // Detect people who've just arrived at the model page.
        const viewersEntered = viewerIds.filter(x => !lastViewerIds.includes(x));
        for (let i = 0; i < viewersEntered.length; i++) {
            const viewerId = viewersEntered[i];
            if (viewerId !== userId) {
                const name = viewerIdLookup[viewerId] || '?';
                toast(`${name} has arrived`);
            }
        }

        // Detect people who've just left the model page.
        const viewersLeft = lastViewerIds.filter(x => !viewerIds.includes(x));
        for (let i = 0; i < viewersLeft.length; i++) {
            const viewerId = viewersLeft[i];
            if (viewerId !== userId) {
                const name = lastViewerIdLookup[viewerId] || '?';
                toast(`${name} has left`);
            }
        }
    }
}
