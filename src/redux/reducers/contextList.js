import {actionTypes} from "../actions/contextList";

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

/**
 * @type {{
 * contextList: Object[],
 * contextListTotal: number,
 * }}
 */
const initialState = {
    contextList: undefined,
    contextListTotal: undefined
};

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function reset() {
    return {...initialState}
}

function receiveContextListQueryResult(state, action) {
    return {
        ...state,
        contextList: action.result.context
    }
}

function receiveContextListTotal(state, action) {
    return {
        ...state,
        contextListTotal: action.total
    }
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

const actionsMap = {
    [actionTypes.reset]: reset,
    [actionTypes.receiveContextListQueryResult]: receiveContextListQueryResult,
    [actionTypes.receiveContextListTotal]: receiveContextListTotal,
};

export default function reducer(state = initialState, action) {
    const reducerFunction = actionsMap[action.type];
    return reducerFunction ? reducerFunction(state, action) : state;
}
