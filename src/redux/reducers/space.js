import {actionTypes} from "../actions/space";

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

/**
 * @type {{
 * id: string,
 * name: string,
 * info: string,
 * userList: Object[],
 * userListTotal: number
 * }}
 */
const initialState = {
    id: undefined,
    name: undefined,
    info: undefined,
    userList: undefined,
    userListTotal: undefined
};

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function reset() {
    return {...initialState}
}

function receiveSpaceQueryResult(state, action) {

    // noinspection JSUnresolvedVariable
    const space = action.result?.space_by_pk;
    console.assert(space != null, 'result is null');

    return {
        ...state,
        id: space.space_id,
        name: space.name,
        info: space.info
    }
}

function receiveSpaceUsersQueryResult(state, action) {

    // noinspection JSUnresolvedVariable
    const space = action.result?.space_by_pk;
    console.assert(space != null, 'result is null');

    const userList = [];

    // noinspection JSUnresolvedVariable
    const userSpaces = space.user_spaces;
    for (let i = 0; i < userSpaces.length; i++) {
        const user = userSpaces[i];
        userList.push(user);
    }

    return {...state, userList}
}

function receiveSpaceUsersTotal(state, action) {
    return {
        ...state,
        userListTotal: action.total
    }
}

function receiveSpaceModelsQueryResult(state, action) {

    // noinspection JSUnresolvedVariable
    const space = action.result?.space_by_pk;
    console.assert(space != null, 'result is null');

    const modelList = [];

    // noinspection JSUnresolvedVariable
    const models = space.models;
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        modelList.push(model);
    }

    return {...state, modelList}
}

function receiveSpaceModelsTotal(state, action) {
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
    [actionTypes.receiveSpaceQueryResult]: receiveSpaceQueryResult,
    [actionTypes.receiveSpaceUsersQueryResult]: receiveSpaceUsersQueryResult,
    [actionTypes.receiveSpaceUsersTotal]: receiveSpaceUsersTotal,
    [actionTypes.receiveSpaceModelsQueryResult]: receiveSpaceModelsQueryResult,
    [actionTypes.receiveSpaceModelsTotal]: receiveSpaceModelsTotal,
};

export default function reducer(state = initialState, action) {
    const reducerFunction = actionsMap[action.type];
    return reducerFunction ? reducerFunction(state, action) : state;
}
