import {actionTypes} from "../actions/import";

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

/**
 * @type {{
 * terms: Object[],
 * relations: Object[]
 * }}
 */
const initialState = {
    terms: undefined,
    relations: undefined
};

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function reset() {
    return {...initialState}
}

function receiveContextTermsQueryResult(state, action) {

    // noinspection JSUnresolvedVariable
    const context = action.result?.context_by_pk;
    console.assert(context != null, 'result is null');

    return {
        ...state,
        terms: context.terms,
        relations: context.relations
    }
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

const actionsMap = {
    [actionTypes.reset]: reset,
    [actionTypes.receiveContextTermsQueryResult]: receiveContextTermsQueryResult,
};

export default function reducer(state = initialState, action) {
    const reducerFunction = actionsMap[action.type];
    return reducerFunction ? reducerFunction(state, action) : state;
}
