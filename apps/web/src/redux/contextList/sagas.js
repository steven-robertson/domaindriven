import {put, takeLatest} from "redux-saga/effects";
import gql from "graphql-tag";
import {
    actionTypes,
    receiveContextListQueryResult,
    receiveContextListTotal,
    subscribeToContextList,
    subscribeToContextListCallback,
    subscribeToContextListTotal,
    subscribeToContextListTotalCallback,
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
export function* watchSubscribeToContextListActions() {
    yield takeLatest(actionTypes.subscribeToContextList, handleSubscribeToContextList);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToContextListCallbackActions() {
    yield takeLatest(actionTypes.subscribeToContextListCallback, handleSubscribeToContextListCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromContextListActions() {
    yield takeLatest(actionTypes.unsubscribeFromContextList, handleUnsubscribeFromContextList);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToContextListTotalActions() {
    yield takeLatest(actionTypes.subscribeToContextListTotal, handleSubscribeToContextListTotal);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToContextListTotalCallbackActions() {
    yield takeLatest(actionTypes.subscribeToContextListTotalCallback, handleSubscribeToContextListTotalCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromContextListTotalActions() {
    yield takeLatest(actionTypes.unsubscribeFromContextListTotal, handleUnsubscribeFromContextListTotal);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleSubscribeToContextList(action) {
    try {
        const query = gql`
            subscription ($limit: Int, $offset: Int, $order_by: [context_order_by!]) {
                context (order_by: $order_by, limit: $limit, offset: $offset) {
                    context_id
                    name
                    model {
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
                    }
                }
            }
        `;

        const contextOrderBy = [];
        if (!action.sortBy || action.sortBy.length === 0) {
            contextOrderBy.push({model: {updated_model: {updated_at: 'desc_nulls_last'}}});
            contextOrderBy.push({model: {created_at: 'desc_nulls_last'}});
        } else {
            for (let i = 0; i < action.sortBy.length; i++) {
                const item = action.sortBy[i];
                const name = item.id;
                const desc = item.desc ? 'desc_nulls_last' : 'asc_nulls_last';

                if (name === 'model.name') {
                    contextOrderBy.push({model: {name: desc}});
                } else if (name === 'model.space.name') {
                    contextOrderBy.push({model: {space: {name: desc}}});
                } else if (name === 'model.updated_model.updated_at') {
                    contextOrderBy.push({model: {updated_model: {updated_at: desc}}});
                } else {
                    const orderItem = {};
                    orderItem[name] = desc;
                    contextOrderBy.push(orderItem);
                }
            }
        }

        const variables = {
            'limit': action.limit,
            'offset': action.offset,
            'order_by': contextOrderBy
        };

        yield put(subscribe(action, query, variables, subscribeToContextListCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToContextListCallback(action) {
    try {
        const {error, data} = action;

        if (!error && !data) {
            return; // Normal exit.
        }

        if (error) {
            handleWebsocketCallbackError(error);
            return;
        }

        yield put(receiveContextListQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromContextList() {
    yield put(unsubscribeAction(subscribeToContextList()));
}

function* handleSubscribeToContextListTotal(action) {
    try {
        const query = gql`
            subscription {
                context_aggregate {
                    aggregate {
                        total_count: count
                    }
                }
            }
        `;

        const variables = {};

        yield put(subscribe(action, query, variables, subscribeToContextListTotalCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToContextListTotalCallback(action) {
    try {
        const {error, data} = action;

        if (!error && !data) {
            return; // Normal exit.
        }

        if (error) {
            handleWebsocketCallbackError(error);
            return;
        }

        const total = data['context_aggregate']['aggregate']['total_count'];
        yield put(receiveContextListTotal(total));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromContextListTotal(/*action*/) {
    yield put(unsubscribeAction(subscribeToContextListTotal()));
}
