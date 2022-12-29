import {actionTypes} from "./actions";

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

/**
 * @type {{
 * spaceList: Object[],
 * spaceListTotal: number,
 * }}
 */
const initialState = {
    spaceList: undefined,
    spaceListTotal: undefined
};

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function reset() {
    return {...initialState}
}

function receiveSpaceListQueryResult(state, action) {
    return {
        ...state,
        spaceList: action.result.space
    }
}

function receiveSpaceListTotal(state, action) {
    return {
        ...state,
        spaceListTotal: action.total
    }
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

const actionsMap = {
    [actionTypes.reset]: reset,
    [actionTypes.receiveSpaceListQueryResult]: receiveSpaceListQueryResult,
    [actionTypes.receiveSpaceListTotal]: receiveSpaceListTotal,
};

export default function reducer(state = initialState, action) {
    const reducerFunction = actionsMap[action.type];
    return reducerFunction ? reducerFunction(state, action) : state;
}
