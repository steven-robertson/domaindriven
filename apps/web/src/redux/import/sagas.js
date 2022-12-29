import {takeLatest, put} from "redux-saga/effects";
import gql from "graphql-tag";
import {
    actionTypes,
    receiveContextTermsQueryResult,
    reset,
    subscribeToContextTerms,
    subscribeToContextTermsCallback,
} from "./actions";
import {
    subscribe,
    subscribeAction,
    unsubscribeAction,
} from "../subscriber/actions";
import {handleError, handleException, handleWebsocketCallbackError} from "../../errors";

// -----------------------------------------------------------------------------
// Action watchers
// -----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToContextTermsActions() {
    yield takeLatest(actionTypes.subscribeToContextTerms, handleSubscribeToContextTerms);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToContextTermsCallbackActions() {
    yield takeLatest(actionTypes.subscribeToContextTermsCallback, handleSubscribeToContextTermsCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromContextTermsActions() {
    yield takeLatest(actionTypes.unsubscribeFromContextTerms, handleUnsubscribeFromContextTerms);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleSubscribeToContextTerms(action) {
    try {
        const query = gql`
            subscription ($context_id: uuid!) {
                context_by_pk(context_id: $context_id) {
                    terms(order_by: {name: asc}) {
                        term_id
                        name
                        classname
                        definition
                        todo
                    }
                    relations {
                        from_term_id
                        from_multiplier_id
                        to_term_id
                        to_multiplier_id
                    }
                }
            }
        `;

        const variables = {
            'context_id': action.id
        };

        yield put(subscribe(action, query, variables, subscribeToContextTermsCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToContextTermsCallback(action) {
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
        if (!data.context_by_pk) {
            handleError('Context not found');
            return;
        }

        yield put(receiveContextTermsQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromContextTerms() {
    yield put(unsubscribeAction(subscribeToContextTerms(undefined)));
    yield put(reset());
}
