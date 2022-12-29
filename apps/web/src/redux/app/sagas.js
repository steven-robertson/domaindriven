import {select, takeLatest, put, call} from "redux-saga/effects";
import gql from "graphql-tag";
import {gqlFetch} from "../../graphql_fetch";
import {actionTypes, receivePrivacyPolicy, receiveTermsOfUse} from "./actions";
import {handleException} from "../../errors";

// -----------------------------------------------------------------------------
// Action watchers
// -----------------------------------------------------------------------------

// noinspection JSUnusedGlobalSymbols
export function* watchForRequestTermsOfUseActions() {
    yield takeLatest(actionTypes.requestTermsOfUse, handleRequestTermsOfUseActions);
}

// noinspection JSUnusedGlobalSymbols
export function* watchForRequestPrivacyPolicyActions() {
    yield takeLatest(actionTypes.requestPrivacyPolicy, handleRequestPrivacyPolicyActions);
}

// -----------------------------------------------------------------------------
// Action handlers
// -----------------------------------------------------------------------------

function* handleRequestTermsOfUseActions(_) {
    try {
        const query = gql`
            query {
                text(where: {name: {_eq: "terms-of-use"}, lang: {_eq: "en"}}) {
                    text
                }
            }
        `;

        const variables = {};
        const userId = yield select((state) => state.user.userId);
        const response = yield call(gqlFetch, userId, query, variables);
        console.assert(response?.data?.text, response);
        console.assert(response?.data?.text.length === 1, response);
        console.assert(response?.data?.text[0].text, response);
        yield put(receiveTermsOfUse(response.data.text[0].text));
    } catch (e) {
        handleException(e);
    }
}

function* handleRequestPrivacyPolicyActions(_) {
    try {
        const query = gql`
            query {
                text(where: {name: {_eq: "privacy-policy"}, lang: {_eq: "en"}}) {
                    text
                }
            }
        `;

        const variables = {};
        const userId = yield select((state) => state.user.userId);
        const response = yield call(gqlFetch, userId, query, variables);
        console.assert(response?.data?.text, response);
        console.assert(response?.data?.text.length === 1, response);
        console.assert(response?.data?.text[0].text, response);
        yield put(receivePrivacyPolicy(response.data.text[0].text));
    } catch (e) {
        handleException(e);
    }
}
