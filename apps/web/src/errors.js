import {store} from "./redux/store";
import {actions} from "./redux/error/actions";

/**
 * @param title {string}
 * @param data {Object=}
 */
export function handleError(title, data) {
    console.error(title, data);
    store.dispatch(actions(title));
}

/**
 * @param data {Object}
 */
export function handleWebsocketCallbackError(data) {
    const title = 'Websocket callback error';
    if (data?.details?.errors && data.details.errors.length > 0 ) {
        const msg = `${title} (${data.details.errors[0].message})`;
        console.error(msg)
        store.dispatch(actions(msg));
    } else {
        console.error(title, data);
        store.dispatch(actions(title));
    }
}

/**
 * @param e {Object}
 */
export function handleException(e) {
    console.error(e);
    store.dispatch(actions(`[Exception] ${e}`));
}

/**
 * @param e {Object}
 */
export function handleRequestException(e) {
    console.error(e);
    const {title, description} = getRequestError(e);
    store.dispatch(actions(`${title}. ${description}`));
}

/**
 * @param e {Object}
 * @return {{description: string, title: string}}
 */
function getRequestError(e) {
    if (e && e.response && e.response.status) {

        // See https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
        const statusCode = e.response.status;

        switch (statusCode) {
            case 400: return {
                title: 'Bad Request',
                description: e.response.data
            };

            case 409: return {
                title: 'Conflict',
                description: e.response.data
            };

            case 500: return {
                title: 'Internal Server Error',
                description: 'The server reported an error. It was not ' +
                    'possible to complete the request at this time.'
            };

            default: return {
                title: `HTTP Error: ${statusCode}`,
                description: e.response.data
            }
        }
    }

    return {
        title: 'Server Request Failed',
        description: 'Unexpected exception error when making the request.'
    }
}
