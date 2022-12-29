import {actionTypes} from "./actions";

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

/**
 * @type {{
 * modelList: Object[],
 * modelListTotal: number,
 * }}
 */
const initialState = {
    modelList: undefined,
    modelListTotal: undefined
};

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function reset() {
    return {...initialState}
}

function receiveModelListQueryResult(state, action) {
    return {
        ...state,
        modelList: action.result.model
    }
}

function receiveModelListTotal(state, action) {
    return {
        ...state,
        modelListTotal: action.total
    }
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

const actionsMap = {
    [actionTypes.reset]: reset,
    [actionTypes.receiveModelListQueryResult]: receiveModelListQueryResult,
    [actionTypes.receiveModelListTotal]: receiveModelListTotal,
};

export default function reducer(state = initialState, action) {
    const reducerFunction = actionsMap[action.type];
    return reducerFunction ? reducerFunction(state, action) : state;
}
