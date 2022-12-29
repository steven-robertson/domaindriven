import {actionTypes} from "./actions";

// -----------------------------------------------------------------------------
// Initial state
// -----------------------------------------------------------------------------

/**
 * @type {{
 * userId: string,
 * roles: string[],
 * isAdmin: boolean,
 * name: string,
 * personalSpaceId: string,
 * spaces: Object[],
 * }}
 */
const initialState = {
    userId: undefined,
    roles: undefined,
    isAdmin: false,
    name: undefined,
    personalSpaceId: undefined,
    spaces: undefined
};

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

function setAuthInfo(state, action) {
    let isAdmin = false;
    const roles = action.info.roles;
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].endsWith('-admin')) {
            isAdmin = true;
        }
    }

    return {
        ...state,
        userId: action.info.userId,
        roles,
        isAdmin
    };
}

function receiveUserInfoQueryResult(state, action) {

    // noinspection JSUnresolvedVariable
    const user = action.result?.user_by_pk;
    console.assert(user != null, 'result is null');

    // noinspection JSUnresolvedVariable
    const personalSpaceId = user.personal_space_id;

    // noinspection JSUnresolvedVariable
    const userSpaces = user.user_spaces;
    const spaces = [];
    if (userSpaces) {
        for (let i = 0; i < userSpaces.length; i++) {
            spaces.push(userSpaces[i].space);
        }
    }

    return {
        ...state,
        name: user.name,
        personalSpaceId,
        spaces
    }
}

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

const actionsMap = {
    [actionTypes.setAuthInfo]: setAuthInfo,
    [actionTypes.receiveUserInfoQueryResult]: receiveUserInfoQueryResult,
};

export default function reducer(state = initialState, action) {
    const reducerFunction = actionsMap[action.type];
    return reducerFunction ? reducerFunction(state, action) : state;
}
