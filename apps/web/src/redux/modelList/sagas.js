import {put, takeLatest} from "redux-saga/effects";
import gql from "graphql-tag";
import {
    actionTypes,
    receiveModelListQueryResult,
    receiveModelListTotal,
    subscribeToModelList,
    subscribeToModelListCallback,
    subscribeToModelListTotal,
    subscribeToModelListTotalCallback,
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
export function* watchSubscribeToModelListActions() {
    yield takeLatest(actionTypes.subscribeToModelList, handleSubscribeToModelList);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToModelListCallbackActions() {
    yield takeLatest(actionTypes.subscribeToModelListCallback, handleSubscribeToModelListCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromModelListActions() {
    yield takeLatest(actionTypes.unsubscribeFromModelList, handleUnsubscribeFromModelList);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToModelListTotalActions() {
    yield takeLatest(actionTypes.subscribeToModelListTotal, handleSubscribeToModelListTotal);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToModelListTotalCallbackActions() {
    yield takeLatest(actionTypes.subscribeToModelListTotalCallback, handleSubscribeToModelListTotalCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromModelListTotalActions() {
    yield takeLatest(actionTypes.unsubscribeFromModelListTotal, handleUnsubscribeFromModelListTotal);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleSubscribeToModelList(action) {
    try {
        const query = gql`
            subscription ($limit: Int, $offset: Int, $order_by: [model_order_by!]) {
                model (order_by: $order_by, limit: $limit, offset: $offset) {
                    model_id
                    name
                    created_at
                    updated_model {
                        updated_at
                    }
                    space {
                        space_id
                        name
                    }
                    contexts {
                        context_id
                        name
                    }
                }
            }
        `;

        const modelOrderBy = [];
        if (!action.sortBy || action.sortBy.length === 0) {
            modelOrderBy.push({updated_model: {updated_at: 'desc_nulls_last'}});
            modelOrderBy.push({created_at: 'desc_nulls_last'});
        } else {
            for (let i = 0; i < action.sortBy.length; i++) {
                const item = action.sortBy[i];
                const name = item.id;
                const desc = item.desc ? 'desc_nulls_last' : 'asc_nulls_last';

                if (name === 'space.name') {
                    modelOrderBy.push({space: {name: desc}});
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
            'limit': action.limit,
            'offset': action.offset,
            'order_by': modelOrderBy
        };

        yield put(subscribe(action, query, variables, subscribeToModelListCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToModelListCallback(action) {
    try {
        const {error, data} = action;

        if (!error && !data) {
            return; // Normal exit.
        }

        if (error) {
            handleWebsocketCallbackError(error);
            return;
        }

        yield put(receiveModelListQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromModelList() {
    yield put(unsubscribeAction(subscribeToModelList()));
}

function* handleSubscribeToModelListTotal(action) {
    try {
        const query = gql`
            subscription {
                model_aggregate {
                    aggregate {
                        total_count: count
                    }
                }
            }
        `;

        const variables = {};

        yield put(subscribe(action, query, variables, subscribeToModelListTotalCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToModelListTotalCallback(action) {
    try {
        const {error, data} = action;

        if (!error && !data) {
            return; // Normal exit.
        }

        if (error) {
            handleWebsocketCallbackError(error);
            return;
        }

        const total = data['model_aggregate']['aggregate']['total_count'];
        yield put(receiveModelListTotal(total));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromModelListTotal(/*action*/) {
    yield put(unsubscribeAction(subscribeToModelListTotal()));
}
