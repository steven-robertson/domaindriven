import {put, takeLatest} from "redux-saga/effects";
import gql from "graphql-tag";
import {
    actionTypes,
    receiveBackupListQueryResult,
    subscribeToBackupList,
    subscribeToBackupListCallback,
    receiveBackupListTotal,
    subscribeToBackupListTotal,
    subscribeToBackupListTotalCallback,
} from "./actions";
import {
    subscribe,
    subscribeAction,
    unsubscribeAction
} from "../subscriber/actions";
import {handleException, handleWebsocketCallbackError} from "../../errors";

// -----------------------------------------------------------------------------
// Action watchers
// -----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToBackupListActions() {
    yield takeLatest(actionTypes.subscribeToBackupList, handleSubscribeToBackupList);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToBackupListCallbackActions() {
    yield takeLatest(actionTypes.subscribeToBackupListCallback, handleSubscribeToBackupListCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromBackupListActions() {
    yield takeLatest(actionTypes.unsubscribeFromBackupList, handleUnsubscribeFromBackupList);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToBackupListTotalActions() {
    yield takeLatest(actionTypes.subscribeToBackupListTotal, handleSubscribeToBackupListTotal);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToBackupListTotalCallbackActions() {
    yield takeLatest(actionTypes.subscribeToBackupListTotalCallback, handleSubscribeToBackupListTotalCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromBackupListTotalActions() {
    yield takeLatest(actionTypes.unsubscribeFromBackupListTotal, handleUnsubscribeFromBackupListTotal);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleSubscribeToBackupList(action) {
    try {
        const query = gql`
            subscription ($model_id: uuid!, $limit: Int, $offset: Int) {
                backup(
                    where: {model_id: {_eq: $model_id}}, 
                    order_by: {created_at: desc},
                    limit: $limit, offset: $offset) {
                    backup_id
                    created_at
                    model_name
                    space_name
                    user_id
                    user {
                        user_id
                        name
                    }
                }
            }
        `;

        const variables = {
            'model_id': action.modelId,
            'limit': action.limit,
            'offset': action.offset
        };

        yield put(subscribe(action, query, variables, subscribeToBackupListCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToBackupListCallback(action) {
    try {
        const {error, data} = action;

        if (!error && !data) {
            return; // Normal exit.
        }

        if (error) {
            handleWebsocketCallbackError(error);
            return;
        }

        yield put(receiveBackupListQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromBackupList() {
    yield put(unsubscribeAction(subscribeToBackupList()));
}

function* handleSubscribeToBackupListTotal(action) {
    try {
        const query = gql`
            subscription ($model_id: uuid!) {
                backup_aggregate(where: {model_id: {_eq: $model_id}}) {
                    aggregate {
                        total_count: count
                    }
                }
            }
        `;

        const variables = {
            'model_id': action.modelId
        };

        yield put(subscribe(action, query, variables, subscribeToBackupListTotalCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToBackupListTotalCallback(action) {
    try {
        const {error, data} = action;

        if (!error && !data) {
            return; // Normal exit.
        }

        if (error) {
            handleWebsocketCallbackError(error);
            return;
        }

        const total = data['backup_aggregate']['aggregate']['total_count'];
        yield put(receiveBackupListTotal(total));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromBackupListTotal(/*action*/) {
    yield put(unsubscribeAction(subscribeToBackupListTotal()));
}
