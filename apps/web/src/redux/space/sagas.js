import {takeLatest, select, put, call} from "redux-saga/effects";
import gql from "graphql-tag";
import {
    actionTypes,
    receiveSpaceModelsQueryResult,
    receiveSpaceModelsTotal,
    receiveSpaceQueryResult,
    receiveSpaceUsersQueryResult,
    receiveSpaceUsersTotal,
    subscribeToSpace,
    subscribeToSpaceCallback,
    subscribeToSpaceModels,
    subscribeToSpaceModelsCallback,
    subscribeToSpaceModelsTotal,
    subscribeToSpaceModelsTotalCallback,
    subscribeToSpaceUsers,
    subscribeToSpaceUsersCallback,
    subscribeToSpaceUsersTotal,
    subscribeToSpaceUsersTotalCallback,
} from "./actions";
import {
    subscribe,
    subscribeAction,
    unsubscribeAction,
} from "../subscriber/actions";
import {handleError, handleException, handleWebsocketCallbackError} from "../../errors";
import {gqlFetch} from "../../graphql_fetch";

// -----------------------------------------------------------------------------
// Action watchers
// -----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceActions() {
    yield takeLatest(actionTypes.subscribeToSpace, handleSubscribeToSpace);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceCallbackActions() {
    yield takeLatest(actionTypes.subscribeToSpaceCallback, handleSubscribeToSpaceCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromSpaceActions() {
    yield takeLatest(actionTypes.unsubscribeFromSpace, handleUnsubscribeFromSpace);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceUsersActions() {
    yield takeLatest(actionTypes.subscribeToSpaceUsers, handleSubscribeToSpaceUsers);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceUsersCallbackActions() {
    yield takeLatest(actionTypes.subscribeToSpaceUsersCallback, handleSubscribeToSpaceUsersCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromSpaceUsersActions() {
    yield takeLatest(actionTypes.unsubscribeFromSpaceUsers, handleUnsubscribeFromSpaceUsers);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceUsersTotalActions() {
    yield takeLatest(actionTypes.subscribeToSpaceUsersTotal, handleSubscribeToSpaceUsersTotal);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceUsersTotalCallbackActions() {
    yield takeLatest(actionTypes.subscribeToSpaceUsersTotalCallback, handleSubscribeToSpaceUsersTotalCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromSpaceUsersTotalActions() {
    yield takeLatest(actionTypes.unsubscribeFromSpaceUsersTotal, handleUnsubscribeFromSpaceUsersTotal);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceModelsActions() {
    yield takeLatest(actionTypes.subscribeToSpaceModels, handleSubscribeToSpaceModels);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceModelsCallbackActions() {
    yield takeLatest(actionTypes.subscribeToSpaceModelsCallback, handleSubscribeToSpaceModelsCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromSpaceModelsActions() {
    yield takeLatest(actionTypes.unsubscribeFromSpaceModels, handleUnsubscribeFromSpaceModels);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceModelsTotalActions() {
    yield takeLatest(actionTypes.subscribeToSpaceModelsTotal, handleSubscribeToSpaceModelsTotal);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceModelsTotalCallbackActions() {
    yield takeLatest(actionTypes.subscribeToSpaceModelsTotalCallback, handleSubscribeToSpaceModelsTotalCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromSpaceModelsTotalActions() {
    yield takeLatest(actionTypes.unsubscribeFromSpaceModelsTotal, handleUnsubscribeFromSpaceModelsTotal);
}

// noinspection JSUnusedGlobalSymbols
export function* watchAddSpaceActions() {
    yield takeLatest(actionTypes.addSpace, handleAddSpace);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRemoveSpaceActions() {
    yield takeLatest(actionTypes.removeSpace, handleRemoveSpace);
}

// noinspection JSUnusedGlobalSymbols
export function* watchRenameSpaceActions() {
    yield takeLatest(actionTypes.renameSpace, handleRenameSpace);
}

// noinspection JSUnusedGlobalSymbols
export function* watchAddMemberActions() {
    yield takeLatest(actionTypes.addMember, handleAddMember);
}

// noinspection JSUnusedGlobalSymbols
export function* watchEditInfoActions() {
    yield takeLatest(actionTypes.editInfo, handleEditInfo);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleSubscribeToSpace(action) {
    try {
        const query = gql`
            subscription ($space_id: uuid!) {
                space_by_pk (space_id: $space_id) {
                    space_id
                    name
                    info
                }
            }
        `;

        const variables = {
            'space_id': action.id
        };

        yield put(subscribe(action, query, variables, subscribeToSpaceCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToSpaceCallback(action) {
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
        if (!data.space_by_pk) {
            handleError('Space not found');
            return;
        }

        yield put(receiveSpaceQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromSpace() {
    yield put(unsubscribeAction(subscribeToSpace(undefined)));
}

function* handleSubscribeToSpaceUsers(action) {
    try {
        const query = gql`
            subscription ($space_id: uuid!, $limit: Int, $offset: Int, $order_by: [user_space_order_by!]) {
                space_by_pk (space_id: $space_id) {
                    user_spaces (order_by: $order_by, limit: $limit, offset: $offset) {
                        created_at
                        user {
                            user_id
                            name
                        }
                    }
                }
            }
        `;

        const userOrderBy = [];
        if (!action.sortBy || action.sortBy.length === 0) {
            userOrderBy.push({created_at: 'desc_nulls_last'});
        } else {
            for (let i = 0; i < action.sortBy.length; i++) {
                const item = action.sortBy[i];
                const name = item.id;
                const desc = item.desc ? 'desc_nulls_last' : 'asc_nulls_last';

                if (name === 'user.name') {
                    userOrderBy.push({user: {name: desc}});
                } else {
                    const orderItem = {};
                    orderItem[name] = desc;
                    userOrderBy.push(orderItem);
                }
            }
        }

        const variables = {
            'space_id': action.id,
            'limit': action.limit,
            'offset': action.offset,
            'order_by': userOrderBy
        };

        yield put(subscribe(action, query, variables, subscribeToSpaceUsersCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToSpaceUsersCallback(action) {
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
        if (!data.space_by_pk) {
            handleError('Space not found');
            return;
        }

        yield put(receiveSpaceUsersQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromSpaceUsers() {
    yield put(unsubscribeAction(subscribeToSpaceUsers(undefined, undefined, undefined, undefined)));
}

function* handleSubscribeToSpaceUsersTotal(action) {
    try {
        const query = gql`
            subscription ($space_id: uuid!) {
                space_by_pk (space_id: $space_id) {
                    user_spaces_aggregate {
                        aggregate {
                            count
                        }
                    }
                }
            }
        `;

        const variables = {
            'space_id': action.spaceId
        };

        yield put(subscribe(action, query, variables, subscribeToSpaceUsersTotalCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToSpaceUsersTotalCallback(action) {
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
        const userSpaces = data.space_by_pk?.user_spaces_aggregate;
        console.assert(userSpaces, data);

        if (userSpaces.aggregate) {
            yield put(receiveSpaceUsersTotal(userSpaces.aggregate.count));
        }

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromSpaceUsersTotal(/*action*/) {
    yield put(unsubscribeAction(subscribeToSpaceUsersTotal(undefined)));
}

function* handleSubscribeToSpaceModels(action) {
    try {
        const query = gql`
            subscription ($space_id: uuid!, $limit: Int, $offset: Int, $model_order_by: [model_order_by!]) {
                space_by_pk (space_id: $space_id) {
                    models (order_by: $model_order_by, limit: $limit, offset: $offset) {
                        model_id
                        name
                        created_at
                        updated_model {
                            updated_at
                        }
                    }
                }
            }
        `;

        const modelOrderBy = [];
        if (!action.sortBy || action.sortBy.length === 0) {
            modelOrderBy.push({updated_model: {updated_at: 'desc_nulls_last'}});
        } else {
            for (let i = 0; i < action.sortBy.length; i++) {
                const item = action.sortBy[i];
                const name = item.id;
                const desc = item.desc ? 'desc_nulls_last' : 'asc_nulls_last';

                if (name === 'name') {
                    modelOrderBy.push({name: desc});
                } else if (name === 'updated_model.updated_at') {
                    modelOrderBy.push({updated_model: {updated_at: desc}});
                } else {
                    const orderItem = {};
                    orderItem[name] = desc;
                    modelOrderBy.push(orderItem);
                }
            }
        }

        const variables = {
            'space_id': action.id,
            'limit': action.limit,
            'offset': action.offset,
            'model_order_by': modelOrderBy
        };

        yield put(subscribe(action, query, variables, subscribeToSpaceModelsCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToSpaceModelsCallback(action) {
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
        if (!data.space_by_pk) {
            handleError('Space not found');
            return;
        }

        yield put(receiveSpaceModelsQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromSpaceModels() {
    yield put(unsubscribeAction(subscribeToSpaceModels(undefined, undefined, undefined, undefined)));
}

function* handleSubscribeToSpaceModelsTotal(action) {
    try {
        const query = gql`
            subscription ($space_id: uuid!) {
                space_by_pk (space_id: $space_id) {
                    models_aggregate {
                        aggregate {
                            count
                        }
                    }
                }
            }
        `;

        const variables = {
            'space_id': action.spaceId
        };

        yield put(subscribe(action, query, variables, subscribeToSpaceModelsTotalCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToSpaceModelsTotalCallback(action) {
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
        const models = data.space_by_pk?.models_aggregate;
        console.assert(models, data);

        if (models?.aggregate) {
            yield put(receiveSpaceModelsTotal(models.aggregate.count));
        }

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromSpaceModelsTotal(/*action*/) {
    yield put(unsubscribeAction(subscribeToSpaceModelsTotal(undefined)));
}

function* handleAddSpace(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const isAdmin = yield select((state) => state.user.isAdmin);

        const query = gql`
            mutation ($name: String!) {
                insert_space_one(object: {name: $name}) {
                    space_id
                }
            }
        `;

        const variables = {
            'name': action.name
        };

        const headers = {};

        if (isAdmin) {
            headers['x-hasura-role'] = 'domaindriven-admin';
        }

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables, headers);

        // noinspection JSUnresolvedVariable
        const spaceId = response?.data?.insert_space_one?.space_id;
        console.assert(spaceId, response);

        // TODO: Redirect to the new space page?
        // NOTE: Addition of user to space takes too long.
        // if (spaceId) {
        //     action.navigate(`/spaces/${spaceId}`);
        // }

    } catch (e) {
        handleException(e);
    }
}

function* handleRemoveSpace(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const isAdmin = yield select((state) => state.user.isAdmin);

        const query = gql`
            mutation ($space_id: uuid!) {
                delete_space_by_pk(space_id: $space_id) {
                    space_id
                }
            }
        `;

        const variables = {
            'space_id': action.spaceId
        };

        const headers = {};

        if (isAdmin) {
            headers['x-hasura-role'] = 'domaindriven-admin';
        }

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables, headers);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.delete_space_by_pk?.space_id === action.spaceId, response);

        // Redirect to list of spaces.
        action.navigate('/spaces/');

    } catch (e) {
        handleException(e);
    }
}

function* handleRenameSpace(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const isAdmin = yield select((state) => state.user.isAdmin);

        const query = gql`
            mutation ($space_id: uuid!, $name: String!) {
                update_space_by_pk(pk_columns: {space_id: $space_id}, _set: {name: $name}) {
                    space_id
                }
            }
        `;

        const variables = {
            'space_id': action.spaceId,
            'name': action.name
        };

        const headers = {};

        if (isAdmin) {
            headers['x-hasura-role'] = 'domaindriven-admin';
        }

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables, headers);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_space_by_pk?.space_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleAddMember(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const isAdmin = yield select((state) => state.user.isAdmin);

        const query = gql`
            mutation ($user_id: uuid!, $space_id: uuid!) {
                insert_user_space_one(object: {user_id: $user_id, space_id: $space_id}) {
                    space_id
                }
            }
        `;

        const variables = {
            'user_id': action.userId,
            'space_id': action.spaceId
        };

        const headers = {};

        if (isAdmin) {
            headers['x-hasura-role'] = 'domaindriven-admin';
        }

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables, headers);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.insert_user_space_one?.space_id, response);

    } catch (e) {
        handleException(e);
    }
}

function* handleEditInfo(action) {
    try {
        const userId = yield select((state) => state.user.userId);
        const isAdmin = yield select((state) => state.user.isAdmin);

        const query = gql`
            mutation ($space_id: uuid!, $info: String!) {
                update_space_by_pk(pk_columns: {space_id: $space_id}, _set: {info: $info}) {
                    space_id
                }
            }
        `;

        const variables = {
            'space_id': action.spaceId,
            'info': action.info
        };

        const headers = {};

        if (isAdmin) {
            headers['x-hasura-role'] = 'domaindriven-admin';
        }

        // noinspection JSCheckFunctionSignatures
        const response = yield call(gqlFetch, userId, query, variables, headers);

        // noinspection JSUnresolvedVariable
        console.assert(response?.data?.update_space_by_pk?.space_id, response);

    } catch (e) {
        handleException(e);
    }
}
