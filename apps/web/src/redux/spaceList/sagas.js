import {put, takeLatest} from "redux-saga/effects";
import gql from "graphql-tag";
import {
    actionTypes,
    receiveSpaceListQueryResult,
    receiveSpaceListTotal,
    subscribeToSpaceList,
    subscribeToSpaceListCallback,
    subscribeToSpaceListTotal,
    subscribeToSpaceListTotalCallback,
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
export function* watchSubscribeToSpaceListActions() {
    yield takeLatest(actionTypes.subscribeToSpaceList, handleSubscribeToSpaceList);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceListCallbackActions() {
    yield takeLatest(actionTypes.subscribeToSpaceListCallback, handleSubscribeToSpaceListCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromSpaceListActions() {
    yield takeLatest(actionTypes.unsubscribeFromSpaceList, handleUnsubscribeFromSpaceList);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceListTotalActions() {
    yield takeLatest(actionTypes.subscribeToSpaceListTotal, handleSubscribeToSpaceListTotal);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToSpaceListTotalCallbackActions() {
    yield takeLatest(actionTypes.subscribeToSpaceListTotalCallback, handleSubscribeToSpaceListTotalCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromSpaceListTotalActions() {
    yield takeLatest(actionTypes.unsubscribeFromSpaceListTotal, handleUnsubscribeFromSpaceListTotal);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleSubscribeToSpaceList(action) {
    try {
        const query = gql`
            subscription ($limit: Int, $offset: Int, $order_by: [space_order_by!]) {
                space (order_by: $order_by, limit: $limit, offset: $offset) {
                    space_id
                    name
                    created_at
                    updated_space {
                        updated_at
                    }
                    models_aggregate {
                        aggregate {
                            count
                        }
                    }
                    user_spaces_aggregate {
                        aggregate {
                            count
                        }
                    }
                }
            }
        `;

        const spaceOrderBy = [];
        if (!action.sortBy || action.sortBy.length === 0) {
            spaceOrderBy.push({updated_space: {updated_at: 'desc_nulls_last'}});
            spaceOrderBy.push({created_at: 'desc_nulls_last'});
        } else {
            for (let i = 0; i < action.sortBy.length; i++) {
                const item = action.sortBy[i];
                const name = item.id;
                const desc = item.desc ? 'desc_nulls_last' : 'asc_nulls_last';

                if (name === 'models_aggregate.aggregate.count') {
                    spaceOrderBy.push({models_aggregate: {count: desc}});
                } else if (name === 'user_spaces_aggregate.aggregate.count') {
                    spaceOrderBy.push({user_spaces_aggregate: {count: desc}});
                } else if (name === 'updated_space.updated_at') {
                    spaceOrderBy.push({updated_space: {updated_at: desc}});
                } else {
                    const orderItem = {};
                    orderItem[name] = desc;
                    spaceOrderBy.push(orderItem);
                }
            }
        }

        const variables = {
            'limit': action.limit,
            'offset': action.offset,
            'order_by': spaceOrderBy
        };

        yield put(subscribe(action, query, variables, subscribeToSpaceListCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToSpaceListCallback(action) {
    try {
        const {error, data} = action;

        if (!error && !data) {
            return; // Normal exit.
        }

        if (error) {
            handleWebsocketCallbackError(error);
            return;
        }

        yield put(receiveSpaceListQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromSpaceList() {
    yield put(unsubscribeAction(subscribeToSpaceList()));
}

function* handleSubscribeToSpaceListTotal(action) {
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

        yield put(subscribe(action, query, variables, subscribeToSpaceListTotalCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToSpaceListTotalCallback(action) {
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
        yield put(receiveSpaceListTotal(total));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromSpaceListTotal(/*action*/) {
    yield put(unsubscribeAction(subscribeToSpaceListTotal()));
}
