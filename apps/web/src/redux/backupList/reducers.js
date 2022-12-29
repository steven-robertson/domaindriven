import {actionTypes} from "./actions";

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

/**
 * @type {{
 * backupList: Object[],
 * backupListTotal: number,
 * }}
 */
const initialState = {
    backupList: undefined,
    backupListTotal: undefined
};

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function reset() {
    return {...initialState}
}

function receiveBackupListQueryResult(state, action) {
    // noinspection JSUnresolvedVariable
    const backupList = action.result.backup;
    return { ...state, backupList }
}

function receiveBackupListTotal(state, action) {
    return {
        ...state,
        backupListTotal: action.total
    }
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

const actionsMap = {
    [actionTypes.reset]: reset,
    [actionTypes.receiveBackupListQueryResult]: receiveBackupListQueryResult,
    [actionTypes.receiveBackupListTotal]: receiveBackupListTotal,
};

export default function reducer(state = initialState, action) {
    const reducerFunction = actionsMap[action.type];
    return reducerFunction ? reducerFunction(state, action) : state;
}
