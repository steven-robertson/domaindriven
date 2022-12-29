import axios from "axios";
import {put, takeLatest} from "redux-saga/effects";
import {handleError, handleException, handleRequestException, handleWebsocketCallbackError} from "../../errors";
import {actionTypes, setAuthInfo} from "./actions";
import {
    receiveUserInfoQueryResult,
    resetUserInfo,
    subscribeToUserInfo,
    subscribeToUserInfoCallback
} from "./actions";
import Constants from "../../constants";
import {login} from "../../auth";
import gql from "graphql-tag";
import {subscribe, subscribeAction, unsubscribeAction} from "../subscriber/actions";

// -----------------------------------------------------------------------------
// Action watchers
// -----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
export function* watchForGetAuthInfoActions() {
    yield takeLatest(actionTypes.getAuthInfo, handleGetAuthInfo);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToUserInfoActions() {
    yield takeLatest(actionTypes.subscribeToUserInfo, handleSubscribeToUserInfo);
}

// noinspection JSUnusedGlobalSymbols
export function* watchSubscribeToUserInfoCallbackActions() {
    yield takeLatest(actionTypes.subscribeToUserInfoCallback, handleSubscribeToUserInfoCallback);
}

// noinspection JSUnusedGlobalSymbols
export function* watchUnsubscribeFromUserInfoActions() {
    yield takeLatest(actionTypes.unsubscribeFromUserInfo, handleUnsubscribeFromUserInfo);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleGetAuthInfo() {
    try {
        // NOTE: The following request uses an HTTP-only cookie server-side.
        const response = yield axios.get(`${Constants.authBase}/me`, {withCredentials: true});
        yield put(setAuthInfo(response.data));
    } catch (e) {
        if (e.response && e.response.status === 401) {
            login();
        } else {
            handleRequestException(e);
        }
    }
}

function* handleSubscribeToUserInfo(action) {
    try {
        const query = gql`
            subscription ($user_id: uuid!) {
                user_by_pk(user_id: $user_id) {
                    user_id
                    personal_space_id
                    name
                    user_spaces(order_by: {space: {name: asc}}) {
                        space {
                            space_id
                            name
                        }
                    }
                }
            }
        `;

        const variables = {
            user_id: action.id
        };

        yield put(subscribe(action, query, variables, subscribeToUserInfoCallback));
        yield put(subscribeAction(action));

    } catch (e) {
        handleException(e);
    }
}

function* handleSubscribeToUserInfoCallback(action) {
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
        if (!data.user_by_pk) {
            handleError('User not found');
            return;
        }

        yield put(receiveUserInfoQueryResult(data));

    } catch (e) {
        handleException(e);
    }
}

function* handleUnsubscribeFromUserInfo() {
    yield put(unsubscribeAction(subscribeToUserInfo()));
    yield put(resetUserInfo());
}
