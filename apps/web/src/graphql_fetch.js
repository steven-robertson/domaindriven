import axios from "axios";
import {print} from "graphql";
import {getAuthToken, isExpired, refreshToken} from "./auth";
import Constants from "./constants";
import {handleError} from "./errors";

/**
 * @param userId {string}
 * @param query {any}
 * @param variables {Object}
 * @param headers {Object}
 */
export async function gqlFetch(userId, query, variables, headers) {
    if (!userId) {
        return fetchWithToken(null, query, variables, headers);
    }

    const jwt = getAuthToken();

    if (isExpired(jwt)) {
        return refreshToken().then(jwt => fetchWithToken(jwt, query, variables, headers));
    }

    return fetchWithToken(jwt, query, variables, headers);
}

/**
 * @param jwt {string|null}
 * @param query {any}
 * @param variables {Object}
 * @param headers {Object}
 */
function fetchWithToken(jwt, query, variables, headers) {
    headers = headers || {};
    headers['Content-Type'] = 'application/json';
    if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

    return axios.post(Constants.graphQlEndpoint, {
        query: query instanceof Object ? print(query) : query,
        variables,
    }, {
        headers
    }).then(response => {
        console.assert(response && response.data, response);

        if (response.data.errors) {
            let msg;
            if (response.data.errors && response.data.errors.length === 1) {
                msg = `GraphQL: ${response.data.errors[0].message}`;
            } else {
                msg = 'GraphQL Errors';
            }

            handleError(msg, response.data.errors);
            return;
        }

        return response.data;
    }).catch(e => {
        handleError('GraphQL Query Exception', e?.details?.errors || e);
    });
}
